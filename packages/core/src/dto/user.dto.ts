import { BaseResponseDto } from './base.dto';

/**
 * User DTOs
 */

export interface CreateUserDto {
  email: string;
  name?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export interface UpdateUserDto {
  displayName?: string;
  avatarUrl?: string;
  timeZone?: string;
  password?: string;
}

export interface UserResponseDto extends BaseResponseDto {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  timeZone?: string | null;
  emailVerified: boolean;
}
