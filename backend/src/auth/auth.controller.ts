import { Controller, Post, Body, Res, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { PostmarkService } from "../postmark/postmark.service";
import { MoodleService } from "../moodle/moodle.service";
import { welcomeEmail, otpEmail, resetPasswordEmail } from "../email/templates";
import { UsersService } from "../users/users.service";
import * as jwt from "jsonwebtoken";

@Controller("auth")
export class AuthController {
  constructor(
    private auth: AuthService,
    private postmark: PostmarkService,
    private moodle: MoodleService,
    private users: UsersService,
  ) {}

  // Step 1: register -> create pending user and send OTP
  @Post("/register")
  async register(
    @Body()
    body: {
      username: string;
      email: string;
      password: string;
      name?: string;
      role?: string;
    },
    @Res() res: Response,
  ) {
    const role = body.role === "employer" ? "employer" : "learner";

    // basic uniqueness checks
    if (await this.users.findByEmail(body.email)) {
      return res.status(400).json({ error: "Email already in use" });
    }
    if (await this.users.findByUsername(body.username)) {
      return res.status(400).json({ error: "Username already in use" });
    }

    // password policy enforced server-side
    const pw = body.password || "";
    const pwRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;
    if (!pwRegex.test(pw)) {
      return res
        .status(400)
        .json({ error: "Password does not meet complexity requirements" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    // store pending user (password stored temporarily in plain to allow moodle creation)
    await this.users.createPendingUser({
      username: body.username,
      email: body.email,
      password: body.password,
      name: body.name,
      role: role as any,
      otp,
      otpExpiry: expiry,
    });

    // send OTP email
    try {
      const { subject, html, text } = otpEmail(body.email, otp);
      await this.postmark.send(body.email, subject, html, text);
    } catch (e) {
      // ignore
    }

    return res.json({ ok: true });
  }

  // Step 2: verify OTP -> create real user, moodle account, welcome email and login
  @Post("/verify-otp")
  async verifyOtp(
    @Body() body: { username: string; otp: string },
    @Res() res: Response,
  ) {
    const pending = await this.users.findPendingByUsername(body.username);
    if (!pending)
      return res.status(400).json({ error: "Pending registration not found" });
    if (pending.otp !== body.otp)
      return res.status(400).json({ error: "Invalid code" });
    if (pending.otpExpiry < new Date())
      return res.status(400).json({ error: "Code expired" });

    // create user (hash password)
    const bcrypt = require("bcrypt");
    const hash = await bcrypt.hash(pending.password, 10);
    const user = await this.users.createUser(
      pending.username,
      pending.email,
      hash,
      pending.name,
      pending.role as any,
    );

    // cleanup pending
    try {
      await this.users.deletePendingById(pending.id);
    } catch (e) {}

    // create or update moodle account (best effort) using plain password stored in pending
    try {
      await this.moodle.createOrUpdateUserByEmail({
        username: pending.username,
        password: pending.password,
        email: pending.email,
        firstname: pending.name || pending.username,
        lastname: "",
        role: pending.role as any,
      });
    } catch (e) {
      // ignore
    }

    // send welcome email
    try {
      const tpl = welcomeEmail(pending.name || "", pending.email);
      await this.postmark.send(pending.email, tpl.subject, tpl.html);
    } catch (e) {
      // ignore
    }

    // login and set cookie
    const token = await this.auth.login(user);
    res.cookie("jwt", token.access_token, { httpOnly: true, sameSite: "lax" });

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  }

  @Post("/login")
  async login(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    const user = await this.auth.validateUser(body.username, body.password);
    if (!user) {
      try {
        const isEmail = (body.username || "").includes("@");
        const pending = isEmail
          ? await this.users.findPendingByEmail(body.username)
          : await this.users.findPendingByUsername(body.username);
        if (pending) {
          return res
            .status(403)
            .json({
              error: "pending_verification",
              pending: true,
              username: pending.username,
            });
        }
      } catch (e) {}
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = await this.auth.login(user);
    res.cookie("jwt", token.access_token, { httpOnly: true, sameSite: "lax" });
    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  }

  @Post("/forgot-password")
  async forgotPassword(
    @Body() body: { email: string },
    @Req() req: any,
    @Res() res: Response,
  ) {
    const user = await this.users.findByEmail(body.email);
    if (!user) return res.json({ ok: true }); // do not reveal existence

    const secret = process.env.JWT_SECRET || "devsecret";
    const token = jwt.sign(
      { sub: user.id, email: user.email, type: "reset" },
      secret,
      { expiresIn: "1h" },
    );

    const origin =
      process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const link = `${origin}/auth/reset-password?token=${encodeURIComponent(token)}`;

    try {
      const tpl = resetPasswordEmail(user.email, link);
      await this.postmark.send(user.email, tpl.subject, tpl.html, tpl.text);
    } catch (e) {
      // ignore email errors
    }

    return res.json({ ok: true });
  }

  @Post("/reset-password")
  async resetPassword(
    @Body() body: { token: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const pw = body.password || "";
      const pwRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;
      if (!pwRegex.test(pw)) {
        return res
          .status(400)
          .json({ error: "Password does not meet complexity requirements" });
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(body.token, secret) as any;
      if (payload.type !== "reset") throw new Error("invalid");

      const user = await this.users.findById(payload.sub);
      if (!user) return res.status(400).json({ error: "Invalid token" });

      const bcrypt = require("bcrypt");
      const hash = await bcrypt.hash(body.password, 10);

      await this.users.updatePassword(user.id, hash);

      return res.json({ ok: true });
    } catch (e) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }
  }

  @Post("logout")
  async logout(@Res() res: Response) {
    res.clearCookie("jwt");
    return res.json({ ok: true });
  }
}
