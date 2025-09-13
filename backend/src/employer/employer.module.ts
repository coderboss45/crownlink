import { Module } from "@nestjs/common";
import { EmployerController } from "./employer.controller";
import { PrismaService } from "../prisma/prisma.service";
import { UsersModule } from "../users/users.module";
import { PostmarkModule } from "../postmark/postmark.module";
import { MoodleModule } from "../moodle/moodle.module";

@Module({
  imports: [UsersModule, PostmarkModule, MoodleModule],
  controllers: [EmployerController],
  providers: [PrismaService],
})
export class EmployerModule {}
