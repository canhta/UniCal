const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

interface EventsQueryParams {
  start?: string;
  end?: string;
  calendarId?: string;
  limit?: number;
}

interface CreateEventData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  location?: string;
  calendarId?: string;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  location?: string;
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
  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/user/me');
  }

  async updateCurrentUser(userData: UpdateUserData) {
    return this.request('/user/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Events endpoints (placeholder for future implementation)
  async getEvents(params?: EventsQueryParams) {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.request(`/events${queryString}`);
  }

  async createEvent(eventData: CreateEventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, eventData: UpdateEventData) {
    return this.request(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }
}

// Export a default instance
export const apiClient = new ApiClient();
