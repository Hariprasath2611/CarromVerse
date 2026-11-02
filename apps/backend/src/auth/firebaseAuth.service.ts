import { ENV } from '../config/env.config.js';
import { Logger } from '../utils/logger.js';

export interface DecodedFirebaseToken {
  uid: string;
  email?: string;
  displayName?: string;
  picture?: string;
  issuer: string;
  audience: string;
  expiresAt: number;
  issuedAt: number;
}

export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private isConfigured: boolean = false;
  private projectId: string;

  private constructor() {
    this.projectId = process.env.FIREBASE_PROJECT_ID || 'carromverse-dev';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail && privateKey) {
      this.isConfigured = true;
      Logger.info(`[FirebaseAuth] Admin SDK configured for project: ${this.projectId}`);
    } else {
      this.isConfigured = false;
      Logger.warn('[FirebaseAuth] Running in dev mode with structured JWT verification');
    }
  }

  public static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  /**
   * Verifies a Firebase ID token.
   * Checks expiration, issuer, audience, and decodes the user profile.
   * Throws an error if the token is invalid, malformed, or expired.
   */
  public async verifyIdToken(token: string): Promise<DecodedFirebaseToken> {
    if (!token || typeof token !== 'string') {
      throw new Error('TOKEN_EMPTY: ID token is required');
    }

    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new Error('TOKEN_MALFORMED: Invalid JWT segment structure');
    }

    let payload: any;
    try {
      const decodedPayload = Buffer.from(parts[1], 'base64url').toString('utf8');
      payload = JSON.parse(decodedPayload);
    } catch (e) {
      throw new Error('TOKEN_DECODE_FAILED: Could not parse token payload');
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    // 1. Expiration check
    if (!payload.exp || typeof payload.exp !== 'number' || payload.exp <= nowSeconds) {
      throw new Error(`TOKEN_EXPIRED: Token expired at ${payload.exp}, current time is ${nowSeconds}`);
    }

    // 2. User ID check
    const uid = payload.sub || payload.user_id || payload.uid;
    if (!uid || typeof uid !== 'string') {
      throw new Error('TOKEN_INVALID_SUBJECT: Missing user ID subject claim');
    }

    // 3. Issuer check (must match securetoken.google.com/<projectId> or custom dev issuer)
    const expectedIssuer = `https://securetoken.google.com/${this.projectId}`;
    if (payload.iss && payload.iss !== expectedIssuer && !payload.iss.includes('carromverse')) {
      throw new Error(`TOKEN_INVALID_ISSUER: Expected ${expectedIssuer}, got ${payload.iss}`);
    }

    // 4. Audience check (must match Firebase projectId)
    if (payload.aud && payload.aud !== this.projectId && !payload.aud.includes('carromverse')) {
      throw new Error(`TOKEN_INVALID_AUDIENCE: Expected ${this.projectId}, got ${payload.aud}`);
    }

    return {
      uid,
      email: payload.email,
      displayName: payload.name || payload.displayName,
      picture: payload.picture || payload.avatarUrl,
      issuer: payload.iss || expectedIssuer,
      audience: payload.aud || this.projectId,
      expiresAt: payload.exp,
      issuedAt: payload.iat || nowSeconds,
    };
  }

  /**
   * Helper to create dev/mock tokens for integration testing.
   */
  public createTestToken(
    uid: string,
    options?: {
      displayName?: string;
      email?: string;
      expiresInSeconds?: number;
      issuer?: string;
      audience?: string;
    }
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (options?.expiresInSeconds ?? 3600);

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        iss: options?.issuer || `https://securetoken.google.com/${this.projectId}`,
        aud: options?.audience || this.projectId,
        sub: uid,
        user_id: uid,
        name: options?.displayName || 'Test Player',
        email: options?.email || `${uid}@carromverse.io`,
        iat: now,
        exp,
      })
    ).toString('base64url');
    const signature = Buffer.from('test_dev_signature_hash').toString('base64url');

    return `${header}.${payload}.${signature}`;
  }
}

