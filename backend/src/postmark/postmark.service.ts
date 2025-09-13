import { Injectable, Logger } from "@nestjs/common";
import fetch from "node-fetch";

@Injectable()
export class PostmarkService {
  private logger = new Logger(PostmarkService.name);

  async send(
    to: string,
    subject: string,
    content: string,
    textFallback?: string,
  ) {
    const token = process.env.POSTMARK_API_TOKEN;
    if (!token) {
      this.logger.warn("Postmark not configured");
      return null;
    }
    const isHtml = /<[^>]+>/.test(content);
    const payload: any = {
      From: process.env.POSTMARK_FROM || "noreply@crownlinks.academy",
      To: to,
      Subject: subject,
    };
    if (isHtml) {
      payload.HtmlBody = content;
      payload.TextBody = textFallback || content.replace(/<[^>]+>/g, "");
    } else {
      payload.TextBody = content;
    }
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.Message || "Postmark error");
    return json;
  }
}
