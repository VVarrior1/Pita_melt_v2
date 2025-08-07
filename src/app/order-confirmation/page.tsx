'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, MapPin, Phone, Mail, Home, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';

export default function OrderConfirmationPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear the cart when order is confirmed
    clearCart();
    
    // Generate a mock order number and pickup time
    // In real app, this would come from URL params or API
    const mockOrderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const pickupTime = new Date();
    pickupTime.setMinutes(pickupTime.getMinutes() + 20);
    
    setOrderNumber(mockOrderNumber);
    setEstimatedTime(pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-xl">
            <CheckCircle2 className="h-14 w-14 text-white animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Order <span className="text-[#f17105]">Confirmed!</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            🎉 Thank you for choosing Pita Melt! Your delicious Mediterranean meal is being prepared with care.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 mb-8 border border-gray-700 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Info */}
            <div>
              <div className="flex items-center mb-4">
                <Receipt className="h-5 w-5 text-[#f17105] mr-2" />
                <h2 className="text-xl font-semibold">Order Information</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Number:</span>
                  <span className="font-medium text-[#f17105]">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Status:</span>
                  <span className="text-green-400 font-medium">✓ Paid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Type:</span>
                  <span className="font-medium">Pickup</span>
                </div>
              </div>
            </div>

            {/* Pickup Info */}
            <div>
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-[#f17105] mr-2" />
                <h2 className="text-xl font-semibold">Pickup Information</h2>
              </div>
              <div className="bg-gradient-to-r from-[#f17105] to-[#e86004] rounded-xl p-6 mb-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium mb-1">Your order will be ready by</p>
                    <p className="text-white font-bold text-2xl">
                      {estimatedTime}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <p className="text-white text-opacity-90 text-sm">
                    ⏱️ Prep time: ~20 minutes • We'll notify you when it's ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 mb-8 border border-gray-700 shadow-2xl">
          <div className="flex items-center mb-6">
            <MapPin className="h-5 w-5 text-[#f17105] mr-2" />
            <h2 className="text-xl font-semibold">Pickup Location</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg text-[#f17105] mb-2">Pita Melt</h3>
              <div className="space-y-2 text-gray-300">
                <p>7196 Temple Dr NE #22</p>
                <p>Calgary, AB</p>
                <div className="flex items-center space-x-2 mt-4">
                  <Phone className="h-4 w-4 text-[#f17105]" />
                  <a 
                    href="tel:(403) 293-5809"
                    className="text-[#f17105] hover:underline font-medium"
                  >
                    (403) 293-5809
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Store Hours</h4>
              <div className="text-sm text-gray-400 space-y-1">
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

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => window.open('https://maps.google.com/?q=7196+Temple+Dr+NE+#22+Calgary', '_blank')}
              className="flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Get Directions</span>
            </Button>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 mb-8 border border-gray-700 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Mail className="h-5 w-5 text-[#f17105] mr-2" />
            What&apos;s Next?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-[#f17105] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-medium">We&apos;re preparing your order</h3>
                  <p className="text-sm text-gray-400">Our kitchen team has received your order and started preparation.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-[#f17105] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-medium">Order ready notification</h3>
                  <p className="text-sm text-gray-400">We&apos;ll send you an email when your order is ready for pickup.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-[#f17105] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-medium">Pick up your order</h3>
                  <p className="text-sm text-gray-400">Come to our location and let us know your order number.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-[#f17105]">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-300">
                  If you have any questions about your order, please don&apos;t hesitate to contact us.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-[#f17105]" />
                    <a href="tel:(403) 293-5809" className="text-[#f17105] hover:underline">
                      (403) 293-5809
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-[#f17105]" />
                    <span className="text-gray-300">orders@pitamelt.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/">
            <Button variant="outline" size="lg" className="flex items-center space-x-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Button>
          </Link>
          
          <Link href="/menu">
            <Button size="lg" className="w-full sm:w-auto">
              Order Again
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-[#f17105] to-[#e86004] rounded-xl shadow-xl">
          <p className="text-white text-lg font-medium">
            Thank you for choosing Pita Melt! 🥙
          </p>
          <p className="text-white text-opacity-90 text-sm mt-2">
            We look forward to serving you again soon. Follow us for updates and special offers!
          </p>
        </div>
      </div>
    </div>
  );
}