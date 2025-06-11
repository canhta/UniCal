import { BaseResponseDto } from './base.dto';

/**
 * Authentication DTOs
 */

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName?: string;
}

export interface Auth0LoginDto {
  accessToken: string;
}

export interface ProviderLoginDto {
  providerToken: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}
