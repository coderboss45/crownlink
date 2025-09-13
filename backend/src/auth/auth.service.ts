import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Prisma, Role } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async validateUser(identifier: string, pass: string) {
    // identifier may be username or email
    let user = await this.users.findByUsername(identifier as string);
    if (!user) user = await this.users.findByEmail(identifier as string);
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;
    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const token = this.jwt.sign(payload);
    return { access_token: token };
  }

  // registration now handled via pending OTP flow in controller
}
