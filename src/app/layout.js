import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'AdSky Solution - Premium IT Company',
  description: 'Premium IT support, scalable digital systems, and modern software solutions for growing businesses.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#000000] text-white antialiased">
        <Navbar />
        {children}
        <Footer />
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#0B0B10',
            color: '#FFFFFF',
            border: '1px solid #1A1A2E',
          },
        }} />
      </body>
    </html>
  );
}

