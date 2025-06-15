/**
 * Base DTOs for common patterns
 * These DTOs can be extended by both frontend and backend
 */

import { ApiProperty } from '@nestjs/swagger';

/**
 * Base response DTO with common audit fields
 */
export abstract class BaseResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '2023-06-11T09:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2023-06-11T09:00:00.000Z' })
  updatedAt!: string;
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
