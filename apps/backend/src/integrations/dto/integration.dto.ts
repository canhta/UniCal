import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';

export class OAuthUrlResponseDto {
  @ApiProperty({
    description: 'OAuth authorization URL for frontend redirect',
    example: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=...',
  })
  @IsString()
  url!: string;

  @ApiProperty({
    description: 'State token for CSRF protection (optional for debugging)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;
}

export class OAuthCallbackQueryDto {
  @ApiProperty({
    description: 'Authorization code from OAuth provider',
    example: '4/0AY0e-g7Q...',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    description: 'State token for CSRF protection',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  state!: string;

  @ApiProperty({
    description: 'OAuth error if authorization failed',
    example: 'access_denied',
    required: false,
  })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiProperty({
    description: 'Error description from OAuth provider',
    example: 'The user denied the request.',
    required: false,
  })
  @IsOptional()
  @IsString()
  error_description?: string;

  @ApiProperty({
    description: 'Scope granted by the OAuth provider',
    example: 'https://www.googleapis.com/auth/calendar',
    required: false,
  })
  @IsOptional()
  @IsString()
  scope?: string;
}

export class ProviderParamDto {
  @ApiProperty({
    description: 'OAuth provider name',
    example: 'google',
    enum: ['google', 'microsoft'],
  })
  @IsString()
  @IsIn(['google', 'microsoft'])
  provider!: string;
}

export class SyncTriggerResponseDto {
  @ApiProperty({
    description: 'Connected account ID',
    example: 'clm1234567890',
  })
  @IsString()
  accountId!: string;

  @ApiProperty({
    description: 'Whether sync was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Sync result message',
    example: 'Manual sync completed: 3 calendars processed',
  })
  @IsString()
  message!: string;
}
