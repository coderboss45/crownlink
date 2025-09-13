import { Module } from "@nestjs/common";
import { PostmarkService } from "./postmark.service";
import { PostmarkController } from "./postmark.controller";

@Module({
  providers: [PostmarkService],
  controllers: [PostmarkController],
  exports: [PostmarkService],
})
export class PostmarkModule {}
