import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Req,
  Put,
  Delete,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { MoodleService } from "../moodle/moodle.service";

@Controller("courses")
export class CoursesController {
  constructor(
    private prisma: PrismaService,
    private moodle: MoodleService,
  ) {}

  @Get("")
  async list() {
    const courses = await this.prisma.course.findMany({
      where: { published: true },
    });
    return courses;
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) return { error: "not_found" };
    return course;
  }

  // Admin: create course
  @UseGuards(JwtAuthGuard)
  @Post("")
  async create(
    @Req() req: any,
    @Body()
    body: {
      title: string;
      description?: string;
      priceCents?: number;
      published?: boolean;
      moodleCourseId?: number;
      duration?: string;
      whatYouWillLearn?: string;
      whoIsFor?: string;
      img?: string;
    },
  ) {
    if (req.user.role !== "admin") throw new ForbiddenException();
    const course = await this.prisma.course.create({
      data: {
        title: body.title,
        description: body.description || "",
        priceCents: body.priceCents || 0,
        published: body.published ?? true,
        moodleCourseId: body.moodleCourseId,
        duration: body.duration,
        whatYouWillLearn: body.whatYouWillLearn,
        whoIsFor: body.whoIsFor,
        img: body.img,
      },
    });
    return course;
  }

  // Admin: update
  @UseGuards(JwtAuthGuard)
  @Put(":id")
  async update(@Req() req: any, @Param("id") id: string, @Body() body: any) {
    if (req.user.role !== "admin") throw new ForbiddenException();
    const course = await this.prisma.course.update({
      where: { id },
      data: body,
    });
    return course;
  }

  // Admin: delete
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async remove(@Req() req: any, @Param("id") id: string) {
    if (req.user.role !== "admin") throw new ForbiddenException();
    await this.prisma.course.delete({ where: { id } });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post("/enroll")
  async enroll(@Req() req: any, @Body() body: { courseId: string }) {
    const userId = req.user.id;
    // create enrollment record
    const enr = await this.prisma.enrollment.create({
      data: { userId, courseId: body.courseId },
    });

    // best-effort: try to enrol user in moodle if configured and course has moodleId
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const course = await this.prisma.course.findUnique({
        where: { id: body.courseId },
      });
      if (user && course && course.moodleCourseId) {
        // attempt to create/update moodle user and enrol
        try {
          await this.moodle.createOrUpdateUserByEmail({
            username: user.email.split("@")[0],
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
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }

    return { ok: true, enrollmentId: enr.id };
  }
}
