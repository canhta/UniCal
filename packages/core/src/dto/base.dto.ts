/**
 * Base DTOs for common patterns
 * These DTOs can be extended by both frontend and backend
 */

/**
 * Base response DTO with common audit fields
 */
export interface BaseResponseDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Common pagination query DTO
 */
export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Common date range query DTO
 */
export interface DateRangeQueryDto {
  startDate?: string;
  endDate?: string;
}

/**
 * Combined pagination and date range query DTO
 */
export interface PaginatedDateRangeQueryDto extends PaginationQueryDto {
  startDate?: string;
  endDate?: string;
}
