import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Recruitment Partner Portal — AdSky Solution',
  description: 'Submit candidates and grow with AdSky Recruitment Partner Program.',
};

export default function RecruitmentLayout({ children }) {
  return (
    <div className={inter.className + ' min-h-screen bg-slate-50 text-slate-900'}>
      {children}
      <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } }} />
    </div>
  );
}
