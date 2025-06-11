import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectedAccountResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'google', enum: ['google', 'microsoft'] })
  provider: string;

  @ApiProperty({ example: 'google_account_id_123' })
  providerAccountId: string;

  @ApiProperty({ example: 'user@gmail.com' })
  accountEmail?: string;

  @ApiProperty({ example: ['https://www.googleapis.com/auth/calendar'] })
  scopes?: string[];

  @ApiProperty({ example: '2023-06-11T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-06-11T10:00:00.000Z' })
  updatedAt: Date;
}

export class InternalCreateConnectedAccountDto {
  @IsString()
  userId: string;

  @IsString()
  provider: string;

  @IsString()
  providerAccountId: string;

  @IsString()
  accessToken: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsEmail()
  accountEmail?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class InternalUpdateConnectedAccountDto {
  @IsString()
  accessToken: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  expiresAt?: Date;
}
