import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import {
  BaseResponseDto,
  BaseCreateDto,
  BaseUpdateDto,
} from '../../common/dto';
import {
  UUIDField,
  StringField,
  OptionalUUIDField,
} from '../../common/decorators';

/**
 * Response DTO for calendar entities
 */
export class CalendarResponseDto extends BaseResponseDto {
  @OptionalUUIDField('External calendar ID from provider')
  externalId?: string;

  @StringField('Calendar name', 'My Calendar')
  name: string;

  @StringField('Calendar description', 'Personal calendar', true)
  description?: string;

  @StringField('Calendar color', '#1976D2', true)
  color?: string;

  @StringField('Calendar timezone', 'America/New_York', true)
  timeZone?: string;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiProperty({ example: true })
  isVisible: boolean;

  @OptionalUUIDField('Connected account ID')
  connectedAccountId?: string;

  @UUIDField('User ID')
  userId: string;
}

/**
 * DTO for syncing an external calendar
 */
export class SyncCalendarDto extends BaseCreateDto {
  @UUIDField('Connected account ID')
  connectedAccountId: string;

  @StringField('External calendar ID', 'primary')
  externalCalendarId: string;

  @StringField('Calendar name', 'My Google Calendar')
  name: string;

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
 * DTO for updating calendar settings
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
