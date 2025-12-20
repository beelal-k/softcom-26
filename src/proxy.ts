import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password', '/auth/reset-password'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for user token in cookies
  const userCookie = request.cookies.get('user');
  let isAuthenticated = false;

  // Verify authentication
  if (userCookie) {
    try {
      const userData = JSON.parse(userCookie.value);
      if (userData.id || userData._id) {
        isAuthenticated = true;
      }
    } catch (error) {
      // Invalid cookie
      isAuthenticated = false;
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // If accessing root, redirect based on authentication
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard/overview', request.url));
    }
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // If accessing dashboard routes without authentication
  if (pathname.startsWith('/dashboard')) {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to sign-in page
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
