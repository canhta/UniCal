import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class OAuthUserDto {
  @ApiProperty()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty()
  @IsString()
  provider?: string;

  constructor(data: Partial<OAuthUserDto>) {
    Object.assign(this, data);
  }
} 