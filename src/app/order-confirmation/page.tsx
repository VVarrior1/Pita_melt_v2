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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Order <span className="text-[#f17105]">Confirmed!</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Thank you for your order! We&apos;re preparing your delicious Mediterranean meal.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
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
              <div className="bg-[#f17105] bg-opacity-10 border border-[#f17105] rounded-lg p-4 mb-4">
                <p className="text-[#f17105] font-bold text-lg">
                  Ready by: {estimatedTime}
                </p>
                <p className="text-gray-300 text-sm">
                  Estimated preparation time: 20 minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
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
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
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
        <div className="text-center mt-12 p-6 bg-gray-900 rounded-lg">
          <p className="text-gray-400 text-sm">
            Thank you for choosing Pita Melt! We look forward to serving you again soon. 🥙
          </p>
        </div>
      </div>
    </div>
  );
}