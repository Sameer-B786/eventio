import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Protect all /idgen routes
  if (pathname.startsWith('/idgen')) {
    const idToken = request.cookies.get('idToken');
    
    // If no token, redirect to login
    if (!idToken) {
      const loginUrl = new URL('/api/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/idgen/:path*']
};
