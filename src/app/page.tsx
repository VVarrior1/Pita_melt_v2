import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/shawarmabg.webp"
            alt="Delicious Shawarma"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Image
              src="/images/PitaMeltLogo1.jpg"
              alt="Pita Melt Logo"
              width={120}
              height={120}
              className="mx-auto rounded-full mb-6"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-[#f17105]">Pita Melt</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Your gateway to a premium Mediterranean adventure. Located in the heart of Calgary, 
            we invite you to try our carefully crafted dishes, made from the best ingredients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button size="lg" className="w-full sm:w-auto">
                Order Online Now
              </Button>
            </Link>
            <a href="tel:(403) 293-5809">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Phone className="mr-2 h-5 w-5" />
                Call to Order
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f17105] rounded-full mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <a 
                href="tel:(403) 293-5809"
                className="text-[#f17105] hover:text-[#e55a00] text-lg transition-colors"
              >
                (403) 293-5809
              </a>
            </div>

            {/* Location */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f17105] rounded-full mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <a
                href="https://maps.google.com/?q=7196+Temple+Dr+NE+#22+Calgary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f17105] hover:text-[#e55a00] transition-colors"
              >
                7196 Temple Dr NE #22<br />
                Calgary, AB
              </a>
            </div>

            {/* Hours */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f17105] rounded-full mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hours</h3>
              <div className="text-gray-300">
                <p>Mon-Thu: 11AM-10PM</p>
                <p>Fri-Sat: 11AM-11PM</p>
                <p>Sun: 12PM-9PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured <span className="text-[#f17105]">Favorites</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Taste the authentic flavors of the Mediterranean with our most popular dishes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Chicken Shawarma */}
            <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <div className="relative h-32 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500 opacity-80">
                <div className="text-white text-6xl">🥙</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Chicken Shawarma</h3>
                <p className="text-gray-400 mb-4">
                  Tender marinated chicken wrapped in fresh pita with garlic sauce and vegetables
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-[#f17105] font-bold text-lg">From $8.50</span>
                  <Link href="/menu">
                    <Button size="sm">Order Now</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Falafel Wrap */}
            <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <div className="relative h-32 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 opacity-80">
                <div className="text-white text-6xl">🧆</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  Falafel Wrap
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Vegan</span>
                </h3>
                <p className="text-gray-400 mb-4">
                  Crispy homemade falafel with fresh vegetables and tahini sauce
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-[#f17105] font-bold text-lg">From $7.50</span>
                  <Link href="/menu">
                    <Button size="sm">Order Now</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tenderloin Platter */}
            <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <div className="relative h-32 flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500 opacity-80">
                <div className="text-white text-6xl">🍽️</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Tenderloin Platter</h3>
                <p className="text-gray-400 mb-4">
                  Premium beef tenderloin with rice, salad, and your choice of sauces
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-[#f17105] font-bold text-lg">$16.99</span>
                  <Link href="/menu">
                    <Button size="sm">Order Now</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#f17105]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl text-white mb-8">
            Experience authentic Mediterranean cuisine with convenient online ordering and pickup
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Browse Full Menu
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#f17105]">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}