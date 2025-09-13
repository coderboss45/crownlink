import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as session from "express-session";
import * as passport from "passport";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance() as express.Express;

  // Basic middleware
  app.use(cookieParser());

  // Session configuration (CRITICAL for OIDC flow)
  app.use(
    session({
      secret:
        process.env.SESSION_SECRET ||
        "your-session-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
      },
    }),
  );

  // Passport initialization (CRITICAL for authentication)
  app.use(passport.initialize());
  app.use(passport.session());

  // Lightweight JWT cookie auth to populate req.user for unguarded routes
  expressApp.use((req: any, _res, next) => {
    try {
      const token = req.cookies?.jwt;
      if (token) {
        const jwt = require("jsonwebtoken");
        const payload: any = jwt.verify(
          token,
          process.env.JWT_SECRET || "devsecret",
        );
        req.user = {
          id: payload.sub,
          username: payload.username,
          role: payload.role,
        };
      }
    } catch {}
    next();
  });

  // CORS configuration for Moodle
  app.enableCors({
    origin: [
      "http://localhost:8080", // your frontend
      "http://localhost:3000", // alt frontend
      "https://learn.crownlinksacademy.net", // Moodle
      /\.ngrok-free\.app$/, // ngrok tunnels
    ],
    credentials: true, // 🔥 allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "ngrok-skip-browser-warning",
    ],
  });

  // Stripe webhook needs raw body — apply only to the webhook route
  expressApp.post(
    "/api/stripe/webhook",
    express.raw({ type: "*/*" }),
    (req, res, next) => {
      (req as any).rawBody = req.body;
      next();
    },
  );

  // Simple request logging for all endpoints
  expressApp.use((req, res, next) => {
    const start = Date.now();
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    );
    res.on("finish", () => {
      const ms = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${res.statusMessage || ""} (${ms}ms)`,
      );
    });
    next();
  });

  // Parse JSON and URL encoded data
  expressApp.use(bodyParser.json());
  expressApp.use(bodyParser.urlencoded({ extended: true }));

  // Global prefix for API routes, excluding OIDC endpoints
  app.setGlobalPrefix("api", {
    exclude: [
      ".well-known/openid-configuration",
      "jwks.json",
      "oauth/authorize",
      "oauth/token",
      "oauth/userinfo",
      "auth/login",
      "auth/register",
      "auth/logout",
      "dashboard",
    ],
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Backend listening on http://localhost:${port}`);
  console.log(`🌐 Ngrok URL: https://38bbc54be742.ngrok-free.app`);
  console.log(
    `📋 Discovery: https://38bbc54be742.ngrok-free.app/.well-known/openid-configuration`,
  );
}
bootstrap();
