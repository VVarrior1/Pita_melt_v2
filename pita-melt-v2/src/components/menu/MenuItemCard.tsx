'use client';

import React, { useState } from 'react';
import { Plus, Leaf, Flame, ShoppingCart, Utensils, Coffee, Salad, Cake, Beer, Soup } from 'lucide-react';
import { MenuItem, Price } from '@/types/menu';
import { Button } from '@/components/ui/Button';
import MenuItemModal from './MenuItemModal';

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'pita-wraps': <Utensils className="h-12 w-12" />,
      'platters': <Utensils className="h-12 w-12" />,
      'special-platters': <Utensils className="h-12 w-12" />,
      'salads': <Salad className="h-12 w-12" />,
      'desserts': <Cake className="h-12 w-12" />,
      'beverages': <Beer className="h-12 w-12" />,
      'dips': <Soup className="h-12 w-12" />,
      'sides': <Coffee className="h-12 w-12" />,
      'pies': <Cake className="h-12 w-12" />
    };
    return iconMap[category] || <Utensils className="h-12 w-12" />;
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

  const getMinPrice = () => {
    return Math.min(...item.prices.map(p => p.price));
  };

  const getMaxPrice = () => {
    return Math.max(...item.prices.map(p => p.price));
  };

  const getPriceDisplay = () => {
    const min = getMinPrice();
    const max = getMaxPrice();
    
    if (min === max) {
      return `$${min.toFixed(2)}`;
    } else {
      return `From $${min.toFixed(2)}`;
    }
  };

  return (
    <>
      <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group">
        <div 
          className="relative h-32 flex items-center justify-center"
          onClick={() => setIsModalOpen(true)}
        >
          {/* Gradient Background with Icon */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(item.category)} opacity-20`} />
          <div className="relative z-10 text-[#f17105] pointer-events-none">
            {getCategoryIcon(item.category)}
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {item.isVegan && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                Vegan
              </div>
            )}
            {item.isSpicy && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Spicy
              </div>
            )}
            {item.isGlutenFree && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                GF
              </div>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
            <Button
              size="sm"
              className="transform scale-90 group-hover:scale-100 transition-transform duration-300 z-30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>

        <div 
          className="p-4"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-[#f17105] transition-colors">
              {item.name}
            </h3>
            <span className="text-[#f17105] font-bold text-lg">
              {getPriceDisplay()}
            </span>
          </div>

          {item.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Size Options Preview */}
          {item.prices.length > 1 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.prices.slice(0, 3).map((price, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                >
                  {price.size}
                </span>
              ))}
              {item.prices.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{item.prices.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Quick Add Button */}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Customize & Add
          </Button>
        </div>
      </div>

      {/* Menu Item Modal */}
      <MenuItemModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}