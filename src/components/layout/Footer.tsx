import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Instagram } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : undefined;
  const isUnderDevelopment = pathname === '/';
  return (
    <footer className="bg-[#071013] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/PitaMeltLogo1.jpg"
                alt="Pita Melt Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-[#f17105]">Pita Melt</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your gateway to a premium Mediterranean adventure. Located in the heart of Calgary, 
              we invite you to try our carefully crafted dishes, made from the best ingredients.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/pitameltyyc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#f17105] transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#f17105] mb-4">Quick Links</h3>
            <div className="space-y-2">
              {isUnderDevelopment ? (
                <p className="text-gray-500 text-sm">Navigation disabled during development.</p>
              ) : (
                <>
                  <Link href="/" className="block text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                  <Link href="/menu" className="block text-gray-300 hover:text-white transition-colors">
                    Menu
                  </Link>
                  <Link href="/about" className="block text-gray-300 hover:text-white transition-colors">
                    About Us
                  </Link>
                  <Link href="/catering" className="block text-gray-300 hover:text-white transition-colors">
                    Catering
                  </Link>
                  <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">
                    Contact
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#f17105] mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4 text-[#f17105]" />
                <a 
                  href="tel:(403) 293-5809"
                  className="hover:text-white transition-colors"
                >
                  (403) 293-5809
                </a>
              </div>
              <div className="flex items-start space-x-2 text-gray-300">
                <MapPin className="h-4 w-4 text-[#f17105] mt-1 flex-shrink-0" />
                <a
                  href="https://maps.google.com/?q=7196+Temple+Dr+NE+#22+Calgary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  7196 Temple Dr NE #22<br />
                  Calgary, AB
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-[#f17105] mb-2">Hours</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span>Mon - Thu:</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Fri - Sat:</span>
                  <span>11:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>12:00 PM - 9:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Pita Melt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}