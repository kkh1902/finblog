import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'FinBoard - Financial Blog Platform',
    template: '%s | FinBoard'
  },
  description: 'A modern financial blog platform for sharing insights, analysis, and market discussions.',
  keywords: ['finance', 'blog', 'trading', 'investment', 'market analysis'],
  authors: [{ name: 'FinBoard Team' }],
  creator: 'FinBoard',
  publisher: 'FinBoard',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FinBoard - Financial Blog Platform',
    description: 'A modern financial blog platform for sharing insights, analysis, and market discussions.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'FinBoard',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FinBoard - Financial Blog Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinBoard - Financial Blog Platform',
    description: 'A modern financial blog platform for sharing insights, analysis, and market discussions.',
    images: ['/images/twitter-image.jpg'],
    creator: '@finboard',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}