import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AppConfigService } from '../../config/app-config.service';
import { PrismaService } from '../../prisma/prisma.service';

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

  constructor(
    private appConfig: AppConfigService,
    private prisma: PrismaService,
  ) {}

  async generateGoogleOAuthUrl(userId: string): Promise<OAuthUrlResponse> {
    const state = this.generateStateToken(userId);
    await this.storeState(state, userId, 'google');

    const clientId = this.appConfig.oauth.google.clientId;
    const redirectUri = `${this.appConfig.oauth.redirectBaseUrl}/integrations/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
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

  async generateMicrosoftOAuthUrl(userId: string): Promise<OAuthUrlResponse> {
    const state = this.generateStateToken(userId);
    await this.storeState(state, userId, 'microsoft');

    const clientId = this.appConfig.oauth.microsoft.clientId;
    const redirectUri = `${this.appConfig.oauth.redirectBaseUrl}/integrations/auth/microsoft/callback`;
    const scope =
      'https://graph.microsoft.com/calendars.readwrite offline_access';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
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

  private async storeState(
    state: string,
    userId: string,
    provider: string,
  ): Promise<void> {
    // Store state token for 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.logger.debug(
      `Storing state for userId: ${userId}, provider: ${provider}, state: ${state}`,
    );

    if (!userId) {
      throw new Error('userId is required for storing OAuth state');
    }

    await this.prisma.oAuthState.create({
      data: {
        state,
        userId,
        provider,
        expiresAt,
      },
    });

    this.logger.debug(`Stored OAuth state token for user ${userId}`);

    // Clean up expired tokens
    await this.cleanupExpiredTokens();
  }

  async validateState(state: string): Promise<string | null> {
    try {
      this.logger.debug(`Validating state token: ${state}`);

      const storedState = await this.prisma.oAuthState.findUnique({
        where: { state },
      });

      if (!storedState) {
        this.logger.warn(
          `Invalid OAuth state token: ${state} - not found in storage`,
        );
        return null;
      }

      if (storedState.expiresAt < new Date()) {
        this.logger.warn(`Expired OAuth state token: ${state}`);
        await this.prisma.oAuthState.delete({
          where: { id: storedState.id },
        });
        return null;
      }

      // Decode state to verify userId matches
      const stateData = JSON.parse(
        Buffer.from(state, 'base64url').toString(),
      ) as StateData;

      this.logger.debug(`State data from token: ${JSON.stringify(stateData)}`);
      this.logger.debug(`Stored data: ${JSON.stringify(storedState)}`);

      if (stateData.userId !== storedState.userId) {
        this.logger.warn(`OAuth state userId mismatch for token: ${state}`);
        return null;
      }

      // Remove state token (single use)
      await this.prisma.oAuthState.delete({
        where: { id: storedState.id },
      });

      this.logger.log(
        `Validated OAuth state token for user ${storedState.userId}`,
      );
      return storedState.userId;
    } catch (error) {
      this.logger.error(
        `Error validating OAuth state token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  private async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.prisma.oAuthState.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
  }
}
