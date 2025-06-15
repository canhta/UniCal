import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  performingUserId: string;

  @ApiProperty()
  performingUserName: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  entityType: string;

  @ApiPropertyOptional()
  affectedUserId?: string;

  @ApiPropertyOptional()
  affectedUserName?: string;

  @ApiPropertyOptional()
  affectedLeadId?: string;

  @ApiPropertyOptional()
  details?: any;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  userAgent?: string;
}

export class AuditLogFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by performing admin user ID',
  })
  @IsOptional()
  @IsString()
  performingUserId?: string;

  @ApiPropertyOptional({
    description: 'Filter by action type',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity type',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Filter from date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter to date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export enum AuditAction {
  CREATE_CLIENT_USER = 'CREATE_CLIENT_USER',
  UPDATE_CLIENT_USER = 'UPDATE_CLIENT_USER',
  DELETE_CLIENT_USER = 'DELETE_CLIENT_USER',
  CREATE_ADMIN_USER = 'CREATE_ADMIN_USER',
  UPDATE_ADMIN_USER = 'UPDATE_ADMIN_USER',
  UPDATE_ADMIN_ROLE = 'UPDATE_ADMIN_ROLE',
  CREATE_LEAD = 'CREATE_LEAD',
  UPDATE_LEAD = 'UPDATE_LEAD',
  CONVERT_LEAD = 'CONVERT_LEAD',
  DELETE_LEAD = 'DELETE_LEAD',
  CANCEL_SUBSCRIPTION = 'CANCEL_SUBSCRIPTION',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_LOGOUT = 'ADMIN_LOGOUT',
}
