import { Controller, Get, UseGuards, Req, Post, Param } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { MoodleService } from "../moodle/moodle.service";

@Controller("enrollments")
export class EnrollmentsController {
  constructor(private prisma: PrismaService, private moodle: MoodleService) {}

  @UseGuards(JwtAuthGuard)
  @Get("")
  async list(@Req() req: any) {
    const user = req.user;
    if (user.role === "admin") {
      return this.prisma.enrollment.findMany({
        include: { user: true, course: true },
        orderBy: { createdAt: "desc" },
      });
    }
    return this.prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/sync")
  async sync(@Req() req: any, @Param("id") id: string) {
    const enr = await this.prisma.enrollment.findUnique({ where: { id }, include: { course: true, user: true } });
    if (!enr) return { error: "not_found" } as any;
    if (req.user.role !== "admin" && req.user.id !== enr.userId) return { error: "forbidden" } as any;
    if (!enr.course?.moodleCourseId) return { error: "course_not_linked" } as any;

    try {
      const md = await this.moodle.getUserByField('email', enr.user.email);
      const moodleUserId = md && Array.isArray(md) && md.length ? md[0].id : null;
      if (!moodleUserId) return { error: "moodle_user_not_found" } as any;

      const completed = await this.moodle.getCourseCompletionStatus(Number(moodleUserId), Number(enr.course.moodleCourseId));
      if (completed) {
        await this.prisma.enrollment.update({ where: { id: enr.id }, data: { progressPercent: 100, status: 'completed' } });
      }
      const updated = await this.prisma.enrollment.findUnique({ where: { id: enr.id } });
      return { ok: true, enrollment: updated };
    } catch (e) {
      return { error: 'sync_failed' } as any;
    }
  }
}
