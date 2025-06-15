import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Common pagination DTOs that can be reused across the application
 */

export class PageOptionsDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Page number (1-based)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
    description: 'Number of items per page',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  readonly limit?: number = 10;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 10);
  }

  get take(): number {
    return this.limit ?? 10;
  }
}

export interface PageMetaDto {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export class PageDto<T> {
  constructor(
    public readonly data: T[],
    public readonly meta: PageMetaDto,
  ) {}
}

/**
 * Utility function to create pagination metadata
 */
export function createPageMeta(
  pageOptions: PageOptionsDto,
  totalItems: number,
): PageMetaDto {
  const page = pageOptions.page ?? 1;
  const limit = pageOptions.limit ?? 10;
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

/**
 * Paginated query with date range support
 */
export class PaginatedDateRangeQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    example: '2023-06-01T00:00:00.000Z',
    description: 'Start date for filtering',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2023-06-30T23:59:59.999Z',
    description: 'End date for filtering',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * Search query DTO
 */
export class SearchQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    example: 'search term',
    description: 'Search query string',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
