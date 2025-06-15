// Admin API client for communicating with the backend admin endpoints

import {
  AdminUser,
  ClientUser,
  AuditLog,
  Subscription,
  SearchResult,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  CreateClientUserDto,
  UpdateClientUserDto,
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from './admin-types';

class AdminApiClient {
  private baseUrl: string;

  constructor() {
    // TODO: Get this from environment variables
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // TODO: Add authentication headers
    // const token = await getAccessToken();
    // if (token) {
    //   defaultHeaders['Authorization'] = `Bearer ${token}`;
    // }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request<DashboardStats>('/admin/dashboard/stats');
  }

  // Client Users
  async getClientUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<ClientUser>>(
      `/admin/users/clients?${queryParams.toString()}`
    );
  }

  async getClientUser(id: string) {
    return this.request<ApiResponse<ClientUser>>(`/admin/users/clients/${id}`);
  }

  async createClientUser(data: CreateClientUserDto) {
    return this.request<ApiResponse<ClientUser>>('/admin/users/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClientUser(id: string, data: UpdateClientUserDto) {
    return this.request<ApiResponse<ClientUser>>(`/admin/users/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClientUser(id: string) {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/users/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Users
  async getAdminUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<AdminUser>>(
      `/admin/users/admins?${queryParams.toString()}`
    );
  }

  async getAdminUser(id: string) {
    return this.request<ApiResponse<AdminUser>>(`/admin/users/admins/${id}`);
  }

  async createAdminUser(data: CreateAdminUserDto) {
    return this.request<ApiResponse<AdminUser>>('/admin/users/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminUser(id: string, data: UpdateAdminUserDto) {
    return this.request<ApiResponse<AdminUser>>(`/admin/users/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Global Search
  async searchClients(query: string) {
    return this.request<{
      results: SearchResult[];
    }>(`/admin/search/clients?query=${encodeURIComponent(query)}`);
  }

  // Audit Logs
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    adminUserId?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<AuditLog>>(
      `/admin/audit-logs?${queryParams.toString()}`
    );
  }

  // Subscriptions
  async getSubscriptions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<Subscription>>(
      `/admin/subscriptions?${queryParams.toString()}`
    );
  }

  async getSubscription(id: string) {
    return this.request<ApiResponse<Subscription>>(`/admin/subscriptions/${id}`);
  }

  async cancelSubscription(id: string) {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/subscriptions/${id}/cancel`, {
      method: 'POST',
    });
  }
}

export const adminApiClient = new AdminApiClient();
