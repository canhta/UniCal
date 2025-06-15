import {
  UserResponseDto,
  UpdateUserDto,
  ChangePasswordDto,
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
  ConnectedAccountResponseDto,
} from '@unical/core';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000';

console.log('🔧 API Client initialized with base URL:', API_BASE_URL);

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
    this.loadTokensFromStorage();
  }

  // Token management methods
  public setTokens(tokens: UniCalTokens): void {
    this.uniCalTokens = tokens;
    this.saveTokensToStorage();
  }

  public getTokens(): UniCalTokens | null {
    return this.uniCalTokens;
  }

  public clearTokens(): void {
    this.uniCalTokens = null;
    this.clearTokensFromStorage();
  }

  private saveTokensToStorage(): void {
    if (typeof window !== 'undefined' && this.uniCalTokens) {
      localStorage.setItem('unical_tokens', JSON.stringify(this.uniCalTokens));
    }
  }

  private loadTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('unical_tokens');
      if (stored) {
        try {
          this.uniCalTokens = JSON.parse(stored);
        } catch (error) {
          console.warn('Failed to parse stored tokens:', error);
          this.clearTokensFromStorage();
        }
      }
    }
  }

  private clearTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unical_tokens');
    }
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
        // Save refreshed tokens to storage
        this.saveTokensToStorage();
        console.log('✅ Tokens refreshed successfully');
        return this.uniCalTokens;
      } else {
        console.warn('Token refresh failed:', response.status);
        // Clear invalid tokens
        this.clearTokens();
      }
    } catch (error) {
      console.warn('Failed to refresh UniCal tokens:', error);
      // Clear tokens on error
      this.clearTokens();
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
    
    // First attempt with current tokens
    let headers = await this.getHeaders(includeAuth);
    let response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // If we get 401 and have tokens, try to refresh
    if (response.status === 401 && includeAuth && this.uniCalTokens?.refreshToken) {
      console.log('Access token expired, attempting refresh...');
      const newTokens = await this.refreshUniCalTokens();
      
      if (newTokens) {
        // Retry with new tokens
        headers = await this.getHeaders(includeAuth);
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });
      }
    }

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

      // Clear tokens if unauthorized even after refresh
      if (response.status === 401 && includeAuth) {
        console.log('Authentication failed, clearing tokens');
        this.clearTokens();
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

    const result = await this.request<AuthResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens after successful login
    if (result.accessToken && result.refreshToken) {
      this.setTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    }

    return result;
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const result = await this.request<AuthResponseDto>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens after successful registration
    if (result.accessToken && result.refreshToken) {
      this.setTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    }

    return result;
  }

  // Exchange NextAuth session for UniCal JWT tokens
  async exchangeTokens(userData: {
    email: string;
    name?: string;
    image?: string;
    provider?: string;
  }): Promise<AuthResponseDto> {
    const result = await this.request<AuthResponseDto>('/auth/exchange-token', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false); // Don't include auth header for token exchange

    // Store tokens after successful exchange
    if (result.accessToken && result.refreshToken) {
      this.setTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    }

    return result;
  }

  // Check authentication status
  async getAuthStatus(): Promise<UserResponseDto> {
    return this.request<UserResponseDto>('/auth/status', {
      method: 'GET',
    });
  }

  // Verify email with token
  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, false); // Don't include auth header for email verification
  }

  // Logout and clear tokens
  async logout(): Promise<{ message: string }> {
    try {
      const result = await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
      return result;
    } finally {
      // Always clear tokens even if logout request fails
      this.clearTokens();
    }
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

  // Connected Accounts endpoints (using new integrations module)
  async getConnectedAccounts(): Promise<ConnectedAccountResponseDto[]> {
    return this.request<ConnectedAccountResponseDto[]>('/integrations/accounts');
  }

  async getConnectedAccount(accountId: string): Promise<ConnectedAccountResponseDto> {
    return this.request<ConnectedAccountResponseDto>(`/accounts/${accountId}`);
  }

  async disconnectAccount(accountId: string): Promise<void> {
    return this.request<void>(`/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  // OAuth integration endpoints
  async getOAuthUrl(provider: 'google' | 'microsoft'): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/integrations/oauth-url/${provider}`);
  }

  async manualSync(accountId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/integrations/sync/${accountId}`, {
      method: 'POST',
    });
  }

  // Check if tokens are available and valid
  public hasValidTokens(): boolean {
    return !!(this.uniCalTokens?.accessToken && this.uniCalTokens?.refreshToken);
  }

  // Get current authentication status
  public async verifyAuth(): Promise<boolean> {
    if (!this.hasValidTokens()) {
      return false;
    }

    try {
      await this.getAuthStatus();
      return true;
    } catch {
      return false;
    }
  }
}

// Export a default instance
export const apiClient = new ApiClient();
