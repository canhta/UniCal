import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * Base response DTO with common audit fields
 */
export abstract class BaseResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '2023-06-11T09:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-06-11T09:00:00.000Z' })
  updatedAt: string;
}

/**
 * Base DTO for creating entities
 */
export abstract class BaseCreateDto {
  // Common create fields can be added here if needed
}

/**
 * Base DTO for updating entities with optional fields
 */
export abstract class BaseUpdateDto {
  // Common update fields can be added here if needed
}

/**
 * Common pagination query DTO
 */
export class PaginationQueryDto {
  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
    description: 'Page number (1-based)',
  })
  page?: number = 1;

  @IsOptional()
  @ApiProperty({
    example: 20,
    required: false,
    description: 'Number of items per page',
  })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'createdAt',
    required: false,
    description: 'Field to sort by',
  })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'desc',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * Common date range query DTO
 */
export class DateRangeQueryDto {
  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2023-06-01T00:00:00.000Z',
    required: false,
    description: 'Start date for filtering (ISO 8601)',
  })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2023-06-30T23:59:59.999Z',
    required: false,
    description: 'End date for filtering (ISO 8601)',
  })
  endDate?: string;
}

/**
 * Combined pagination and date range query DTO
 */
export class PaginatedDateRangeQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2023-06-01T00:00:00.000Z',
    required: false,
    description: 'Start date for filtering (ISO 8601)',
  })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2023-06-30T23:59:59.999Z',
    required: false,
    description: 'End date for filtering (ISO 8601)',
  })
  endDate?: string;
}
