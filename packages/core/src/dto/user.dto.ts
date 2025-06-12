import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * User DTOs
 */

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  emailVerified?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class UserResponseDto {
  id!: string;
  email!: string;
  name?: string | null;
  avatarUrl?: string | null;
  timeZone?: string | null;
  emailVerified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword!: string;

  @IsString()
  newPassword!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  newPassword!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  displayName!: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

export class AuthResponseDto {
  user!: UserResponseDto;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}
