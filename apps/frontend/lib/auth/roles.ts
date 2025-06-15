import { Session } from 'next-auth';

// Define user roles
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Define route types
export enum RouteType {
  PUBLIC = 'PUBLIC',
  PROTECTED = 'PROTECTED',
  ADMIN = 'ADMIN',
}

// Extended session type with roles
export interface ExtendedSession extends Session {
  user?: Session['user'] & {
    roles?: UserRole[];
    role?: UserRole; // For backward compatibility
  };
}

// Check if user has admin role
export function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  
  const extendedSession = session as ExtendedSession;
  const userRoles = extendedSession.user?.roles || [];
  const userRole = extendedSession.user?.role;
  
  return (
    userRoles.includes(UserRole.ADMIN) ||
    userRoles.includes(UserRole.SUPER_ADMIN) ||
    userRole === UserRole.ADMIN ||
    userRole === UserRole.SUPER_ADMIN
  );
}

// Check if user has super admin role
export function isSuperAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  
  const extendedSession = session as ExtendedSession;
  const userRoles = extendedSession.user?.roles || [];
  const userRole = extendedSession.user?.role;
  
  return (
    userRoles.includes(UserRole.SUPER_ADMIN) ||
    userRole === UserRole.SUPER_ADMIN
  );
}

// Check if user has any of the required roles
export function hasRole(session: Session | null, requiredRoles: UserRole[]): boolean {
  if (!session?.user) return false;
  
  const extendedSession = session as ExtendedSession;
  const userRoles = extendedSession.user?.roles || [];
  const userRole = extendedSession.user?.role;
  
  return (
    requiredRoles.some(role => userRoles.includes(role)) ||
    (userRole ? requiredRoles.includes(userRole) : false)
  );
}

// Get user's role for display purposes
export function getUserRole(session: Session | null): UserRole | null {
  if (!session?.user) return null;
  
  const extendedSession = session as ExtendedSession;
  const userRoles = extendedSession.user?.roles || [];
  const userRole = extendedSession.user?.role;
  
  // Prioritize the highest role
  if (userRoles.includes(UserRole.SUPER_ADMIN) || userRole === UserRole.SUPER_ADMIN) {
    return UserRole.SUPER_ADMIN;
  }
  if (userRoles.includes(UserRole.ADMIN) || userRole === UserRole.ADMIN) {
    return UserRole.ADMIN;
  }
  if (userRoles.includes(UserRole.USER) || userRole === UserRole.USER) {
    return UserRole.USER;
  }
  
  return UserRole.USER; // Default to user role
}

// Check if current route is admin route
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

// Check if current route is protected route
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = ['/dashboard', '/calendar', '/integrations', '/settings'];
  return protectedPaths.some(path => pathname.startsWith(path));
}

// Get route type based on pathname
export function getRouteType(pathname: string): RouteType {
  if (isAdminRoute(pathname)) return RouteType.ADMIN;
  if (isProtectedRoute(pathname)) return RouteType.PROTECTED;
  return RouteType.PUBLIC;
}
