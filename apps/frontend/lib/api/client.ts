import {
  UserResponseDto,
  UpdateUserDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  EventResponseDto,
  CreateEventRequestDto,
  UpdateEventRequestDto,
  GetEventsQueryDto,
  CalendarResponseDto,
  SyncCalendarDto,
  UpdateCalendarSettingsDto,
  PlatformCalendarDto,
} from '@unical/core';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface ApiError {
  message: string;
  statusCode?: number;
}

interface UniCalTokens {
  accessToken: string;
  refreshToken: string;
}

export // Types for API requests and responses
interface UpdateUserData {
  displayName?: string;
  avatarUrl?: string;
  timeZone?: string;
}



class ApiClient {
  private baseUrl: string;
  private uniCalTokens: UniCalTokens | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Refresh UniCal tokens
  private async refreshUniCalTokens(): Promise<UniCalTokens | null> {
    try {
      if (!this.uniCalTokens?.refreshToken) return null;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.uniCalTokens.refreshToken,
        }),
      });

      if (response.ok) {
        const tokens = await response.json();
        this.uniCalTokens = {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
        return this.uniCalTokens;
      }
    } catch (error) {
      console.warn('Failed to refresh UniCal tokens:', error);
    }
    return null;
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      if (this.uniCalTokens?.accessToken) {
        headers['Authorization'] = `Bearer ${this.uniCalTokens.accessToken}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders(includeAuth);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
      } catch {
        // Use the default error message if JSON parsing fails
      }

      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  // Auth endpoints
  async login(data: LoginDto): Promise<AuthResponseDto> {

    console.log('ApiClient:login called with data:', data);

    return this.request<AuthResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    return this.request<AuthResponseDto>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // User endpoints
  async getCurrentUser(): Promise<UserResponseDto> {
    return this.request<UserResponseDto>('/user/me');
  }

  async updateCurrentUser(data: UpdateUserDto): Promise<UserResponseDto> {
    return this.request<UserResponseDto>('/user/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/user/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Events endpoints
  async getEvents(query?: GetEventsQueryDto): Promise<EventResponseDto[]> {
    let queryString = '';
    if (query) {
      const params = Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) =>
          Array.isArray(value)
            ? value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`).join('&')
            : `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        )
        .join('&');
      queryString = params ? `?${params}` : '';
    }
    return this.request<EventResponseDto[]>(`/events${queryString}`);
  }

  async getEventById(eventId: string): Promise<EventResponseDto> {
    return this.request<EventResponseDto>(`/events/${eventId}`);
  }

  async createEvent(data: CreateEventRequestDto): Promise<EventResponseDto> {
    return this.request<EventResponseDto>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(eventId: string, data: UpdateEventRequestDto): Promise<EventResponseDto> {
    return this.request<EventResponseDto>(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    return this.request<void>(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Calendar endpoints
  async getUserCalendars(includeHidden?: boolean): Promise<CalendarResponseDto[]> {
    const queryString = includeHidden !== undefined ? `?includeHidden=${includeHidden}` : '';
    return this.request<CalendarResponseDto[]>(`/calendars${queryString}`);
  }

  async getExternalCalendars(accountId: string): Promise<PlatformCalendarDto[]> {
    return this.request<PlatformCalendarDto[]>(`/calendars/external/${accountId}`);
  }

  async syncCalendar(data: SyncCalendarDto): Promise<CalendarResponseDto> {
    return this.request<CalendarResponseDto>('/calendars/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCalendarSettings(calendarId: string, data: UpdateCalendarSettingsDto): Promise<CalendarResponseDto> {
    return this.request<CalendarResponseDto>(`/calendars/${calendarId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async unsyncCalendar(calendarId: string): Promise<void> {
    return this.request<void>(`/calendars/${calendarId}`, {
      method: 'DELETE',
    });
  }
}

// Export a default instance
export const apiClient = new ApiClient();
