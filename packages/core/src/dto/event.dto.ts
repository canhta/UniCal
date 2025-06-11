import { BaseResponseDto, PaginatedDateRangeQueryDto } from './base.dto';

/**
 * Event DTOs
 */

export interface EventResponseDto extends BaseResponseDto {
  externalId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  location?: string;
  url?: string;
  status?: string;
  visibility?: string;
  recurrenceRule?: string;
  lastSyncedAt?: string;
  syncStatus?: string;
  calendarId: string;
  userId: string;
}

export interface CreateEventRequestDto {
  calendarId: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  description?: string;
  location?: string;
  url?: string;
  status?: string;
  visibility?: string;
}

export interface UpdateEventRequestDto {
  title?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  description?: string;
  location?: string;
  url?: string;
  status?: string;
  visibility?: string;
}

export interface GetEventsQueryDto extends PaginatedDateRangeQueryDto {
  calendarIds?: string[];
}
