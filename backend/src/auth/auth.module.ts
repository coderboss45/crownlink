import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { PostmarkModule } from "../postmark/postmark.module";
import { MoodleModule } from "../moodle/moodle.module";
import { OidcController } from "./oidc.controller";
import { OidcService } from "./oidc.service";
import { PrismaService } from "../prisma/prisma.service";      

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "devsecret",
      signOptions: { expiresIn: "7d" },
    }),
    PostmarkModule, 
    MoodleModule,   
  ],
  providers: [AuthService, JwtStrategy, OidcService, PrismaService],
  controllers: [AuthController, OidcController],
  exports: [AuthService],
})
export class AuthModule {}
