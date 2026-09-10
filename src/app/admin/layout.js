import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
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

