import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password', '/auth/reset-password'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Check for user token in cookies or localStorage (we'll check via header)
  const userCookie = request.cookies.get('user');
  const authHeader = request.headers.get('authorization');

  // If accessing root, redirect to sign-in
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // If accessing dashboard routes without authentication
  if (pathname.startsWith('/dashboard')) {
    // Check if user data exists in cookie
    if (!userCookie) {
      // Redirect to sign-in page
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    try {
      // Verify user cookie contains valid data
      const userData = JSON.parse(userCookie.value);
      if (!userData.id && !userData._id) {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      // Invalid user data, redirect to sign-in
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
