import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { PrismaService } from "../prisma/prisma.service";
import { MoodleModule } from "../moodle/moodle.module";

@Module({
  imports: [MoodleModule],
  controllers: [AdminController],
  providers: [PrismaService],
})
export class AdminModule {}
