import {
  Controller,
  Get,
  Post,
  Param,
  Req,
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
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppConfigService } from '../config/app-config.service';
import {
  OAuthUrlService,
  OAuthUrlResponse,
} from './services/oauth-url.service';
import { SyncService } from '../sync/sync.service';
import { AccountsService } from '../accounts/accounts.service';
import {
  OAuthUrlResponseDto,
  ProviderParamDto,
  SyncTriggerResponseDto,
} from './dto/integration.dto';
import { ConnectedAccountResponseDto } from '@unical/core';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    displayName: string | null;
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
  async getOAuthUrl(
    @Param() params: ProviderParamDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<OAuthUrlResponseDto> {
    const userId = req.user.id;
    const { provider } = params;

    this.logger.log(
      `Generating OAuth URL for provider ${provider} and user ${userId}`,
    );

    if (!userId) {
      this.logger.error('No userId found in request');
      throw new BadRequestException('User not authenticated');
    }

    let result: OAuthUrlResponse;
    if (provider === 'google') {
      result = await this.oauthUrlService.generateGoogleOAuthUrl(userId);
    } else if (provider === 'microsoft') {
      result = await this.oauthUrlService.generateMicrosoftOAuthUrl(userId);
    } else {
      throw new BadRequestException('Invalid provider');
    }

    return {
      url: result.url,
      // Don't expose state in production for security
      state: this.appConfig.isDevelopment ? result.state : undefined,
    };
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
    const userId = req.user.id;
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
    const userId = req.user.id;

    this.logger.log(
      `Manual sync requested for account ${accountId} by user ${userId}`,
    );

    return this.syncService.triggerManualSync(userId, accountId);
  }
}
