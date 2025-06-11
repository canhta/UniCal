import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsUUID,
  IsDateString,
} from 'class-validator';

/**
 * Common decorator combinations for frequent validation patterns
 */

// UUID Field
export const UUIDField = (description?: string, example?: string) => {
  return function (target: object, propertyKey: string) {
    IsUUID()(target, propertyKey);
    ApiProperty({
      example: example || '123e4567-e89b-12d3-a456-426614174000',
      description: description || 'UUID identifier',
      format: 'uuid',
    })(target, propertyKey);
  };
};

// Optional UUID Field
export const OptionalUUIDField = (description?: string, example?: string) => {
  return function (target: object, propertyKey: string) {
    IsOptional()(target, propertyKey);
    IsUUID()(target, propertyKey);
    ApiProperty({
      example: example || '123e4567-e89b-12d3-a456-426614174000',
      description: description || 'Optional UUID identifier',
      format: 'uuid',
      required: false,
    })(target, propertyKey);
  };
};

// String Field
export const StringField = (
  description?: string,
  example?: string,
  isOptional = false,
) => {
  return function (target: object, propertyKey: string) {
    if (isOptional) {
      IsOptional()(target, propertyKey);
    }
    IsString()(target, propertyKey);
    ApiProperty({
      example: example || 'Sample text',
      description: description || 'Text field',
      required: !isOptional,
    })(target, propertyKey);
  };
};

// Email Field
export const EmailField = (
  description?: string,
  example?: string,
  isOptional = false,
) => {
  return function (target: object, propertyKey: string) {
    if (isOptional) {
      IsOptional()(target, propertyKey);
    }
    IsEmail()(target, propertyKey);
    ApiProperty({
      example: example || 'user@example.com',
      description: description || 'Email address',
      format: 'email',
      required: !isOptional,
    })(target, propertyKey);
  };
};

// URL Field
export const UrlField = (
  description?: string,
  example?: string,
  isOptional = false,
) => {
  return function (target: object, propertyKey: string) {
    if (isOptional) {
      IsOptional()(target, propertyKey);
    }
    IsUrl()(target, propertyKey);
    ApiProperty({
      example: example || 'https://example.com',
      description: description || 'URL',
      format: 'url',
      required: !isOptional,
    })(target, propertyKey);
  };
};

// DateTime Field
export const DateTimeField = (
  description?: string,
  example?: string,
  isOptional = false,
) => {
  return function (target: object, propertyKey: string) {
    if (isOptional) {
      IsOptional()(target, propertyKey);
    }
    IsDateString()(target, propertyKey);
    ApiProperty({
      example: example || '2023-06-11T10:00:00.000Z',
      description: description || 'ISO 8601 datetime',
      format: 'date-time',
      required: !isOptional,
    })(target, propertyKey);
  };
};
