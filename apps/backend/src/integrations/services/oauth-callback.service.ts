import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CalendarsService } from '../../calendars/calendars.service';
import { AccountsService } from '../../accounts/accounts.service';
import { OAuthUrlService } from './oauth-url.service';
import { ConnectedAccount } from '@prisma/client';
import {
  PlatformTokenResponseDto,
  InternalCreateConnectedAccountDto,
} from '@unical/core';

export interface OAuthCallbackResult {
  connectedAccount: ConnectedAccount;
  isNewAccount: boolean;
}

@Injectable()
export class OAuthCallbackService {
  private readonly logger = new Logger(OAuthCallbackService.name);

  constructor(
    private calendarsService: CalendarsService,
    private accountsService: AccountsService,
    private oauthUrlService: OAuthUrlService,
    private configService: ConfigService,
  ) {}

  async handleGoogleCallback(
    code: string,
    state: string,
  ): Promise<OAuthCallbackResult> {
    this.logger.log('Handling Google OAuth callback');

    // Validate state and extract user ID
    const userId = this.oauthUrlService.validateState(state);
    if (!userId) {
      throw new BadRequestException('Invalid or expired OAuth state token');
    }

    // Exchange code for tokens
    const redirectUri = this.getRedirectUri('google');
    const tokenResponse = await this.calendarsService.exchangeCodeForTokens(
      'google',
      code,
      redirectUri,
    );

    // Create connected account
    const connectedAccount = await this.createConnectedAccount(
      userId,
      'google',
      tokenResponse,
    );

    this.logger.log(`Successfully connected Google account for user ${userId}`);
    return {
      connectedAccount,
      isNewAccount: true,
    };
  }

  async handleMicrosoftCallback(
    code: string,
    state: string,
  ): Promise<OAuthCallbackResult> {
    this.logger.log('Handling Microsoft OAuth callback');

    // Validate state and extract user ID
    const userId = this.oauthUrlService.validateState(state);
    if (!userId) {
      throw new BadRequestException('Invalid or expired OAuth state token');
    }

    // Exchange code for tokens
    const redirectUri = this.getRedirectUri('microsoft');
    const tokenResponse = await this.calendarsService.exchangeCodeForTokens(
      'microsoft',
      code,
      redirectUri,
    );

    // Create connected account
    const connectedAccount = await this.createConnectedAccount(
      userId,
      'microsoft',
      tokenResponse,
    );

    this.logger.log(
      `Successfully connected Microsoft account for user ${userId}`,
    );
    return {
      connectedAccount,
      isNewAccount: true,
    };
  }

  private async createConnectedAccount(
    userId: string,
    provider: string,
    tokenResponse: PlatformTokenResponseDto,
  ): Promise<ConnectedAccount> {
    const createAccountDto: InternalCreateConnectedAccountDto = {
      userId,
      provider,
      providerAccountId: tokenResponse.platformUserId || 'unknown',
      accountEmail: tokenResponse.email || undefined,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken || undefined,
      expiresAt: tokenResponse.expiresInSeconds
        ? new Date(Date.now() + tokenResponse.expiresInSeconds * 1000)
        : undefined,
      scopes: tokenResponse.scope ? [tokenResponse.scope] : undefined,
    };

    return this.accountsService.createConnectedAccount(createAccountDto);
  }

  private getRedirectUri(provider: string): string {
    const baseUrl =
      this.configService.get<string>('OAUTH_REDIRECT_BASE_URL') ||
      'http://localhost:3000/api/v1';
    return `${baseUrl}/integrations/auth/${provider}/callback`;
  }
}
