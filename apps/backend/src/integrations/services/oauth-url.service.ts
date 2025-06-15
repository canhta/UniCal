import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

export interface OAuthUrlResponse {
  url: string;
  state: string;
}

interface StateData {
  userId: string;
  timestamp: number;
  random: string;
}

@Injectable()
export class OAuthUrlService {
  private readonly logger = new Logger(OAuthUrlService.name);
  private readonly stateTokens = new Map<
    string,
    { userId: string; expires: number }
  >();

  constructor(private configService: ConfigService) {}

  generateGoogleOAuthUrl(userId: string): OAuthUrlResponse {
    const state = this.generateStateToken(userId);
    this.storeState(state, userId);

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = `${this.configService.get<string>('OAUTH_REDIRECT_BASE_URL')}/integrations/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar';

    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri || '',
      response_type: 'code',
      scope,
      state,
      access_type: 'offline',
      prompt: 'consent', // Force consent to get refresh token
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    this.logger.log(`Generated Google OAuth URL for user ${userId}`);
    return { url, state };
  }

  generateMicrosoftOAuthUrl(userId: string): OAuthUrlResponse {
    const state = this.generateStateToken(userId);
    this.storeState(state, userId);

    const clientId = this.configService.get<string>('MICROSOFT_CLIENT_ID');
    const redirectUri = `${this.configService.get<string>('OAUTH_REDIRECT_BASE_URL')}/integrations/auth/microsoft/callback`;
    const scope =
      'https://graph.microsoft.com/calendars.readwrite offline_access';

    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri || '',
      response_type: 'code',
      scope,
      state,
      response_mode: 'query',
    });

    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;

    this.logger.log(`Generated Microsoft OAuth URL for user ${userId}`);
    return { url, state };
  }

  private generateStateToken(userId: string): string {
    const timestamp = Date.now();
    const random = randomUUID();
    // Include userId in state for validation (base64 encoded for security)
    const stateData: StateData = { userId, timestamp, random };
    return Buffer.from(JSON.stringify(stateData)).toString('base64url');
  }

  private storeState(state: string, userId: string): void {
    // Store state token for 10 minutes
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    this.stateTokens.set(state, { userId, expires });
    this.logger.debug(`Stored OAuth state token for user ${userId}`);

    // Clean up expired tokens
    this.cleanupExpiredTokens();
  }

  validateState(state: string): string | null {
    try {
      const storedData = this.stateTokens.get(state);

      if (!storedData) {
        this.logger.warn(`Invalid OAuth state token: ${state}`);
        return null;
      }

      if (storedData.expires < Date.now()) {
        this.logger.warn(`Expired OAuth state token: ${state}`);
        this.stateTokens.delete(state);
        return null;
      }

      // Decode state to verify userId matches
      const stateData = JSON.parse(
        Buffer.from(state, 'base64url').toString(),
      ) as StateData;

      if (stateData.userId !== storedData.userId) {
        this.logger.warn(`OAuth state userId mismatch for token: ${state}`);
        return null;
      }

      // Remove state token (single use)
      this.stateTokens.delete(state);

      this.logger.log(
        `Validated OAuth state token for user ${storedData.userId}`,
      );
      return storedData.userId;
    } catch (error) {
      this.logger.error(
        `Error validating OAuth state token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [state, data] of this.stateTokens.entries()) {
      if (data.expires < now) {
        this.stateTokens.delete(state);
      }
    }
  }
}
