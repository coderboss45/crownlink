import { Module } from "@nestjs/common";
import { StripeController } from "./stripe.controller";
import { PrismaService } from "../prisma/prisma.service";
import { PostmarkModule } from "../postmark/postmark.module";
import { MoodleModule } from "../moodle/moodle.module";

@Module({
  controllers: [StripeController],
  providers: [PrismaService],
  imports: [PostmarkModule, MoodleModule],
})
export class StripeModule {}
