/**
 * Common authentication types used across the application
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName?: string | null;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

/**
 * Auth0 user payload from JWT token
 */
export interface Auth0User {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string;
  email: string;
  displayName?: string;
  iat?: number;
  exp?: number;
}

/**
 * Auth0 request interface for Auth0 strategy
 */
export interface Auth0Request {
  user: Auth0User;
}
