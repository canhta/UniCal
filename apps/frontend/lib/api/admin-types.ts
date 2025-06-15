// Admin API types for type-safe communication with backend

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'SuperAdmin' | 'Admin';
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface ClientUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  registrationDate: string;
  lastLogin?: string;
  subscriptionStatus?: 'Active' | 'Inactive' | 'Cancelled';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  performingAdminUser: {
    id: string;
    fullName: string;
    email: string;
  };
  actionType: string;
  affectedEntityType: string;
  affectedEntityId: string;
  details: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
  };
  status: 'Active' | 'Cancelled' | 'Past Due' | 'Trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'lead';
}

export interface DashboardStats {
  totalClientUsers: number;
  newRegistrationsLast7Days: number;
  activeSubscriptions: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateClientUserDto {
  fullName: string;
  email: string;
  password?: string;
}

export interface UpdateClientUserDto {
  fullName?: string;
  phoneNumber?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
}

export interface CreateAdminUserDto {
  fullName: string;
  email: string;
  role: 'Admin' | 'SuperAdmin';
}

export interface UpdateAdminUserDto {
  role?: 'Admin' | 'SuperAdmin';
  status?: 'Active' | 'Inactive';
}
