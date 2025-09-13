import { Injectable, Logger } from '@nestjs/common';
import { randomUUID, generateKeyPairSync, createPublicKey } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OidcService {
  private logger = new Logger(OidcService.name);
  constructor(private prisma: PrismaService) {}

  // validate client (id + optional redirect uri)
  async validateClient(clientId: string, redirectUri?: string) {
    const client = await this.prisma.oAuthClient.findUnique({ where: { clientId } });
    if (!client) {
      const envId = process.env.OIDC_CLIENT_ID || '';
      const envRedirect = process.env.OIDC_CLIENT_REDIRECT_URI || '';
      return clientId === envId && (!envRedirect || envRedirect === redirectUri);
    }
    if (client.redirectUris) {
      const uris: string[] = client.redirectUris as any;
      if (redirectUri && !uris.includes(redirectUri)) return false;
    }
    return true;
  }

  async getClient(clientId: string) {
    return await this.prisma.oAuthClient.findUnique({ where: { clientId } });
  }

  async validateClientSecret(clientId: string, clientSecret?: string) {
    const client = await this.getClient(clientId);
    if (!client) {
      // fallback to env
      return clientId === process.env.OIDC_CLIENT_ID && clientSecret === process.env.OIDC_CLIENT_SECRET;
    }
    if (client.clientSecret && client.clientSecret !== clientSecret) return false;
    return true;
  }

  async generateAuthorizationCode(payload: { clientId: string; redirectUri: string; userId: string; scope?: string; state?: string; codeChallenge?: string; codeChallengeMethod?: string }) {
    const code = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60_000); // 5 minutes
    await this.prisma.authorizationCode.create({
      data: {
        code,
        clientId: payload.clientId,
        redirectUri: payload.redirectUri,
        userId: payload.userId,
        scope: payload.scope ?? null,
        state: payload.state ?? null,
        codeChallenge: payload.codeChallenge ?? null,
        codeChallengeMethod: payload.codeChallengeMethod ?? null,
        expiresAt,
      },
    });
    this.logger.log(`Issued auth code ${code} for client ${payload.clientId} user ${payload.userId}`);
    return code;
  }

  async consumeAuthorizationCode(code: string) {
    const rec = await this.prisma.authorizationCode.findUnique({ where: { code } });
    if (!rec) return null;
    if (rec.expiresAt.getTime() < Date.now()) {
      await this.prisma.authorizationCode.delete({ where: { code } });
      return null;
    }
    // delete single use
    await this.prisma.authorizationCode.delete({ where: { code } });
    return rec;
  }

  // Key management: create a signing key (RSA) and store JWK/pem
  async ensureKey() {
    const existing = await this.prisma.oidcKey.findFirst();
    if (existing) return existing;
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const pubKeyObj = createPublicKey(publicKey);
    const jwk: any = pubKeyObj.export({ format: 'jwk' });
    const kid = randomUUID();
    await this.prisma.oidcKey.create({
      data: {
        kid,
        publicKey: JSON.stringify(jwk),
        privateKey,
      },
    });
    return await this.prisma.oidcKey.findUnique({ where: { kid } });
  }

  async getJwks() {
    const key = await this.prisma.oidcKey.findFirst();
    if (!key) return { keys: [] };
    const jwk = JSON.parse(key.publicKey as string);
    jwk.kid = key.kid;
    return { keys: [jwk] };
  }

  async getSigningKey() {
    const key = await this.ensureKey();
    if (!key) throw new Error('Signing key not found');
    return { kid: key.kid, privateKey: key.privateKey };
  }

  async getPublicPem() {
    const key = await this.prisma.oidcKey.findFirst();
    if (!key) return null;
    const jwk = JSON.parse(key.publicKey as string);
    // convert jwk to PEM using Node crypto
    const keyObj = createPublicKey({ key: jwk, format: 'jwk' });
    return keyObj.export({ type: 'spki', format: 'pem' }) as string;
  }
}
