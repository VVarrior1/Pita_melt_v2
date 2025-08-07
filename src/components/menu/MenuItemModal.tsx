'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, ShoppingCart, Leaf, Flame, Utensils, Coffee, Salad, Cake, Beer, Soup } from 'lucide-react';
import { MenuItem, Price, Customization } from '@/types/menu';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface MenuItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const [selectedSize, setSelectedSize] = useState<Price>(item.prices[0]);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<Record<string, string | string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(item.prices[0]);
      setQuantity(1);
      setCustomizations({});
      setSpecialInstructions('');
      
      // Set default values for required customizations
      if (item.customizations) {
        const defaultCustomizations: Record<string, string | string[]> = {};
        item.customizations.forEach(customization => {
          if (customization.required && customization.options.length > 0) {
            if (customization.type === 'radio' || customization.type === 'select') {
              defaultCustomizations[customization.id] = customization.options[0].id;
            } else if (customization.type === 'checkbox') {
              defaultCustomizations[customization.id] = [];
            }
          }
        });
        setCustomizations(defaultCustomizations);
      }
    }
  }, [isOpen, item]);

  const handleCustomizationChange = (customizationId: string, value: string | string[], maxSelections?: number) => {
    if (Array.isArray(value) && maxSelections && value.length > maxSelections) {
      // Remove the first item to make room for the new one
      value = value.slice(1);
    }
    setCustomizations(prev => ({
      ...prev,
      [customizationId]: value
    }));
  };

  const calculateTotalPrice = () => {
    let price = selectedSize.price;
    
    if (item.customizations) {
      item.customizations.forEach(customization => {
        const selectedValue = customizations[customization.id];
        if (selectedValue) {
          if (Array.isArray(selectedValue)) {
            selectedValue.forEach(optionId => {
              const option = customization.options.find(opt => opt.id === optionId);
              if (option) {
                price += option.priceModifier;
              }
            });
          } else {
            const option = customization.options.find(opt => opt.id === selectedValue);
            if (option) {
              price += option.priceModifier;
            }
          }
        }
      });
    }
    
    return Math.round(price * quantity * 100) / 100;
  };

  const validateCustomizations = (): boolean => {
    if (!item.customizations) return true;
    
    for (const customization of item.customizations) {
      if (customization.required) {
        const value = customizations[customization.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast.error(`Please select ${customization.name}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateCustomizations()) return;
    
    addItem(item, selectedSize, customizations, quantity, specialInstructions);
    toast.success(`${item.name} added to cart!`);
    onClose();
  };

  const getCategoryIcon = (category: string, size: string = "h-20 w-20") => {
    const iconMap: Record<string, React.ReactNode> = {
      'pita-wraps': <Utensils className={size} />,
      'platters': <Utensils className={size} />,
      'special-platters': <Utensils className={size} />,
      'salads': <Salad className={size} />,
      'desserts': <Cake className={size} />,
      'beverages': <Beer className={size} />,
      'dips': <Soup className={size} />,
      'sides': <Coffee className={size} />,
      'pies': <Cake className={size} />
    };
    return iconMap[category] || <Utensils className={size} />;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'pita-wraps': 'from-orange-500 to-red-500',
      'platters': 'from-yellow-500 to-orange-500',
      'special-platters': 'from-red-500 to-pink-500',
      'salads': 'from-green-500 to-emerald-500',
      'desserts': 'from-pink-500 to-purple-500',
      'beverages': 'from-blue-500 to-cyan-500',
      'dips': 'from-amber-500 to-yellow-500',
      'sides': 'from-gray-500 to-slate-500',
      'pies': 'from-purple-500 to-indigo-500'
    };
    return colorMap[category] || 'from-gray-500 to-gray-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white text-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Icon Header */}
            <div className="relative h-32 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
              <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(item.category)} opacity-10`} />
              <div className="relative z-10 text-[#f17105]">
                {getCategoryIcon(item.category)}
              </div>
              
              {/* Badges */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                {item.isVegan && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    Vegan
                  </div>
                )}
                {item.isSpicy && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    Spicy
                  </div>
                )}
                {item.isGlutenFree && (
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    Gluten Free
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-gray-600 mb-6">{item.description}</p>
            )}

            {/* Size Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-[#f17105] mr-2">📏</span>
                Choose Your Size
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {item.prices.map((price) => (
                  <button
                    key={price.size}
                    onClick={() => setSelectedSize(price)}
                    className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-center transition-all duration-300 hover:shadow-xl ${
                      selectedSize.size === price.size
                        ? 'border-[#f17105] bg-gradient-to-br from-[#f17105]/10 to-[#f17105]/5 shadow-lg transform scale-105'
                        : 'border-gray-300 bg-white hover:border-[#f17105] hover:shadow-lg hover:scale-102'
                    }`}
                  >
                    {/* Selection Indicator */}
                    {selectedSize.size === price.size && (
                      <div className="absolute -top-1 -right-1 bg-[#f17105] text-white rounded-full p-2 shadow-lg">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    
                    {/* Background Pattern */}
                    <div className={`absolute inset-0 opacity-5 transition-opacity duration-300 ${
                      selectedSize.size === price.size ? 'opacity-10' : 'group-hover:opacity-8'
                    }`}>
                      <div className="h-full w-full bg-[#f17105] transform rotate-45 scale-150"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                        selectedSize.size === price.size ? 'text-[#f17105]' : 'text-gray-800 group-hover:text-[#f17105]'
                      }`}>
                        {price.size}
                      </div>
                      <div className={`text-xl font-semibold transition-colors duration-300 ${
                        selectedSize.size === price.size ? 'text-[#f17105]' : 'text-gray-600 group-hover:text-[#f17105]'
                      }`}>
                        ${price.price.toFixed(2)}
                      </div>
                      {selectedSize.size === price.size && (
                        <div className="mt-2 text-sm text-[#f17105] font-medium">Selected</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customizations */}
            {item.customizations && item.customizations.length > 0 && (
              <div className="mb-8">
                {item.customizations.map((customization) => (
                  <div key={customization.id} className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="text-[#f17105] mr-2">🍯</span>
                      {customization.name}
                      {customization.required && <span className="text-red-500 ml-2 text-lg">*</span>}
                    </h3>
                    
                    {customization.maxSelections && (
                      <p className="text-sm text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <span className="font-medium text-blue-800">Note:</span> You can select up to {customization.maxSelections} option{customization.maxSelections > 1 ? 's' : ''}
                        {customizations[customization.id] && Array.isArray(customizations[customization.id]) && (
                          <span className="ml-2 text-blue-600">
                            ({(customizations[customization.id] as string[]).length}/{customization.maxSelections} selected)
                          </span>
                        )}
                      </p>
                    )}

                    {customization.type === 'radio' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {customization.options.map((option) => (
                          <label key={option.id} className="group cursor-pointer">
                            <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                              customizations[customization.id] === option.id
                                ? 'border-[#f17105] bg-[#f17105]/10 shadow-lg'
                                : 'border-gray-300 bg-white group-hover:border-[#f17105] group-hover:shadow-md'
                            }`}>
                              <input
                                type="radio"
                                name={customization.id}
                                value={option.id}
                                checked={customizations[customization.id] === option.id}
                                onChange={(e) => handleCustomizationChange(customization.id, e.target.value)}
                                className="sr-only"
                              />
                              
                              {customizations[customization.id] === option.id && (
                                <div className="absolute -top-2 -right-2 bg-[#f17105] text-white rounded-full p-1.5">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <span className={`font-medium transition-colors duration-300 ${
                                  customizations[customization.id] === option.id ? 'text-[#f17105]' : 'text-gray-800'
                                }`}>
                                  {option.name}
                                </span>
                                {option.priceModifier !== 0 && (
                                  <span className="text-[#f17105] font-bold text-sm">
                                    {option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {customization.type === 'checkbox' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {customization.options.map((option) => {
                          const isSelected = (customizations[customization.id] as string[] || []).includes(option.id);
                          const currentCount = (customizations[customization.id] as string[] || []).length;
                          const isMaxReached = customization.maxSelections && currentCount >= customization.maxSelections && !isSelected;
                          
                          return (
                            <label key={option.id} className={`group cursor-pointer ${isMaxReached ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                isSelected
                                  ? 'border-[#f17105] bg-[#f17105]/10 shadow-lg'
                                  : isMaxReached
                                  ? 'border-gray-200 bg-gray-100'
                                  : 'border-gray-300 bg-white group-hover:border-[#f17105] group-hover:shadow-md'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={isMaxReached}
                                  onChange={(e) => {
                                    const currentValues = customizations[customization.id] as string[] || [];
                                    if (e.target.checked) {
                                      handleCustomizationChange(customization.id, [...currentValues, option.id], customization.maxSelections);
                                    } else {
                                      handleCustomizationChange(customization.id, currentValues.filter(id => id !== option.id));
                                    }
                                  }}
                                  className="sr-only"
                                />
                                
                                {isSelected && (
                                  <div className="absolute -top-2 -right-2 bg-[#f17105] text-white rounded-full p-1.5">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium transition-colors duration-300 ${
                                    isSelected ? 'text-[#f17105]' : isMaxReached ? 'text-gray-500' : 'text-gray-800'
                                  }`}>
                                    {option.name}
                                  </span>
                                  {option.priceModifier !== 0 && (
                                    <span className={`font-bold text-sm ${
                                      isSelected ? 'text-[#f17105]' : isMaxReached ? 'text-gray-400' : 'text-[#f17105]'
                                    }`}>
                                      {option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {customization.type === 'select' && (
                      <div className="relative">
                        <select
                          value={customizations[customization.id] as string || ''}
                          onChange={(e) => handleCustomizationChange(customization.id, e.target.value)}
                          className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-[#f17105] focus:ring-4 focus:ring-[#f17105]/20 bg-white text-gray-800 font-medium appearance-none cursor-pointer transition-all duration-300"
                        >
                          <option value="" disabled>Select {customization.name.toLowerCase()}</option>
                          {customization.options.map((option) => (
                            <option key={option.id} value={option.id} className="py-2">
                              {option.name}
                              {option.priceModifier !== 0 && 
                                ` (+$${option.priceModifier.toFixed(2)})`
                              }
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Special Instructions */}
            <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-[#f17105] mr-2">💬</span>
                Special Instructions
              </h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests, allergies, or modifications? We'll do our best to accommodate!"
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-[#f17105] focus:ring-4 focus:ring-[#f17105]/20 resize-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">Optional - Let us know how to make your order perfect</p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="bg-white sticky bottom-0 pt-6 pb-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-gray-800">Quantity:</span>
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        quantity <= 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-700 hover:bg-white hover:shadow-md active:scale-95'
                      }`}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg text-gray-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 rounded-lg text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 active:scale-95"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-bold text-[#f17105]">${calculateTotalPrice().toFixed(2)}</div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center space-x-3 py-4 text-lg font-semibold bg-gradient-to-r from-[#f17105] to-[#e15a00] hover:from-[#e15a00] hover:to-[#d14900] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>Add to Cart • ${calculateTotalPrice().toFixed(2)}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}