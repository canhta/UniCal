import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { ConnectedAccountResponseDto } from './dto/accounts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/types';

@ApiTags('Connected Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List connected accounts for current user' })
  @ApiResponse({
    status: 200,
    description: 'Connected accounts retrieved successfully',
    type: [ConnectedAccountResponseDto],
  })
  @ApiBearerAuth()
  async listConnectedAccounts(
    @Request() req: AuthenticatedRequest,
  ): Promise<ConnectedAccountResponseDto[]> {
    return this.accountsService.getConnectedAccountsForUser(req.user.id);
  }

  @Get(':accountId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get connected account details' })
  @ApiResponse({
    status: 200,
    description: 'Connected account retrieved successfully',
    type: ConnectedAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Connected account not found' })
  @ApiBearerAuth()
  async getConnectedAccountDetails(
    @Request() req: AuthenticatedRequest,
    @Param('accountId') accountId: string,
  ): Promise<ConnectedAccountResponseDto> {
    return this.accountsService.getConnectedAccountById(req.user.id, accountId);
  }

  @Delete(':accountId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove connected account' })
  @ApiResponse({
    status: 204,
    description: 'Connected account removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Connected account not found' })
  @ApiBearerAuth()
  async removeConnectedAccount(
    @Request() req: AuthenticatedRequest,
    @Param('accountId') accountId: string,
  ): Promise<void> {
    await this.accountsService.deleteConnectedAccount(req.user.id, accountId);
  }

  @Post('connect/:provider/authorize')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Start OAuth flow to connect a calendar account' })
  @ApiResponse({
    status: 200,
    description: 'OAuth authorization URL generated',
    schema: {
      type: 'object',
      properties: {
        authorizationUrl: { type: 'string' },
        state: { type: 'string' },
      },
    },
  })
  @ApiBearerAuth()
  async initiateConnection(
    @Request() req: AuthenticatedRequest,
    @Param('provider') provider: string,
  ): Promise<{ authorizationUrl: string; state: string }> {
    return this.accountsService.initiateOAuthFlow(req.user.id, provider);
  }

  @Get('connect/:provider/callback')
  @ApiOperation({ summary: 'Handle OAuth callback from external provider' })
  @ApiQuery({ name: 'code', description: 'Authorization code from provider' })
  @ApiQuery({
    name: 'state',
    description: 'State parameter for CSRF protection',
  })
  @ApiResponse({
    status: 200,
    description: 'Account connected successfully',
    type: ConnectedAccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid authorization code or state',
  })
  async handleOAuthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<ConnectedAccountResponseDto> {
    return this.accountsService.handleOAuthCallback(provider, code, state);
  }
}
