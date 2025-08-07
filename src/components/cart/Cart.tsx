'use client';

import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function Cart() {
  const { 
    items, 
    isOpen, 
    setCartOpen, 
    updateQuantity, 
    removeItem, 
    getTotalPrice,
    getTotalItems 
  } = useCartStore();

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setCartOpen(false)}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 text-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">
              Your Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})
            </h2>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 hover:bg-gray-800 rounded-full text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-medium text-white mb-2">Your cart is empty</h3>
                <p className="text-gray-400 mb-4">Add some delicious items to get started!</p>
                <Button onClick={() => setCartOpen(false)}>
                  <Link href="/menu">Browse Menu</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{item.menuItem.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-2">
                      <p>Size: {item.selectedSize.label}</p>
                      
                      {/* Customizations */}
                      {Object.entries(item.customizations).length > 0 && (
                        <div className="mt-1">
                          {Object.entries(item.customizations).map(([key, value]) => (
                            <p key={key}>
                              {key}: {Array.isArray(value) ? value.join(', ') : value}
                            </p>
                          ))}
                        </div>
                      )}
                      
                      {/* Special Instructions */}
                      {item.specialInstructions && (
                        <p className="mt-1 text-gray-400 italic">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-700 rounded text-white"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-700 rounded text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-medium text-white">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-700 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-white">Total:</span>
                <span className="text-xl font-bold text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              
              <Link href="/checkout" className="w-full">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setCartOpen(false)}
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}