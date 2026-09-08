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
    <div className={inter.className + ' min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950 text-white'}>
      {children}
      <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#fff', border: '1px solid #7c3aed' } }} />
    </div>
  );
}
