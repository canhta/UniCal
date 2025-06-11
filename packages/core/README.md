# @unical/core

Shared types, DTOs, and interfaces for the UniCal monorepo.

## Overview

This package provides a centralized location for all shared types, DTOs, and interfaces used across the UniCal monorepo (frontend and backend). This ensures type consistency and makes it easy to maintain shared contracts between different parts of the application.

## Installation

The package is automatically linked in the monorepo workspace. To use it in your workspace:

```bash
# Add to backend
yarn workspace @unical/backend add @unical/core

# Add to frontend  
yarn workspace @unical/frontend add @unical/core
```

## Usage

### Import Types and DTOs

```typescript
import { 
  // Auth types
  LoginDto, 
  AuthResponseDto, 
  RegisterDto,
  
  // Calendar types
  CalendarResponseDto,
  CreateEventRequestDto,
  EventResponseDto,
  
  // API types
  ApiResponse,
  PaginatedResponse,
  
  // Utility functions
  formatDate,
  formatDateTime,
  isValidEmail 
} from '@unical/core';
```

### Example Usage in Frontend

```typescript
// Type-safe form validation
function validateLoginForm(email: string, password: string): LoginDto | null {
  if (!isValidEmail(email) || !password) {
    return null;
  }
  
  return { email, password };
}

// Type-safe API response handling
function handleApiResponse<T>(response: ApiResponse<T>): T | null {
  if (response.success && response.data) {
    return response.data;
  }
  
  console.error('API Error:', response.error || response.message);
  return null;
}
```

### Example Usage in Backend

```typescript
// Use shared DTOs in NestJS controllers
import { LoginDto, AuthResponseDto } from '@unical/core';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    // Implementation
  }
}
```

## Package Structure

```
src/
├── dto/                    # Data Transfer Objects
│   ├── auth.dto.ts        # Authentication DTOs
│   ├── user.dto.ts        # User DTOs  
│   ├── calendar.dto.ts    # Calendar DTOs
│   ├── event.dto.ts       # Event DTOs
│   ├── account.dto.ts     # Account DTOs
│   └── base.dto.ts        # Base DTOs for common patterns
├── types/                  # Type definitions
│   ├── api.types.ts       # API response types
│   ├── auth.types.ts      # Authentication types
│   ├── entity.types.ts    # Database entity types
│   └── external-event.types.ts # External platform types
├── interfaces/             # Interface definitions
│   └── calendar-platform.interface.ts # Platform service contracts
├── utils/                  # Utility functions
│   ├── date.utils.ts      # Date formatting utilities
│   └── api.utils.ts       # API helper utilities
└── index.ts               # Main export file
```

## Available Types

### Authentication
- `LoginDto` - Login form data
- `RegisterDto` - Registration form data  
- `AuthResponseDto` - Authentication response
- `AuthenticatedUser` - Authenticated user interface
- `JwtPayload` - JWT token payload

### Calendar & Events
- `CalendarResponseDto` - Calendar data response
- `EventResponseDto` - Event data response
- `CreateEventRequestDto` - Create event request
- `UpdateEventRequestDto` - Update event request
- `GetEventsQueryDto` - Event query parameters

### API Responses
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated data response
- `PaginationQuery` - Pagination query parameters
- `DateRangeQuery` - Date range filtering

### Platform Integration
- `ICalendarPlatformService` - Platform service interface
- `PlatformEventDto` - Platform-agnostic event data
- `PlatformCalendarDto` - Platform-agnostic calendar data

### Utilities
- `formatDate(date)` - Format date for display
- `formatTime(date)` - Format time for display  
- `formatDateTime(date)` - Format datetime for display
- `isValidEmail(email)` - Email validation
- `isValidUUID(uuid)` - UUID validation

## Development

### Build the package

```bash
# From root
yarn core:build

# From package directory
yarn build
```

### Watch mode for development

```bash
# From root
yarn core:dev

# From package directory  
yarn dev
```

### Clean build artifacts

```bash
# From root
yarn core:clean

# From package directory
yarn clean
```

## Workspace Commands

The following commands are available from the root of the monorepo:

```bash
yarn core <command>           # Run any command in the core workspace
yarn core:build              # Build the core package
yarn core:dev                # Watch mode for development
yarn core:clean              # Clean build artifacts
```

## Best Practices

1. **Add new types to the appropriate module** - Put auth-related types in `auth.dto.ts`, calendar types in `calendar.dto.ts`, etc.

2. **Use base DTOs** - Extend `BaseResponseDto` for response DTOs that include audit fields

3. **Export from index** - Always add new exports to the appropriate index.ts file

4. **Build before committing** - Always run `yarn core:build` to ensure types compile correctly

5. **Version together** - The core package version should be updated when making breaking changes

## Integration with Backend

The backend uses these types with NestJS decorators:

```typescript
import { LoginDto } from '@unical/core';
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Extend the core DTO with validation decorators
export class ValidatedLoginDto implements LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
```

## Integration with Frontend

The frontend can use these types directly for type safety:

```typescript
import { CalendarResponseDto, formatDate } from '@unical/core';

interface CalendarListProps {
  calendars: CalendarResponseDto[];
}

export function CalendarList({ calendars }: CalendarListProps) {
  return (
    <div>
      {calendars.map(calendar => (
        <div key={calendar.id}>
          <h3>{calendar.name}</h3>
          <p>Created: {formatDate(new Date(calendar.createdAt))}</p>
        </div>
      ))}
    </div>
  );
}
```
