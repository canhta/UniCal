import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleCalendarService } from '../../calendars/services/google-calendar.service';
import { MicrosoftCalendarService } from '../../calendars/services/microsoft-calendar.service';
import {
  PlatformTokenResponseDto,
  ICalendarPlatformService,
} from '../../calendars/interfaces/calendar-platform.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly platformServices: Map<string, ICalendarPlatformService>;
  private oauthStates = new Map<
    string,
    { userId: string; provider: string; expires: number }
  >();

  constructor(
    private googleCalendarService: GoogleCalendarService,
    private microsoftCalendarService: MicrosoftCalendarService,
    private configService: ConfigService,
  ) {
    this.platformServices = new Map();
    this.platformServices.set('google', this.googleCalendarService);
    this.platformServices.set('microsoft', this.microsoftCalendarService);
  }

  private getPlatformService(provider: string): ICalendarPlatformService {
    const service = this.platformServices.get(provider);
    if (!service) {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
    return service;
  }

  generateAuthorizationUrl(
    userId: string,
    provider: string,
  ): { authorizationUrl: string; state: string } {
    // Generate CSRF state token
    const state = randomBytes(32).toString('hex');

    // Store state with user info and expiration (10 minutes)
    this.oauthStates.set(state, {
      userId,
      provider,
      expires: Date.now() + 10 * 60 * 1000,
    });

    // Get authorization URL from platform service
    const platformService = this.getPlatformService(provider);
    const authorizationUrl = platformService.getAuthorizationUrl(
      this.getRedirectUri(provider),
    );

    return {
      authorizationUrl: `${authorizationUrl}&state=${state}`,
      state,
    };
  }

  async exchangeCodeForTokens(
    provider: string,
    code: string,
    state: string,
  ): Promise<{ tokenResponse: PlatformTokenResponseDto; userId: string }> {
    // Validate state parameter
    const stateData = this.oauthStates.get(state);
    if (
      !stateData ||
      stateData.expires < Date.now() ||
      stateData.provider !== provider
    ) {
      throw new BadRequestException('Invalid or expired state parameter');
    }

    // Clean up used state
    this.oauthStates.delete(state);

    try {
      // Exchange code for tokens using platform service
      const platformService = this.getPlatformService(provider);
      const tokenResponse = await platformService.exchangeCodeForTokens(
        code,
        this.getRedirectUri(provider),
      );

      return {
        tokenResponse,
        userId: stateData.userId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to exchange code for tokens: ${errorMessage}`,
        error,
      );
      throw new BadRequestException(
        `Failed to connect ${provider} account: ${errorMessage}`,
      );
    }
  }

  private getRedirectUri(provider: string): string {
    const baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3001';
    return `${baseUrl}/api/accounts/connect/${provider}/callback`;
  }
}
