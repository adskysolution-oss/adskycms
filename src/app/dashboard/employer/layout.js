'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

export default function EmployerLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip check for onboarding and pending pages to avoid loops
    if (pathname.startsWith('/onboarding') || pathname === '/pending-approval') {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/companies');
        const data = await res.json();
        
        if (!data.company) {
          router.push('/onboarding/company');
        } else if (data.company.status !== 'approved') {
          router.push('/pending-approval');
        } else {
          setLoading(false);
        }
      } catch (error) {
        router.push('/auth/login');
      }
    };

    checkStatus();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-4">
        <FaSpinner className="animate-spin text-primary" size={40} />
        <p className="text-text-muted font-bold tracking-tighter uppercase">Securing Recruitment Hub...</p>
      </div>
    );
  }

  return <>{children}</>;
}
