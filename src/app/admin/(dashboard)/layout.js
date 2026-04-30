import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Admin - AdSky Solution' };

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark">
      <AdminSidebar />
      <main className="lg:ml-60 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
