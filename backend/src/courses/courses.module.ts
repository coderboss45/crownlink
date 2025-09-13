import { Module } from "@nestjs/common";
import { CoursesController } from "./courses.controller";
import { PrismaService } from "../prisma/prisma.service";
import { MoodleModule } from "../moodle/moodle.module";

@Module({
  imports: [MoodleModule],
  controllers: [CoursesController],
  providers: [PrismaService],
})
export class CoursesModule {}
