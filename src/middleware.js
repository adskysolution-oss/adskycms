import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Define Route Types
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  const isApiAdminRoute = pathname.startsWith('/api/admin');
  const isApiProtectedSection = pathname.startsWith('/api/user') || pathname.startsWith('/api/dashboard');

  // 2. Auth Check Logic
  let user = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      user = payload;
    } catch (error) {
      console.error('JWT verification failed in middleware');
    }
  }

  // 3. Handle Unauthorized Access to API Admin Routes
  if (isApiAdminRoute) {
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 4. Handle Redirection for Page Routes
  
  // If user is logged in and tries to access login/register
  if (isAuthRoute && user) {
    const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect Admin Pages
  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?callback=' + pathname, request.url));
    }
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Dashboard Pages
  if (isDashboardRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?callback=' + pathname, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/api/admin/:path*',
    '/api/dashboard/:path*',
  ],
};
