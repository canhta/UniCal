import {
  Controller,
  Get,
  Delete,
  Param,
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
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { ConnectedAccountResponseDto } from './dto/accounts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@unical/core';

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
}
