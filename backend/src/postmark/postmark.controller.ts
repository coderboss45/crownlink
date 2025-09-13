import { Controller, Post, Body } from "@nestjs/common";
import { PostmarkService } from "./postmark.service";
import {
  credentialsEmail,
  welcomeEmail,
  paymentReceipt,
} from "../email/templates";

@Controller("email")
export class PostmarkController {
  constructor(private postmark: PostmarkService) {}

  @Post("welcome")
  async sendWelcome(@Body() body: { to: string; name?: string }) {
    const tpl = welcomeEmail(body.name || "", body.to);
    return this.postmark.send(body.to, tpl.subject, tpl.text);
  }

  @Post("credentials")
  async sendCredentials(
    @Body() body: { to: string; password: string; courseTitle: string },
  ) {
    const tpl = credentialsEmail(body.to, body.password, body.courseTitle);
    return this.postmark.send(body.to, tpl.subject, tpl.html);
  }

  @Post("receipt")
  async sendReceipt(
    @Body()
    body: {
      to: string;
      amountCents: number;
      currency: string;
      courseTitle: string;
    },
  ) {
    const tpl = paymentReceipt(
      body.to,
      body.amountCents,
      body.currency,
      body.courseTitle,
    );
    return this.postmark.send(body.to, tpl.subject, tpl.html);
  }
}
