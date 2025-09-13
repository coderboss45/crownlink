import { Controller, Post, Req, Res, Body, Headers } from "@nestjs/common";
import Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service";
import { PostmarkService } from "../postmark/postmark.service";
import { MoodleService } from "../moodle/moodle.service";

@Controller("api")
export class StripeController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-06-20" as any,
  });
  constructor(
    private prisma: PrismaService,
    private postmark: PostmarkService,
    private moodle: MoodleService,
  ) {}

  @Post("checkout")
  async checkout(
    @Body()
    body: {
      priceCents: number;
      currency: string;
      courseId: string;
      email?: string;
    },
    @Req() req: any,
    @Res() res: any,
  ) {
    if (!process.env.STRIPE_SECRET_KEY)
      return res.status(501).json({ error: "Stripe not configured" });
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: body.currency,
            product_data: { name: `Course ${body.courseId}` },
            unit_amount: body.priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: (req.headers.origin || "") + "/learner?payment=success",
      cancel_url: (req.headers.origin || "") + "/learner?payment=cancel",
      metadata: { courseId: body.courseId, email: body.email || "" },
    });

    // create pending payment record
    try {
      await this.prisma.payment.create({
        data: {
          userId: body.email ? body.email : "anonymous",
          amountCents: body.priceCents,
          currency: body.currency,
          provider: "stripe",
          providerId: session.id,
        } as any,
      });
    } catch (e) {
      // ignore
    }

    return res.json({ id: session.id, url: session.url });
  }

  @Post("stripe/webhook")
  async webhook(
    @Req() req: any,
    @Res() res: any,
    @Headers("stripe-signature") signature: string,
  ) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return res.status(501).send("No webhook configured");
    const payload = req.rawBody || req.body;
    let event: any;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (e: any) {
      return res.status(400).send(`Webhook error: ${e.message}`);
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // update payment
      const providerId = session.id;
      try {
        await this.prisma.payment.updateMany({
          where: { providerId },
          data: { status: "succeeded" as any },
        });
      } catch (e) {}
      // send receipt if email present in metadata
      const email = session.metadata?.email;
      const courseId = session.metadata?.courseId;
      if (email && courseId) {
        try {
          const course = await this.prisma.course.findUnique({
            where: { id: courseId },
          });

          // attach payment to user if user exists
          const user = await this.prisma.user.findUnique({ where: { email } });
          if (user) {
            try {
              await this.prisma.payment.updateMany({
                where: { providerId },
                data: { userId: user.id } as any,
              });
            } catch (e) {}

            // create enrollment if not exists
            try {
              const existing = await this.prisma.enrollment.findFirst({ where: { userId: user.id, courseId } });
              let enr: any = existing;
              if (!existing) {
                enr = await this.prisma.enrollment.create({ data: { userId: user.id, courseId } as any });
              }

              // ensure moodle user exists and enrol
              try {
                await this.moodle.createOrUpdateUserByEmail({ username: user.username, password: user.password || Math.random().toString(36).slice(2), email: user.email, firstname: user.name || user.username, lastname: "", role: user.role });
                const md = await this.moodle.getUserByField('email', user.email);
                const moodleUserId = md && Array.isArray(md) && md.length ? md[0].id : null;
                if (moodleUserId && course?.moodleCourseId) {
                  const roleId = Number(process.env.MOODLE_STUDENT_ROLE_ID || '5');
                  await this.moodle.enrolUser(moodleUserId, course.moodleCourseId, roleId);
                  // optionally update enrollment with moodleEnrollmentId if returned (not returned by manual enrol)
                }
              } catch (e) {
                // ignore moodle errors
              }
            } catch (e) {}
          }

          // send receipt email
          await this.postmark.send(
            email,
            `Payment received for ${course?.title || "Course"}`,
            `We received payment of ${(session.amount_total / 100).toFixed(2)} ${session.currency} for ${course?.title || "Course"}`,
          );
        } catch (e) {
          // ignore errors to keep webhook resilient
        }
      }
    }
    res.json({ received: true });
  }
}
