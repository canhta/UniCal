import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  BaseResponseDto,
  PaginatedDateRangeQueryDto,
} from '@unical/core';
import {
  UUIDField,
  StringField,
  DateTimeField,
  OptionalUUIDField,
} from '../../common/decorators';

export class EventResponseDto extends BaseResponseDto {
  @OptionalUUIDField('External event ID from platform')
  externalId?: string;

  @StringField('Event title', 'Team Meeting')
  title: string;

  @StringField('Event description', 'Weekly team sync meeting', true)
  description?: string;

  @DateTimeField('Event start time', '2023-06-11T10:00:00.000Z')
  startTime: string;

  @DateTimeField('Event end time', '2023-06-11T11:00:00.000Z')
  endTime: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  isAllDay?: boolean;

  @StringField('Event location', 'Conference Room A', true)
  location?: string;

  @StringField('Event URL', 'https://meet.google.com/xxx', true)
  url?: string;

  @StringField('Event status', 'confirmed', true)
  status?: string;

  @StringField('Event visibility', 'public', true)
  visibility?: string;

  @StringField('Recurrence rule', 'FREQ=WEEKLY;BYDAY=MO', true)
  recurrenceRule?: string;

  @DateTimeField('Last synced time', '2023-06-11T09:00:00.000Z', true)
  lastSyncedAt?: string;

  @StringField('Sync status', 'synced', true)
  syncStatus?: string;

  @UUIDField('Calendar ID')
  calendarId: string;

  @UUIDField('User ID')
  userId: string;
}

export class CreateEventRequestDto {
  @UUIDField('Calendar ID')
  calendarId: string;

  @StringField('Event title', 'Team Meeting')
  title: string;

  @DateTimeField('Event start time', '2023-06-11T10:00:00.000Z')
  startTime: string;

  @DateTimeField('Event end time', '2023-06-11T11:00:00.000Z')
  endTime: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  isAllDay?: boolean;

  @StringField('Event description', 'Weekly team sync meeting', true)
  description?: string;

  @StringField('Event location', 'Conference Room A', true)
  location?: string;

  @StringField('Event URL', 'https://meet.google.com/xxx', true)
  url?: string;

  @StringField('Event status', 'confirmed', true)
  status?: string;

  @StringField('Event visibility', 'public', true)
  visibility?: string;
}

export class UpdateEventRequestDto {
  @StringField('Event title', 'Updated Team Meeting', true)
  title?: string;

  @DateTimeField('Event start time', '2023-06-11T10:30:00.000Z', true)
  startTime?: string;

  @DateTimeField('Event end time', '2023-06-11T11:30:00.000Z', true)
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  isAllDay?: boolean;

  @StringField('Event description', 'Updated description', true)
  description?: string;

  @StringField('Event location', 'Conference Room B', true)
  location?: string;

  @StringField('Event URL', 'https://meet.google.com/yyy', true)
  url?: string;

  @StringField('Event status', 'confirmed', true)
  status?: string;

  @StringField('Event visibility', 'private', true)
  visibility?: string;
}

export class GetEventsQueryDto extends PaginatedDateRangeQueryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: false,
    description: 'Filter events by calendar IDs',
  })
  calendarIds?: string[];
}
