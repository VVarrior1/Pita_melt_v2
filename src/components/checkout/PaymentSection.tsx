'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Smartphone, Apple } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomerInfo } from '@/types/menu';
import { useCartStore } from '@/store/cartStore';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentSectionProps {
  customerInfo: CustomerInfo;
  totalAmount: number;
  estimatedPickupMinutes: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
  onValidate?: () => boolean;
}

export default function PaymentSection({
  customerInfo,
  totalAmount,
  estimatedPickupMinutes,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  onValidate
}: PaymentSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  const { items } = useCartStore();

  const validateCustomerInfo = (): boolean => {
    // Only name is required now
    return customerInfo.name?.trim().length > 0;
  };

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          customerInfo,
          items: items.map(item => ({
            id: item.id,
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.totalPrice,
            customizations: item.customizations,
            specialInstructions: item.specialInstructions
          })),
          estimatedPickupMinutes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  const handleCardPayment = async () => {
    // Run parent validation first
    if (onValidate && !onValidate()) {
      return; // Parent validation failed
    }
    
    if (!validateCustomerInfo()) {
      return; // Basic validation failed
    }

    setIsProcessing(true);
    
    try {
      // Create Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo,
          items: items.map(item => ({
            id: item.id,
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.totalPrice,
            customizations: item.customizations,
            specialInstructions: item.specialInstructions
          })),
          totalAmount: totalAmount,
          estimatedPickupMinutes: estimatedPickupMinutes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Checkout session creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        const detailsMsg = errorData.details ? `: ${errorData.details}` : '';
        throw new Error(`Failed to create checkout session (${response.status})${detailsMsg}`);
      }

      const { sessionId } = await response.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      console.error('Card payment error:', error);
      onPaymentError((error as Error).message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  const handleAppleGooglePay = async (method: 'apple_pay' | 'google_pay') => {
    // Run parent validation first
    if (onValidate && !onValidate()) {
      return; // Parent validation failed
    }
    
    if (!validateCustomerInfo()) {
      return; // Basic validation failed
    }

    setIsProcessing(true);
    
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const paymentRequest = stripe.paymentRequest({
        country: 'CA',
        currency: 'cad',
        total: {
          label: 'Pita Melt Order',
          amount: Math.round(totalAmount * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
      });

      const canMakePayment = await paymentRequest.canMakePayment();
      
      if (!canMakePayment) {
        throw new Error(`${method === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} is not available on this device`);
      }

      const clientSecret = await createPaymentIntent();

      paymentRequest.on('paymentmethod', async (ev) => {
        try {
          const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: ev.paymentMethod.id
          });

          if (confirmError) {
            ev.complete('fail');
            throw confirmError;
          }

          ev.complete('success');
          onPaymentSuccess();
        } catch (error: unknown) {
          ev.complete('fail');
          onPaymentError((error as Error).message);
        }
      });

      paymentRequest.show();
    } catch (error: unknown) {
      console.error(`${method} payment error:`, error);
      onPaymentError((error as Error).message || `${method === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} payment failed`);
    } finally {
      setIsProcessing(false);
    }
  };


  // Check if Apple Pay or Google Pay is available
  const [canUseApplePay, setCanUseApplePay] = useState(false);
  const [canUseGooglePay, setCanUseGooglePay] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  React.useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        setDeviceType('ios');
      } else if (/android/i.test(userAgent)) {
        setDeviceType('android');
      } else {
        setDeviceType('desktop');
      }
    };

    const checkPaymentMethods = async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) return;

        const paymentRequest = stripe.paymentRequest({
          country: 'CA',
          currency: 'cad',
          total: { label: 'Test', amount: 100 },
        });

        const canMakePayment = await paymentRequest.canMakePayment();
        if (canMakePayment) {
          // Prioritize Apple Pay on iOS devices
          if (deviceType === 'ios') {
            setCanUseApplePay(canMakePayment.applePay || false);
            // Also show Google Pay as secondary option on iOS if available
            setCanUseGooglePay(canMakePayment.googlePay || false);
          }
          // Prioritize Google Pay on Android devices  
          else if (deviceType === 'android') {
            setCanUseGooglePay(canMakePayment.googlePay || false);
            // Also show Apple Pay as secondary option on Android if available
            setCanUseApplePay(canMakePayment.applePay || false);
          }
          // On desktop, show both if available
          else {
            setCanUseApplePay(canMakePayment.applePay || false);
            setCanUseGooglePay(canMakePayment.googlePay || false);
          }
        }
      } catch (error) {
        console.log('Payment methods check failed:', error);
      }
    };

    detectDevice();
    checkPaymentMethods();
  }, [deviceType]);

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="grid grid-cols-1 gap-3">
        {/* Show preferred payment method first based on device */}
        {deviceType === 'ios' ? (
          <>
            {/* Apple Pay - Primary on iOS */}
            {canUseApplePay && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAppleGooglePay('apple_pay')}
                disabled={disabled || isProcessing}
                isLoading={isProcessing && paymentMethod === 'apple_pay'}
                className="w-full flex items-center justify-center space-x-2 bg-black border-2 border-gray-600 hover:bg-gray-900 text-white font-medium"
              >
                <Apple className="h-5 w-5 text-white" />
                <span>Pay with Apple Pay</span>
              </Button>
            )}

            {/* Google Pay - Secondary on iOS */}
            {canUseGooglePay && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAppleGooglePay('google_pay')}
                disabled={disabled || isProcessing}
                isLoading={isProcessing && paymentMethod === 'google_pay'}
                className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 hover:bg-gray-100 text-black font-medium"
              >
                <Smartphone className="h-5 w-5 text-black" />
                <span>Pay with Google Pay</span>
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Google Pay - Primary on Android/Desktop */}
            {canUseGooglePay && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAppleGooglePay('google_pay')}
                disabled={disabled || isProcessing}
                isLoading={isProcessing && paymentMethod === 'google_pay'}
                className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 hover:bg-gray-100 text-black font-medium"
              >
                <Smartphone className="h-5 w-5 text-black" />
                <span>Pay with Google Pay</span>
              </Button>
            )}

            {/* Apple Pay - Secondary on Android/Desktop */}
            {canUseApplePay && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAppleGooglePay('apple_pay')}
                disabled={disabled || isProcessing}
                isLoading={isProcessing && paymentMethod === 'apple_pay'}
                className="w-full flex items-center justify-center space-x-2 bg-black border-2 border-gray-600 hover:bg-gray-900 text-white font-medium"
              >
                <Apple className="h-5 w-5 text-white" />
                <span>Pay with Apple Pay</span>
              </Button>
            )}
          </>
        )}

        {/* Divider */}
        {(canUseApplePay || canUseGooglePay) && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or pay with card</span>
            </div>
          </div>
        )}

        {/* Credit Card */}
        <Button
          size="lg"
          onClick={handleCardPayment}
          disabled={disabled || isProcessing}
          isLoading={isProcessing && paymentMethod === 'card'}
          className="w-full flex items-center justify-center space-x-2"
        >
          <CreditCard className="h-5 w-5" />
          <span>Pay with Credit Card - ${totalAmount.toFixed(2)}</span>
        </Button>
      </div>

      {/* Payment Info */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Subtotal:</span>
          <span className="text-sm font-medium text-white">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Tax (GST/PST):</span>
          <span className="text-sm font-medium text-white">Included</span>
        </div>
        <div className="border-t border-gray-700 pt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-white">Total:</span>
            <span className="font-bold text-white">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="text-center bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-300 text-sm font-medium">
          🔒 Your payment information is encrypted and secure
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Powered by Stripe - PCI DSS Level 1 Compliant
        </p>
      </div>
    </div>
  );
}