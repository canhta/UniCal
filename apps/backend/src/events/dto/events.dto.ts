import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'platform_event_123' })
  externalId?: string;

  @ApiProperty({ example: 'Team Meeting' })
  title: string;

  @ApiProperty({ example: 'Weekly team sync meeting' })
  description?: string;

  @ApiProperty({ example: '2023-06-11T10:00:00.000Z' })
  startTime: string;

  @ApiProperty({ example: '2023-06-11T11:00:00.000Z' })
  endTime: string;

  @ApiProperty({ example: false })
  isAllDay?: boolean;

  @ApiProperty({ example: 'Conference Room A' })
  location?: string;

  @ApiProperty({ example: 'https://meet.google.com/xxx' })
  url?: string;

  @ApiProperty({ example: 'confirmed' })
  status?: string;

  @ApiProperty({ example: 'public' })
  visibility?: string;

  @ApiProperty({ example: 'FREQ=WEEKLY;BYDAY=MO' })
  recurrenceRule?: string;

  @ApiProperty({ example: '2023-06-11T09:00:00.000Z' })
  lastSyncedAt?: string;

  @ApiProperty({ example: 'synced' })
  syncStatus?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  calendarId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: '2023-06-11T09:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-06-11T09:00:00.000Z' })
  updatedAt: string;
}

export class CreateEventRequestDto {
  @IsString()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  calendarId: string;

  @IsString()
  @ApiProperty({ example: 'Team Meeting' })
  title: string;

  @IsDateString()
  @ApiProperty({ example: '2023-06-11T10:00:00.000Z' })
  startTime: string;

  @IsDateString()
  @ApiProperty({ example: '2023-06-11T11:00:00.000Z' })
  endTime: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  isAllDay?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Weekly team sync meeting' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Conference Room A' })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'https://meet.google.com/xxx' })
  url?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'confirmed' })
  status?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'public' })
  visibility?: string;
}

export class UpdateEventRequestDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Updated Team Meeting' })
  title?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2023-06-11T10:30:00.000Z' })
  startTime?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2023-06-11T11:30:00.000Z' })
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  isAllDay?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Updated description' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Conference Room B' })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'https://meet.google.com/yyy' })
  url?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'confirmed' })
  status?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'private' })
  visibility?: string;
}

export class GetEventsQueryDto {
  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2023-06-01T00:00:00.000Z', required: false })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2023-06-30T23:59:59.000Z', required: false })
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: false,
  })
  calendarIds?: string[];
}
