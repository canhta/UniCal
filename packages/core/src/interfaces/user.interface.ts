export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  timeZone: string | null;
  emailVerified: boolean;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
} 