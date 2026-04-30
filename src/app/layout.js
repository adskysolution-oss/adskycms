import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'AdSky Solution - Premium IT Company',
  description: 'Premium IT support, scalable digital systems, and modern software solutions for growing businesses.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#020617] text-white antialiased">
        {children}
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#0f172a',
            color: '#FFFFFF',
            border: '1px solid #1E293B',
          },
        }} />
      </body>
    </html>
  );
}
