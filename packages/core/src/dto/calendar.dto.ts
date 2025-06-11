import { BaseResponseDto } from './base.dto';

/**
 * Calendar DTOs
 */

export interface CalendarResponseDto extends BaseResponseDto {
  externalId?: string;
  name: string;
  description?: string;
  color?: string;
  timeZone?: string;
  isDefault: boolean;
  isVisible: boolean;
  connectedAccountId?: string;
  userId: string;
}

export interface SyncCalendarDto {
  connectedAccountId: string;
  externalCalendarId: string;
  name: string;
  description?: string;
  color?: string;
  timeZone?: string;
}

export interface UpdateCalendarSettingsDto {
  isVisible?: boolean;
  color?: string;
  name?: string;
}
