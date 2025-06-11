import { BaseResponseDto } from './base.dto';

/**
 * Connected Accounts DTOs
 */

export interface ConnectedAccountResponseDto extends BaseResponseDto {
  userId: string;
  provider: string;
  providerAccountId: string;
  accountEmail?: string;
  scopes?: string[];
}

export interface InternalCreateConnectedAccountDto {
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
  accountEmail?: string;
  metadata?: Record<string, any>;
}

export interface InternalUpdateConnectedAccountDto {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}
