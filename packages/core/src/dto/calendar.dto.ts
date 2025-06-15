import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { BaseResponseDto, BaseCreateDto, BaseUpdateDto } from './base.dto';
import { UUIDField, StringField, OptionalUUIDField } from '../decorators';

/**
 * Calendar DTOs for frontend and backend communication
 */

export class CalendarResponseDto extends BaseResponseDto {
  @OptionalUUIDField('External calendar ID from provider')
  externalId?: string;

  @StringField('Calendar name', 'My Calendar')
  name!: string;

  @StringField('Calendar description', 'Personal calendar', true)
  description?: string;

  @StringField('Calendar color', '#1976D2', true)
  color?: string;

  @StringField('Calendar timezone', 'America/New_York', true)
  timeZone?: string;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiProperty({ example: true })
  isVisible!: boolean;

  @OptionalUUIDField('Connected account ID')
  connectedAccountId?: string;

  @UUIDField('User ID')
  userId!: string;
}

/**
 * DTO for syncing an external calendar
 */
export class SyncCalendarDto extends BaseCreateDto {
  @UUIDField('Connected account ID')
  connectedAccountId!: string;

  @StringField('External calendar ID', 'primary')
  externalCalendarId!: string;

  @StringField('Calendar name', 'My Google Calendar')
  name!: string;

  @StringField(
    'Calendar description',
    'Main calendar for personal events',
    true,
  )
  description?: string;

  @StringField('Calendar color', '#1976D2', true)
  color?: string;

  @StringField('Calendar timezone', 'America/New_York', true)
  timeZone?: string;
}

/**
 * DTO for creating a calendar
 */
export class CreateCalendarRequestDto extends BaseCreateDto {
  @StringField('Calendar name', 'My Calendar')
  name!: string;

  @StringField('Calendar description', 'Personal calendar', true)
  description?: string;

  @StringField('Calendar color', '#1976D2', true)
  color?: string;

  @StringField('Calendar timezone', 'America/New_York', true)
  timeZone?: string;

  @IsOptional()
  @ApiProperty({ example: false })
  isDefault?: boolean;

  @IsOptional()
  @ApiProperty({ example: true })
  isVisible?: boolean;
}

/**
 * DTO for updating a calendar
 */
export class UpdateCalendarRequestDto extends BaseUpdateDto {
  @StringField('Calendar name', 'Updated Calendar', true)
  name?: string;

  @StringField('Calendar description', 'Updated description', true)
  description?: string;

  @StringField('Calendar color', '#2196F3', true)
  color?: string;

  @StringField('Calendar timezone', 'America/Los_Angeles', true)
  timeZone?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true })
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  isVisible?: boolean;
}

/**
 * DTO for updating calendar settings (visibility, color, etc.)
 */
export class UpdateCalendarSettingsDto extends BaseUpdateDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isVisible?: boolean;

  @StringField('Calendar color', '#FF5722', true)
  color?: string;

  @StringField('Calendar name', 'Updated Calendar Name', true)
  name?: string;
}
