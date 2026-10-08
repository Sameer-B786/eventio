import { NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Protect specific routes
  const isProtectedRoute = pathname.startsWith('/idgen') || pathname.startsWith('/api/events');

  // Skip protection for public static files, images, etc. (handled by matcher)
  
  if (isProtectedRoute) {
    const idToken = request.cookies.get('idToken')?.value;
    
    if (!idToken) {
      // Redirect to login page and optionally pass the original URL to redirect back after login
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }

    try {
      const decoded = decodeJwt(idToken);
      // Basic expiration check on edge (signature is fully verified in session.js on server)
      if (decoded.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to these routes
    '/idgen/:path*', 
    '/api/events/:path*',
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
