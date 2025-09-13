import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller('moodle')
export class MoodleLaunchController {
  constructor(private prisma: PrismaService) {}

  @Get('launch')
  async launch(@Req() req: any, @Res() res: any, @Query('courseId') courseId: string) {
    if (!req.user) {
      const returnTo = req.originalUrl;
      return res.redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !course.moodleCourseId) return res.status(404).send('Course not found');
    const moodleUrl = `${process.env.MOODLE_BASE_URL}/course/view.php?id=${course.moodleCourseId}`;
    return res.redirect(moodleUrl);
  }
}
