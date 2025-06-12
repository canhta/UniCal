/**
 * Common API response types and wrappers
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListResponse<T> extends Array<T> {}

/**
 * Standard query parameters for pagination
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard query parameters for filtering by date
 */
export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

/**
 * Base success response for operations that don't return data
 */
export interface SuccessResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  [key: string]: any;
}
