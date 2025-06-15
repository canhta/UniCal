import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export enum AdminRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
}

export class CreateAdminUserDto {
  @ApiProperty({
    description: 'Full name of the admin user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  @ApiProperty({
    description: 'Email address of the admin user',
    example: 'admin@unical.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role of the admin user',
    enum: AdminRole,
    example: AdminRole.ADMIN,
  })
  @IsEnum(AdminRole)
  role: AdminRole;
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional({
    description: 'Full name of the admin user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Role of the admin user',
    enum: AdminRole,
    example: AdminRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @ApiPropertyOptional({
    description: 'Status of the admin user',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class AdminUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: AdminRole })
  role: AdminRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;
}
