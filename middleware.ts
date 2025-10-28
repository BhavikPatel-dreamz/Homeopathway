import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Get auth token from cookies
  const token = req.cookies.get('sb-access-token')?.value;
  const pathname = req.nextUrl.pathname;

  // Check if the user is accessing admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Note: For proper role checking, we'd need to verify the JWT token
    // For now, the client-side will handle the role check
    // You can enhance this by decoding the JWT and checking the role claim
  }

  // Check if accessing login/register while potentially logged in
  if (token && (pathname === '/login' || pathname === '/register')) {
    // User is logged in, let the page handle the redirect based on role
    // Or you can redirect to home by default
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register'],
};
