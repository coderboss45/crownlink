import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  Post,
  Body,
  UnauthorizedException,
  Logger,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { OidcService } from "./oidc.service";
import { UsersService } from "../users/users.service";
import * as jwt from "jsonwebtoken";
import { createPublicKey } from "crypto";
import * as crypto from "crypto";

@Controller()
export class OidcController {
  private logger = new Logger(OidcController.name);
  constructor(
    private oidc: OidcService,
    private users: UsersService,
  ) {}

  @Get("create-test-user")
  async createTestUser(@Res() res: any) {
    // This is just for testing - remove in production
    const testUser = {
      email: "test@crownlinksacademy.net",
      username: "testuser",
      password: "password123@DEC",
      name: "Test User",
      firstName: "Test",
      lastName: "User",
    };

    // Add user creation logic here
    // Then redirect to login
    return res.redirect("/auth/login");
  }

  @Get(".well-known/openid-configuration")
  discovery(@Req() req: any, @Res() res: any) {
    try {
      const origin =
        process.env.IDP_ISSUER || `${req.protocol}://${req.get("host")}`;
      const out = {
        issuer: origin,
        authorization_endpoint: `${origin}/oauth/authorize`,
        token_endpoint: `${origin}/oauth/token`,
        userinfo_endpoint: `${origin}/oauth/userinfo`,
        jwks_uri: `${origin}/jwks.json`,
        response_types_supported: ["code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
        scopes_supported: ["openid", "profile", "email"],
        claims_supported: ["sub", "email", "name", "given_name", "family_name"],
        grant_types_supported: ["authorization_code"],
        token_endpoint_auth_methods_supported: [
          "client_secret_post",
          "client_secret_basic",
        ],
        code_challenge_methods_supported: ["S256", "plain"],
      };

      this.logger.log(`Discovery endpoint accessed from ${req.ip}`);
      return res.json(out);
    } catch (error) {
      this.logger.error(`Discovery endpoint error: ${(error as any).message}`);
      return res.status(500).json({ error: "server_error" });
    }
  }

  @Get("jwks.json")
  async jwks(@Res() res: any) {
    try {
      const keys = await this.oidc.getJwks();
      this.logger.log("JWKS endpoint accessed");
      return res.json(keys);
    } catch (error) {
      this.logger.error(`JWKS endpoint error: ${(error as any).message}`);
      return res.status(500).json({ error: "server_error" });
    }
  }

  @Get("oauth/authorize")
  async authorize(@Req() req: any, @Res() res: any, @Query() query: any) {
    try {
      const {
        response_type,
        client_id,
        redirect_uri,
        state,
        scope,
        code_challenge,
        code_challenge_method,
      } = query;

      this.logger.log(
        `Authorization request from client: ${client_id}, redirect: ${redirect_uri}`,
      );

      // Validate parameters
      if (response_type !== "code") {
        this.logger.warn(`Unsupported response_type: ${response_type}`);
        return res.status(400).send("unsupported_response_type");
      }

      if (!(await this.oidc.validateClient(client_id, redirect_uri))) {
        this.logger.warn(
          `Invalid client: ${client_id} with redirect: ${redirect_uri}`,
        );
        return res.status(400).send("invalid_client");
      }

      // Check if user is authenticated
      if (!req.user) {
        const returnTo = req.originalUrl;
        this.logger.log(`User not authenticated, redirecting to login`);

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
        return res.redirect(
          `${frontendUrl}/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
        );
      }

      this.logger.log(
        `User ${req.user.id} authenticated, generating auth code`,
      );

      // Generate authorization code with PKCE support
      const code = await this.oidc.generateAuthorizationCode({
        clientId: client_id,
        redirectUri: redirect_uri,
        userId: String(req.user.id),
        scope,
        state,
        codeChallenge: code_challenge,
        codeChallengeMethod: code_challenge_method,
      });

      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.set("code", code);
      if (state) redirectUrl.searchParams.set("state", state);

      this.logger.log(`Redirecting to: ${redirectUrl.toString()}`);
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      this.logger.error(
        `Authorization endpoint error: ${(error as any).message}`,
      );
      return res.status(500).send("server_error");
    }
  }

  @Post("oauth/token")
  @HttpCode(200)
  async token(@Body() body: any, @Res() res: any, @Req() req: any) {
    try {
      this.logger.log(`Token request body: ${JSON.stringify(body)}`);

      let {
        grant_type,
        code,
        redirect_uri,
        client_id,
        client_secret,
        code_verifier,
      } = body;
      // ✅ Handle client authentication via Basic Auth header
      const auth = req.headers["authorization"];
      if (auth?.startsWith("Basic ")) {
        const decoded = Buffer.from(
          auth.slice("Basic ".length),
          "base64",
        ).toString("utf8");
        const [id, secret] = decoded.split(":");
        client_id = id;
        client_secret = decodeURIComponent(secret);
        this.logger.log(
          `Decoded client_id=${client_id}, client_secret(after decode)=${client_secret}`,
        );
      }

      if (grant_type !== "authorization_code") {
        return res.status(400).json({ error: "unsupported_grant_type" });
      }

      const rec = await this.oidc.consumeAuthorizationCode(code);
      if (!rec) {
        this.logger.warn(`Invalid or expired authorization code: ${code}`);
        return res.status(400).json({ error: "invalid_grant" });
      }

      // 🔑 Validate client ID matches
      if (rec.clientId !== client_id) {
        this.logger.warn(
          `Client ID mismatch: expected ${rec.clientId}, got ${client_id}`,
        );
        return res.status(400).json({ error: "invalid_grant" });
      }

      // 🔑 Validate redirect URI
      if (rec.redirectUri !== redirect_uri) {
        this.logger.warn(
          `Redirect URI mismatch: expected ${rec.redirectUri}, got ${redirect_uri}`,
        );
        return res.status(400).json({ error: "invalid_grant" });
      }

      const okSecret = await this.oidc.validateClientSecret(
        client_id,
        client_secret,
      );
      if (!okSecret) {
        this.logger.warn(`Invalid client secret for client: ${client_id}`);
        return res.status(401).json({ error: "invalid_client" });
      }
      // PKCE verification
      if (rec.codeChallenge) {
        if (!code_verifier) {
          return res.status(400).json({
            error: "invalid_request",
            error_description: "missing code_verifier",
          });
        }

        const method = (rec.codeChallengeMethod || "plain").toLowerCase();
        let expected: string;
        if (method === "s256") {
          const hash = crypto
            .createHash("sha256")
            .update(code_verifier)
            .digest();
          expected = base64UrlEncode(hash);
        } else {
          expected = code_verifier;
        }

        if (expected !== rec.codeChallenge) {
          this.logger.warn(`PKCE verification failed`);
          return res.status(400).json({
            error: "invalid_grant",
            error_description: "PKCE verification failed",
          });
        }
      }

      // Load user
      const user = await this.users.findById(rec.userId);
      if (!user) {
        this.logger.error(`User not found: ${rec.userId}`);
        throw new UnauthorizedException();
      }

      // Prepare payload
      const payload: any = { sub: String(user.id) };

      // Add claims based on scope
      const scopes = (rec.scope || "").split(" ");
      if (scopes.includes("email")) {
        payload.email = user.email;
        payload.email_verified = user.emailVerified || false;
      }
      if (scopes.includes("profile")) {
        payload.name = user.name || user.username || null;
        payload.given_name = user.firstName || null;
        payload.family_name = user.lastName || null;
        payload.preferred_username = user.username;
      }

      // Get signing key
      const key = await this.oidc.getSigningKey();
      const privateKeyPem = key.privateKey;

      // Create tokens
      const issuer =
        process.env.IDP_ISSUER || `${req.protocol}://${req.get("host")}`;
      const now = Math.floor(Date.now() / 1000);

      // ID Token
      const idTokenPayload: any = {
        iss: issuer,
        aud: rec.clientId,
        sub: payload.sub,
        iat: now,
        exp: now + 3600,
        auth_time: now,
      };

      // Add claims to ID token
      if (payload.email) {
        idTokenPayload.email = payload.email;
        idTokenPayload.email_verified = payload.email_verified;
      }
      if (payload.name) idTokenPayload.name = payload.name;
      if (payload.given_name) idTokenPayload.given_name = payload.given_name;
      if (payload.family_name) idTokenPayload.family_name = payload.family_name;
      if (payload.preferred_username)
        idTokenPayload.preferred_username = payload.preferred_username;

      const idToken = jwt.sign(idTokenPayload, privateKeyPem, {
        algorithm: "RS256",
        keyid: key.kid,
      });

      // Access Token
      const accessTokenPayload = {
        ...payload,
        iss: issuer,
        aud: rec.clientId,
        iat: now,
        exp: now + 3600,
        scope: rec.scope,
      };

      const accessToken = jwt.sign(accessTokenPayload, privateKeyPem, {
        algorithm: "RS256",
        keyid: key.kid,
      });

      // Refresh Token (only if offline_access is requested)
      let refreshToken: string | undefined;
      if (scopes.includes("offline_access")) {
        refreshToken = jwt.sign(
          {
            sub: payload.sub,
            client_id: rec.clientId,
            type: "refresh_token",
            iat: now,
            exp: now + 60 * 60 * 24 * 30, // 30 days
          },
          privateKeyPem,
          { algorithm: "RS256", keyid: key.kid },
        );
      }

      const response: any = {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600,
        id_token: idToken,
        scope: rec.scope || "openid",
      };

      if (refreshToken) {
        response.refresh_token = refreshToken;
      }

      this.logger.log(
        `Tokens issued successfully for user ${user.id}, client ${client_id}`,
      );
      return res.json(response);
    } catch (error) {
      this.logger.error(`Token endpoint error: ${(error as any).message}`);
      return res.status(500).json({ error: "server_error" });
    }
  }

  @Get("oauth/userinfo")
  async userinfo(@Req() req: any, @Res() res: any) {
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({ error: "invalid_token" });
    }

    try {
      const keys = await this.oidc.getJwks();
      const jwk = keys.keys?.[0];
      if (!jwk) {
        return res.status(401).json({ error: "invalid_token" });
      }

      const pubKeyPem = createPemFromJwk(jwk);
      const payload: any = jwt.verify(token, pubKeyPem, {
        algorithms: ["RS256"],
      });
      const user = await this.users.findById(payload.sub);

      if (!user) {
        return res.status(404).json({ error: "not_found" });
      }

      const response: any = {
        sub: String(user.id),
        email: user.email,
        email_verified: user.emailVerified || false,
        name: user.name || user.username || null,
        given_name: user.firstName || null,
        family_name: user.lastName || null,
        preferred_username: user.username,
      };

      this.logger.log(`UserInfo accessed for user ${user.id}`);
      return res.json(response);
    } catch (e) {
      this.logger.warn("UserInfo verify error: " + (e as any).message);
      return res.status(401).json({ error: "invalid_token" });
    }
  }
}

// Helper functions
function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createPemFromJwk(jwk: any) {
  const keyObj = createPublicKey({ key: jwk, format: "jwk" });
  return keyObj.export({ type: "spki", format: "pem" }) as string;
}
