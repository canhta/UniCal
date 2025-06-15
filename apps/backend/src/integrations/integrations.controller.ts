import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppConfigService } from '../config/app-config.service';
import {
  OAuthUrlService,
  OAuthUrlResponse,
} from './services/oauth-url.service';
import {
  OAuthCallbackService,
  OAuthCallbackResult,
} from './services/oauth-callback.service';
import { SyncService } from '../sync/sync.service';
import { AccountsService } from '../accounts/accounts.service';
import {
  OAuthUrlResponseDto,
  OAuthCallbackQueryDto,
  ProviderParamDto,
  SyncTriggerResponseDto,
} from './dto/integration.dto';
import { ConnectedAccountResponseDto } from '@unical/core';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@ApiTags('integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(
    private oauthUrlService: OAuthUrlService,
    private oauthCallbackService: OAuthCallbackService,
    private syncService: SyncService,
    private accountsService: AccountsService,
    private appConfig: AppConfigService,
  ) {}

  @Get('oauth-url/:provider')
  @ApiOperation({ summary: 'Get OAuth authorization URL for a provider' })
  @ApiResponse({
    status: 200,
    description: 'OAuth URL generated successfully',
    type: OAuthUrlResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid provider' })
  getOAuthUrl(
    @Param() params: ProviderParamDto,
    @Req() req: AuthenticatedRequest,
  ): OAuthUrlResponseDto {
    const userId = req.user.sub;
    const { provider } = params;

    this.logger.log(
      `Generating OAuth URL for provider ${provider} and user ${userId}`,
    );

    let result: OAuthUrlResponse;
    if (provider === 'google') {
      result = this.oauthUrlService.generateGoogleOAuthUrl(userId);
    } else if (provider === 'microsoft') {
      result = this.oauthUrlService.generateMicrosoftOAuthUrl(userId);
    } else {
      throw new BadRequestException('Invalid provider');
    }

    return {
      url: result.url,
      // Don't expose state in production for security
      state: this.appConfig.isDevelopment ? result.state : undefined,
    };
  }

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

      // Extract userId from validated state for initial sync
      const userId = this.oauthUrlService.validateState(query.state);
      if (!userId) {
        throw new Error('Unable to determine user for sync');
      }

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

  @Get('accounts')
  @ApiOperation({ summary: 'List connected accounts for current user' })
  @ApiResponse({
    status: 200,
    description: 'Connected accounts retrieved successfully',
    type: [ConnectedAccountResponseDto],
  })
  getConnectedAccounts(
    @Req() req: AuthenticatedRequest,
  ): Promise<ConnectedAccountResponseDto[]> {
    const userId = req.user.sub;
    return this.accountsService.getConnectedAccountsForUser(userId);
  }

  @Post('sync/:accountId')
  @ApiOperation({ summary: 'Trigger manual sync for a connected account' })
  @ApiResponse({
    status: 200,
    description: 'Sync triggered successfully',
    type: SyncTriggerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async triggerManualSync(
    @Param('accountId') accountId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<SyncTriggerResponseDto> {
    const userId = req.user.sub;

    this.logger.log(
      `Manual sync requested for account ${accountId} by user ${userId}`,
    );

    return this.syncService.triggerManualSync(userId, accountId);
  }
}
