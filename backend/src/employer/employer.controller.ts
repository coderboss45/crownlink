import { Controller, Post, Body } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { PostmarkService } from "../postmark/postmark.service";
import { MoodleService } from "../moodle/moodle.service";
import * as bcrypt from "bcrypt";
import { credentialsEmail } from "../email/templates";

@Controller("employer")
export class EmployerController {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
    private postmark: PostmarkService,
    private moodle: MoodleService,
  ) {}

  @Post("enroll")
  async enroll(@Body() body: { emails: string[]; courseId: string }) {
    const course = await this.prisma.course.findUnique({
      where: { id: body.courseId },
    });
    const results: any[] = [];
    for (const email of body.emails) {
      let user = await this.users.findByEmail(email);
      let plain = "";
      if (!user) {
        plain = Math.random().toString(36).slice(2, 10);
        const hash = await bcrypt.hash(plain, 10);
        const username = email.split("@")[0];
        user = await this.users.createUser(
          username,
          email,
          hash,
          "",
          "employer",
        );
        // create moodle user if configured
        try {
          await this.moodle.createUser(username, plain, email, "", "");
        } catch (e) {
          /* ignore */
        }
      }
      // create enrollment
      const enr = await this.prisma.enrollment.create({
        data: { userId: user.id, courseId: body.courseId },
      });
      // send credentials email
      const tpl = credentialsEmail(
        email,
        plain || "(existing account)",
        course?.title || "Course",
      );
      try {
        await this.postmark.send(email, tpl.subject, tpl.html);
      } catch (e) {
        /* log */
      }
      results.push({ email, userId: user.id, enrollmentId: enr.id });
    }
    return { ok: true, results };
  }
}
