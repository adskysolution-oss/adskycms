import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'AdSky Solution - Digital Marketing & Technology Solutions',
  description: 'Transform your business with cutting-edge digital solutions. Web development, mobile apps, digital marketing, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid #334155',
          },
        }} />
      </body>
    </html>
  );
}
