'use client';

import React from 'react';
import { Clock, ShoppingBag, Utensils } from 'lucide-react';
import { CartItem } from '@/types/menu';

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  estimatedTime: number;
}

export default function OrderSummary({ items, totalPrice, estimatedTime }: OrderSummaryProps) {
  const formatEstimatedTime = () => {
    const now = new Date();
    const pickupTime = new Date(now.getTime() + estimatedTime * 60000);
    return pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <ShoppingBag className="h-5 w-5 text-[#f17105] mr-2" />
        <h2 className="text-xl font-semibold">Order Summary</h2>
      </div>

      {/* Estimated Pickup Time */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-[#f17105] mr-2" />
          <div>
            <p className="text-gray-300 font-medium text-sm">Ready for pickup at:</p>
            <p className="text-white font-bold">{formatEstimatedTime()}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="border-b border-gray-700 pb-4 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-white">{item.menuItem.name}</h3>
                <p className="text-sm text-gray-400">
                  {item.selectedSize.label}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">
                  ${item.totalPrice.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">
                  Qty: {item.quantity}
                </p>
              </div>
            </div>

            {/* Customizations */}
            {Object.entries(item.customizations).length > 0 && (
              <div className="ml-4 space-y-1">
                {Object.entries(item.customizations).map(([key, value]) => (
                  <div key={key} className="text-sm text-gray-400">
                    <span className="capitalize">{key}:</span>{' '}
                    <span>
                      {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Special Instructions */}
            {item.specialInstructions && (
              <div className="ml-4 mt-2">
                <p className="text-sm text-gray-400 italic">
                  Note: {item.specialInstructions}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Breakdown */}
      <div className="border-t border-gray-700 pt-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items):
            </span>
            <span className="text-white">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Taxes (GST/PST):</span>
            <span className="text-white">Included</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Delivery Fee:</span>
            <span className="text-white">$0.00 (Pickup)</span>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-white">Total:</span>
            <span className="text-xl font-bold text-[#f17105]">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Pickup Information */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-start">
          <Utensils className="h-4 w-4 text-[#f17105] mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-white mb-1">Pickup Location</h4>
            <p className="text-sm text-gray-400">
              Pita Melt<br />
              7196 Temple Dr NE #22<br />
              Calgary, AB<br />
              <span className="text-[#f17105]">(403) 293-5809</span>
            </p>
          </div>
        </div>
      </div>

      {/* Order Note */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400 text-center">
          📧 You'll receive a confirmation email when your order is ready
        </p>
      </div>
    </div>
  );
}