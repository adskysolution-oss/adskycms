import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin') || '*';

  // 1. Universal CORS for all /api/ routes (Mobile App & Web)
  if (pathname.startsWith('/api/')) {
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  // 2. Protected web routes logic
  const token = request.cookies.get('token')?.value;

  const protectedPaths = ['/admin', '/dashboard', '/onboarding', '/pending-approval'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  // Exclude auth pages from protection to avoid loops
  if (pathname.startsWith('/auth') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (isProtected) {
    if (!token) {
      const loginUrl = pathname.startsWith('/admin') ? '/admin/login' : '/auth/login';
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role;

      // Role-based restrictions
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/' + role, request.url));
      }

      if (pathname.startsWith('/dashboard/employer') && role !== 'employer') {
        return NextResponse.redirect(new URL('/dashboard/candidate', request.url));
      }

      if (pathname.startsWith('/dashboard/candidate') && role !== 'candidate') {
        return NextResponse.redirect(new URL('/dashboard/employer', request.url));
      }

    } catch (error) {
      const loginUrl = pathname.startsWith('/admin') ? '/admin/login' : '/auth/login';
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*', 
    '/dashboard/:path*', 
    '/onboarding/:path*', 
    '/pending-approval'
  ],
};
