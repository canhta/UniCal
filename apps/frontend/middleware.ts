import { NextResponse } from 'next/server';
import { auth } from './auth';
// import { isAdmin } from './lib/auth/roles'; // TODO: Use when backend implements roles

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // Allow access to admin login page
    if (pathname === '/admin/login') {
      // Redirect to admin dashboard if already logged in
      if (req.auth?.user) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }
    
    // Protect all other admin routes
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    
    // TODO: Uncomment when backend implements roles
    // Check if user has admin role
    // if (!isAdmin(req.auth)) {
    //   return NextResponse.redirect(new URL('/dashboard', req.url));
    // }
    
    // For now, allow any authenticated user to access admin
    return NextResponse.next();
  }
  
  // Protected user routes
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/calendar') || 
      pathname.startsWith('/integrations') || 
      pathname.startsWith('/settings')) {
    
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }
  
  // Auth routes (login, register)
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    // Redirect to dashboard if already logged in
    if (req.auth?.user) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    // Match protected user routes
    '/dashboard/:path*',
    '/calendar/:path*',
    '/integrations/:path*',
    '/settings/:path*',
    // Match auth routes for redirect logic
    '/login',
    '/register',
  ],
};
