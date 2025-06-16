import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AppConfigService } from '../config/app-config.service';
import { OAuthUrlService } from './services/oauth-url.service';
import {
  OAuthCallbackService,
  OAuthCallbackResult,
} from './services/oauth-callback.service';
import { SyncService } from '../sync/sync.service';
import { OAuthCallbackQueryDto } from './dto/integration.dto';

@ApiTags('oauth-callbacks')
@Controller('integrations')
export class OAuthCallbackController {
  private readonly logger = new Logger(OAuthCallbackController.name);

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly oauthUrlService: OAuthUrlService,
    private readonly oauthCallbackService: OAuthCallbackService,
    private readonly syncService: SyncService,
  ) {}

  @Get('auth/google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with status' })
  async handleGoogleCallback(
    @Query() query: OAuthCallbackQueryDto,
    @Res() res: Response,
  ) {
    return this.handleOAuthCallback('google', query, res);
  }

  @Get('auth/microsoft/callback')
  @ApiOperation({ summary: 'Handle Microsoft OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with status' })
  async handleMicrosoftCallback(
    @Query() query: OAuthCallbackQueryDto,
    @Res() res: Response,
  ) {
    return this.handleOAuthCallback('microsoft', query, res);
  }

  private async handleOAuthCallback(
    provider: string,
    query: OAuthCallbackQueryDto,
    res: Response,
  ) {
    const frontendUrl = this.appConfig.server.frontendBaseUrl;

    try {
      // Handle OAuth errors
      if (query.error) {
        this.logger.warn(`OAuth error for ${provider}: ${query.error}`);
        return res.redirect(
          `${frontendUrl}/integrations?status=error&provider=${provider}&error=${query.error}`,
        );
      }

      // Process OAuth callback
      let result: OAuthCallbackResult;
      if (provider === 'google') {
        result = await this.oauthCallbackService.handleGoogleCallback(
          query.code,
          query.state,
        );
      } else if (provider === 'microsoft') {
        result = await this.oauthCallbackService.handleMicrosoftCallback(
          query.code,
          query.state,
        );
      } else {
        throw new Error('Invalid provider');
      }

      // Get userId from the callback result (already validated in service)
      const userId = result.userId;

      // Trigger initial sync in background (don't wait for completion)
      this.syncService
        .triggerInitialSync(userId, result.connectedAccount.id)
        .catch((error) => {
          this.logger.error(
            `Initial sync failed for account ${result.connectedAccount.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        });

      // Redirect to frontend with success
      return res.redirect(
        `${frontendUrl}/integrations?status=success&provider=${provider}&accountId=${result.connectedAccount.id}`,
      );
    } catch (error) {
      this.logger.error(
        `OAuth callback failed for ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      return res.redirect(
        `${frontendUrl}/integrations?status=error&provider=${provider}&error=callback_failed`,
      );
    }
  }
}
