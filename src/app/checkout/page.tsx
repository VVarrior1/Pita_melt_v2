'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, User, Phone, Mail, CreditCard, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { CustomerInfo } from '@/types/menu';
import PaymentSection from '@/components/checkout/PaymentSection';
import OrderSummary from '@/components/checkout/OrderSummary';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(20);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [marketingConsent, setMarketingConsent] = useState({
    email: false,
    sms: false
  });

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/menu');
    }

    const baseTime = 20;
    const additionalTime = Math.floor(totalItems / 3) * 5;
    setEstimatedTime(Math.min(baseTime + additionalTime, 45));
  }, [items, router, totalItems]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!customerInfo.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!customerInfo.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!customerInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!customerInfo.email.trim()) {
      errors.email = 'Email address is required';
    }

    const emailPattern = new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
    if (customerInfo.email && !emailPattern.test(customerInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }

    const phoneDigits = customerInfo.phone.replace(new RegExp('[^0-9]', 'g'), '');
    if (customerInfo.phone && phoneDigits.length < 10) {
      errors.phone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatEstimatedTime = () => {
    const now = new Date();
    const pickupTime = new Date(now.getTime() + estimatedTime * 60000);
    return pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold">
            Checkout <span className="text-[#f17105]">({totalItems} items)</span>
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-[#f17105] mr-2" />
                <h2 className="text-xl font-semibold">Pickup Information</h2>
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-[#f17105] mr-2" />
                  <p className="text-white font-medium">
                    Ready for pickup at {formatEstimatedTime()}
                  </p>
                </div>
                <p className="text-gray-400 text-sm ml-6">
                  About {estimatedTime} minutes from confirmation
                </p>
              </div>
              <p className="text-gray-400 text-sm mt-3">
                <strong>Pickup Address:</strong><br />
                7196 Temple Dr NE #22, Calgary, AB<br />
                <strong>Phone:</strong> (403) 293-5809
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <User className="h-5 w-5 text-[#f17105] mr-2" />
                <h2 className="text-xl font-semibold">Customer Information</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full p-3 bg-gray-800 border rounded-lg text-white focus:border-[#f17105] focus:ring-1 focus:ring-[#f17105] ${
                        validationErrors.firstName ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="Enter your first name"
                      required
                    />
                    {validationErrors.firstName && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {validationErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full p-3 bg-gray-800 border rounded-lg text-white focus:border-[#f17105] focus:ring-1 focus:ring-[#f17105] ${
                        validationErrors.lastName ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="Enter your last name"
                      required
                    />
                    {validationErrors.lastName && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {validationErrors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full p-3 bg-gray-800 border rounded-lg text-white focus:border-[#f17105] focus:ring-1 focus:ring-[#f17105] ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="(403) 123-4567"
                      required
                    />
                    {validationErrors.phone && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full p-3 bg-gray-800 border rounded-lg text-white focus:border-[#f17105] focus:ring-1 focus:ring-[#f17105] ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="your@email.com"
                      required
                    />
                    {validationErrors.email && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                </div>

              <p className="text-gray-400 text-sm mt-4">
                * Required fields. We'll use this information to contact you about your order.
              </p>

              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h4 className="text-white font-medium mb-3">Stay Connected (Optional)</h4>
                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={marketingConsent.email}
                          onChange={(e) => setMarketingConsent(prev => ({ ...prev, email: e.target.checked }))}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          marketingConsent.email 
                            ? 'bg-[#f17105] border-[#f17105]' 
                            : 'border-gray-500 hover:border-gray-400'
                        }`}>
                          {marketingConsent.email && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="text-white text-sm">I'd like to receive email updates about new menu items, special offers, and promotions</span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={marketingConsent.sms}
                          onChange={(e) => setMarketingConsent(prev => ({ ...prev, sms: e.target.checked }))}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          marketingConsent.sms 
                            ? 'bg-[#f17105] border-[#f17105]' 
                            : 'border-gray-500 hover:border-gray-400'
                        }`}>
                          {marketingConsent.sms && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="text-white text-sm">I'd like to receive SMS notifications about order updates and exclusive deals</span>
                      </div>
                    </label>
                  </div>
                  <p className="text-gray-400 text-xs mt-3">
                    You can unsubscribe at any time. By checking these boxes, you agree to receive marketing communications from Pita Melt.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <CreditCard className="h-5 w-5 text-[#f17105] mr-2" />
                <h2 className="text-xl font-semibold">Payment Information</h2>
              </div>

              <div className="p-6">
                <PaymentSection
                  customerInfo={customerInfo}
                  totalAmount={totalPrice}
                  estimatedPickupMinutes={estimatedTime}
                  onPaymentSuccess={() => {
                    toast.success('Payment successful! Order confirmed.');
                    clearCart();
                    router.push('/order-confirmation');
                  }}
                  onPaymentError={(error) => {
                    toast.error(`Payment failed: ${error}`);
                  }}
                  disabled={isProcessing}
                  onValidate={() => validateForm()}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary
                items={items}
                totalPrice={totalPrice}
                estimatedTime={estimatedTime}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}