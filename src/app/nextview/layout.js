import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "NexVia — MLM & Smart FD Platform",
  description: "NexVia Network Member Portal & 3×15 Matrix Rewards Platform",
  icons: {
    icon: '/logoTitle.png',
    shortcut: '/logoTitle.png',
    apple: '/logoTitle.png',
  },
};

export default function NextViewLayout({ children }) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
