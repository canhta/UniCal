import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  IsPhoneNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

// Type unions for enum-like values
export const AdminRole = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
} as const;
export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  DELETED: 'DELETED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const LeadStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  DISQUALIFIED: 'DISQUALIFIED',
  CONVERTED: 'CONVERTED',
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const AuditAction = {
  CREATE_CLIENT_USER: 'CREATE_CLIENT_USER',
  UPDATE_CLIENT_USER: 'UPDATE_CLIENT_USER',
  DELETE_CLIENT_USER: 'DELETE_CLIENT_USER',
  CREATE_ADMIN_USER: 'CREATE_ADMIN_USER',
  UPDATE_ADMIN_USER: 'UPDATE_ADMIN_USER',
  UPDATE_ADMIN_ROLE: 'UPDATE_ADMIN_ROLE',
  CREATE_LEAD: 'CREATE_LEAD',
  UPDATE_LEAD: 'UPDATE_LEAD',
  CONVERT_LEAD: 'CONVERT_LEAD',
  DELETE_LEAD: 'DELETE_LEAD',
  CANCEL_SUBSCRIPTION: 'CANCEL_SUBSCRIPTION',
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_LOGOUT: 'ADMIN_LOGOUT',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// Admin User DTOs
export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsIn(Object.values(AdminRole))
  role!: AdminRole;
}

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsIn(Object.values(AdminRole))
  role?: AdminRole;

  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: UserStatus;
}

export interface AdminUserResponseDto {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

// Client User DTOs
export class CreateClientUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  initialPassword?: string;
}

export class UpdateClientUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: UserStatus;
}

export interface ClientUserResponseDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: UserStatus;
  registrationDate: Date;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientUserDetailResponseDto extends ClientUserResponseDto {
  emailVerified: boolean;
  avatarUrl: string | null;
  timeZone: string | null;
  roles: string[];
  subscription?: {
    id: string;
    planName: string;
    status: string;
    startDate: Date;
    endDate?: Date;
    renewalDate?: Date;
  };
}

// Lead DTOs
export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsIn(Object.values(LeadStatus))
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export interface LeadResponseDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  companyName: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  convertedToUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ConvertLeadDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  initialPassword?: string;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];
}

// Audit Log DTOs
export interface AuditLogResponseDto {
  id: string;
  timestamp: Date;
  performingUserId: string;
  performingUserName: string;
  action: string;
  entityType: string;
  affectedUserId?: string;
  affectedUserName?: string;
  affectedLeadId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogFilterDto {
  @IsOptional()
  @IsString()
  performingUserId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

// Dashboard DTOs
export interface DashboardStatsDto {
  totalClientUsers: number;
  totalAdminUsers: number;
  newRegistrationsThisMonth: number;
  activeSubscriptions: number;
  pendingLeads: number;
  revenueThisMonth: number;
  userGrowthPercentage: number;
}

/**
 * Subscription response DTO
 * Note: Currently used only on the frontend side.
 * The backend implementation is pending (marked as TODO in admin.controller.ts).
 */
export interface SubscriptionResponseDto {
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

export interface SearchResultDto {
  id: string;
  type: 'client_user' | 'admin_user' | 'lead';
  name: string;
  email: string;
  status: string;
  additionalInfo?: string;
}
