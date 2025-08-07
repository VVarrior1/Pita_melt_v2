'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Cart from '@/components/cart/Cart';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Cart />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151'
          },
          success: {
            style: {
              background: '#065f46',
              color: '#d1fae5'
            }
          },
          error: {
            style: {
              background: '#7f1d1d',
              color: '#fecaca'
            }
          }
        }}
      />
    </div>
  );
}