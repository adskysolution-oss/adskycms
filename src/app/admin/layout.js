'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null);

  const isLoginPage = pathname === '/admin/login' || pathname?.startsWith('/admin/login');

  useEffect(() => {
    if (isLoginPage) return;

    let isMounted = true;
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          if (isMounted) router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        const role = data?.user?.role;
        const validAdminRoles = ['admin', 'super_admin', 'operations_admin', 'superadmin'];
        if (validAdminRoles.includes(role)) {
          if (isMounted) setIsAdmin(true);
        } else {
          if (isMounted) router.replace('/admin/login');
        }
      } catch {
        if (isMounted) router.replace('/admin/login');
      }
    }

    checkAdminAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // On login page, render plain full-screen children with NO sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while verifying admin authentication on protected pages
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated Admin view with Sidebar
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />
      {/* pt-14 on mobile clears the sticky top header bar; lg:ml-64 applies sidebar offset only on desktop */}
      <main className="flex-1 pt-14 lg:pt-0 lg:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
