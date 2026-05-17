import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'SwiftBus - Premium Ethiopian Bus Travel',
  description: 'Book bus tickets across Ethiopia with SwiftBus. Fast, safe, and reliable bus travel connecting 10+ cities.',
  keywords: 'bus tickets, Ethiopia, Addis Ababa, Bahirdar, Hawasa, Mekele, bus booking',
  openGraph: {
    title: 'SwiftBus - Premium Ethiopian Bus Travel',
    description: 'Book bus tickets across Ethiopia with SwiftBus.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: '100vh' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
