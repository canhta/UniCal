import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request);

  // Ensure middleware doesn't handle the `/auth` routes, auto-mounted by the SDK
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  // Allow access to public routes without requiring a session
  if (request.nextUrl.pathname === "/" || 
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/favicon") ||
      request.nextUrl.pathname.startsWith("/sitemap") ||
      request.nextUrl.pathname.startsWith("/robots")) {
    return authRes;
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/calendar", "/integrations", "/settings"];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const { origin } = new URL(request.url);
    const session = await auth0.getSession();

    // If the user does not have a session, redirect to login
    if (!session) {
      return NextResponse.redirect(`${origin}/auth/login?returnTo=${request.nextUrl.pathname}`);
    }
  }

  // If a valid session exists or route is not protected, continue with the response from Auth0 middleware
  return authRes;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - api/auth (Auth0 routes) - handled by Auth0 middleware
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
