import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuditLogService } from './audit-log.service';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  AdminUserResponseDto,
  CreateClientUserDto,
  UpdateClientUserDto,
  ClientUserResponseDto,
  ClientUserDetailResponseDto,
  DashboardStatsDto,
  SearchResultDto,
  PageOptionsDto,
  PageDto,
  AuditLogResponseDto,
  AuditLogFilterDto,
} from '@unical/core';
import { UserStatus } from '@prisma/client';

interface AuthenticatedRequest {
  user?: {
    id: string;
    [key: string]: any;
  };
}

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
// @UseGuards(AuthGuard, AdminRolesGuard) // TODO: Implement auth guards
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // Dashboard
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  // Global Search
  @Get('search')
  @ApiOperation({ summary: 'Search users and leads globally' })
  @ApiQuery({ name: 'query', description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async search(@Query('query') query: string): Promise<SearchResultDto[]> {
    return this.adminService.searchUsers(query);
  }

  // Admin User Management
  @Get('users/admins')
  @ApiOperation({ summary: 'Get list of admin users' })
  @ApiResponse({
    status: 200,
    description: 'Admin users retrieved successfully',
    type: PageDto<AdminUserResponseDto>,
  })
  async getAdminUsers(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<AdminUserResponseDto>> {
    return this.adminService.getAdminUsers(pageOptions);
  }

  @Post('users/admins')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({
    status: 201,
    description: 'Admin user created successfully',
  })
  async createAdminUser(
    @Body() createAdminUserDto: CreateAdminUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<AdminUserResponseDto> {
    // TODO: Extract user ID from authenticated request
    const performingUserId = (req.user?.id as string) || 'system';
    return this.adminService.createAdminUser(
      createAdminUserDto,
      performingUserId,
    );
  }

  @Put('users/admins/:id')
  @ApiOperation({ summary: 'Update an admin user' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin user updated successfully',
  })
  async updateAdminUser(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<AdminUserResponseDto> {
    // TODO: Extract user ID from authenticated request
    const performingUserId = (req.user?.id as string) || 'system';
    return this.adminService.updateAdminUser(
      id,
      updateAdminUserDto,
      performingUserId,
    );
  }

  // Client User Management
  @Get('users/clients')
  @ApiOperation({ summary: 'Get list of client users' })
  @ApiQuery({
    name: 'status',
    enum: UserStatus,
    required: false,
    description: 'Filter by user status',
  })
  @ApiResponse({
    status: 200,
    description: 'Client users retrieved successfully',
    type: PageDto<ClientUserResponseDto>,
  })
  async getClientUsers(
    @Query() pageOptions: PageOptionsDto,
    @Query('status') status?: UserStatus,
  ): Promise<PageDto<ClientUserResponseDto>> {
    return this.adminService.getClientUsers(pageOptions, status);
  }

  @Get('users/clients/:id')
  @ApiOperation({ summary: 'Get client user details' })
  @ApiParam({ name: 'id', description: 'Client user ID' })
  @ApiResponse({
    status: 200,
    description: 'Client user details retrieved successfully',
  })
  async getClientUserDetails(
    @Param('id') id: string,
  ): Promise<ClientUserDetailResponseDto> {
    return this.adminService.getClientUserDetails(id);
  }

  @Post('users/clients')
  @ApiOperation({ summary: 'Create a new client user' })
  @ApiResponse({
    status: 201,
    description: 'Client user created successfully',
  })
  async createClientUser(
    @Body() createClientUserDto: CreateClientUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ClientUserResponseDto> {
    // TODO: Extract user ID from authenticated request
    const performingUserId = (req.user?.id as string) || 'system';
    return this.adminService.createClientUser(
      createClientUserDto,
      performingUserId,
    );
  }

  @Put('users/clients/:id')
  @ApiOperation({ summary: 'Update a client user' })
  @ApiParam({ name: 'id', description: 'Client user ID' })
  @ApiResponse({
    status: 200,
    description: 'Client user updated successfully',
  })
  async updateClientUser(
    @Param('id') id: string,
    @Body() updateClientUserDto: UpdateClientUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ClientUserResponseDto> {
    // TODO: Extract user ID from authenticated request
    const performingUserId = (req.user?.id as string) || 'system';
    return this.adminService.updateClientUser(
      id,
      updateClientUserDto,
      performingUserId,
    );
  }

  @Delete('users/clients/:id')
  @ApiOperation({ summary: 'Delete a client user (soft delete)' })
  @ApiParam({ name: 'id', description: 'Client user ID' })
  @ApiResponse({
    status: 204,
    description: 'Client user deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClientUser(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    // TODO: Extract user ID from authenticated request
    const performingUserId = (req.user?.id as string) || 'system';
    return this.adminService.deleteClientUser(id, performingUserId);
  }

  // Audit Logs
  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: PageDto<AuditLogResponseDto>,
  })
  async getAuditLogs(
    @Query() pageOptions: PageOptionsDto,
    @Query() filters: AuditLogFilterDto,
  ): Promise<PageDto<AuditLogResponseDto>> {
    return this.auditLogService.getAuditLogs(filters, pageOptions);
  }

  @Get('users/:userId/audit-logs')
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User audit logs retrieved successfully',
    type: PageDto<AuditLogResponseDto>,
  })
  async getUserAuditLogs(
    @Param('userId') userId: string,
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<AuditLogResponseDto>> {
    return this.auditLogService.getUserAuditLogs(userId, pageOptions);
  }

  // TODO: Add subscription management endpoints
  // TODO: Add lead management endpoints
  // TODO: Add CRM endpoints
}
