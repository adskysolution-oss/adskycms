import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that require authentication
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
    '/admin/:path*', 
    '/dashboard/:path*', 
    '/onboarding/:path*', 
    '/pending-approval'
  ],
};
