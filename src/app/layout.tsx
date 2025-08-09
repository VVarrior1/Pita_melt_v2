import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Layout from '@/components/layout/Layout';
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pita Melt - Authentic Mediterranean Cuisine in Calgary',
  description: 'Experience authentic Mediterranean cuisine at Pita Melt in Calgary. Fresh pita wraps, shawarma, falafel, and platters. Order online for pickup.',
  keywords: 'Mediterranean food, shawarma, falafel, pita wrap, Calgary restaurant, online ordering, pickup',
  authors: [{ name: 'Pita Melt' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Pita Melt - Authentic Mediterranean Cuisine',
    description: 'Experience authentic Mediterranean cuisine at Pita Melt in Calgary. Order online for pickup.',
    url: 'https://pitamelt.com',
    siteName: 'Pita Melt',
    images: [
      {
        url: '/images/PitaMeltLogo1.jpg',
        width: 1200,
        height: 630,
        alt: 'Pita Melt - Mediterranean Restaurant'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pita Melt - Authentic Mediterranean Cuisine',
    description: 'Experience authentic Mediterranean cuisine at Pita Melt in Calgary. Order online for pickup.',
    images: ['/images/PitaMeltLogo1.jpg']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/PitaMeltLogo1.jpg" />
        <link rel="apple-touch-icon" href="/images/PitaMeltLogo1.jpg" />
      </head>
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
        <Analytics />
      </body>
    </html>
  );
}
