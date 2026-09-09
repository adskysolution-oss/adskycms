import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'AdSky Solution - Premium IT Company',
  description: 'Premium IT support, scalable digital systems, and modern software solutions for growing businesses.',
  icons: {
    icon: '/logoTitle.png',
    shortcut: '/logoTitle.png',
    apple: '/logoTitle.png',
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-slate-900 antialiased">
        <Navbar />
        {children}
        <Footer />
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        }} />
      </body>
    </html>
  );
}
