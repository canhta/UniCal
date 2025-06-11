import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsString()
  auth0Id: string;

  @IsEmail()
  email: string;

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
  id: string;
  auth0Id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  timeZone?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
