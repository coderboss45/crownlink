import {
  Controller,
  Get,
  UseGuards,
  Req,
  ForbiddenException,
  Post,
  Body,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { MoodleService } from "../moodle/moodle.service";

@Controller("admin")
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private moodle: MoodleService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("enrollments")
  async listEnrollments(@Req() req: any) {
    if (req.user.role !== "admin") throw new ForbiddenException();
    return this.prisma.enrollment.findMany({
      include: { user: true, course: true },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("payments")
  async listPayments(@Req() req: any) {
    if (req.user.role !== "admin") throw new ForbiddenException();
    return this.prisma.payment.findMany({ include: { user: true } });
  }

  @UseGuards(JwtAuthGuard)
  @Get("summary")
  async summary(@Req() req: any) {
    if (req.user.role !== "admin") throw new ForbiddenException();
    const users = await this.prisma.user.count();
    const courses = await this.prisma.course.count();
    const enrollments = await this.prisma.enrollment.count();
    const payments = await this.prisma.payment.count();
    return { users, courses, enrollments, payments };
  }

  // Admin: enroll a user into a course
  @UseGuards(JwtAuthGuard)
  @Post("enroll")
  async enrollUser(
    @Req() req: any,
    @Body() body: { userId: string; courseId: string },
  ) {
    if (req.user.role !== "admin") throw new ForbiddenException();

    const { userId, courseId } = body;
    if (!userId || !courseId) return { error: "invalid_body" } as any;

    // If enrollment exists, return ok
    let enr = await this.prisma.enrollment.findFirst({
      where: { userId, courseId },
    });
    if (!enr) {
      enr = await this.prisma.enrollment.create({
        data: { userId, courseId } as any,
      });
      // Best-effort Moodle enrol
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        const course = await this.prisma.course.findUnique({
          where: { id: courseId },
        });
        if (user && course?.moodleCourseId) {
          await this.moodle.createOrUpdateUserByEmail({
            username: user.username || user.email.split("@")[0],
            password: Math.random().toString(36).slice(2),
            email: user.email,
            firstname: user.name || user.username,
            lastname: "",
            role: user.role,
          });
          const md = await this.moodle.getUserByField("email", user.email);
          const moodleUserId =
            md && Array.isArray(md) && md.length ? md[0].id : null;
          if (moodleUserId) {
            const roleId = Number(process.env.MOODLE_STUDENT_ROLE_ID || "5");
            await this.moodle.enrolUser(
              moodleUserId,
              course.moodleCourseId,
              roleId,
            );
          }
        }
      } catch (e) {
        // ignore moodle errors
      }
    }

    return { ok: true, enrollmentId: enr.id };
  }
}
