'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, Phone, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getTotalItems, toggleCart } = useCartStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'About', href: '/about' },
    { name: 'Catering', href: '/catering' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <header className="bg-[#071013] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/PitaMeltLogo1.jpg"
              alt="Pita Melt Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-[#f17105]">Pita Melt</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-[#f17105] transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Contact Info & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Phone */}
            <a
              href="tel:(403) 293-5809"
              className="flex items-center space-x-1 text-sm hover:text-[#f17105] transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>(403) 293-5809</span>
            </a>

            {/* Location */}
            <a
              href="https://maps.google.com/?q=7196+Temple+Dr+NE+#22+Calgary"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm hover:text-[#f17105] transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden lg:block">Temple Dr NE</span>
            </a>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="relative p-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f17105] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile menu button & cart */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="relative p-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f17105] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-[#f17105] p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#071013] border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-white hover:text-[#f17105] hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Contact Info */}
              <div className="pt-4 border-t border-gray-700">
                <a
                  href="tel:(403) 293-5809"
                  className="flex items-center space-x-2 px-3 py-2 text-white hover:text-[#f17105] transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>(403) 293-5809</span>
                </a>
                <a
                  href="https://maps.google.com/?q=7196+Temple+Dr+NE+#22+Calgary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 text-white hover:text-[#f17105] transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>7196 Temple Dr NE #22, Calgary</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}