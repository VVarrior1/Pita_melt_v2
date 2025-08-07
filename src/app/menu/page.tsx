'use client';

import React, { useState, useMemo } from 'react';
import { Filter, Leaf } from 'lucide-react';
import { getMenuCategories, getVeganItems } from '@/utils/menuData';
import { MenuItem } from '@/types/menu';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { Button } from '@/components/ui/Button';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showVeganOnly, setShowVeganOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const menuCategories = getMenuCategories();
  const veganItems = getVeganItems();

  const displayedItems = useMemo(() => {
    let items: MenuItem[] = [];

    if (selectedCategory === 'all') {
      items = menuCategories.flatMap(category => category.items);
    } else if (selectedCategory === 'vegan') {
      items = veganItems;
    } else {
      const category = menuCategories.find(cat => cat.key === selectedCategory);
      items = category ? category.items : [];
    }

    if (showVeganOnly && selectedCategory !== 'vegan') {
      items = items.filter(item => item.isVegan === true);
    }

    return items;
  }, [selectedCategory, showVeganOnly, menuCategories, veganItems]);

  const categories = [
    { key: 'all', name: 'All Items', count: menuCategories.reduce((acc, cat) => acc + cat.items.length, 0) },
    { key: 'vegan', name: 'Vegan Options', count: veganItems.length },
    ...menuCategories.map(cat => ({ key: cat.key, name: cat.name, count: cat.items.length }))
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-[#f17105]">Menu</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Authentic Mediterranean flavors crafted with the finest ingredients
            </p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <div className="mt-8 flex justify-center lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters & Categories
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories & Filters */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${
                        selectedCategory === category.key
                          ? 'bg-[#f17105] text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {category.key === 'vegan' && <Leaf className="h-4 w-4" />}
                        {category.name}
                      </span>
                      <span className="text-sm opacity-75">({category.count})</span>
                    </button>
                  ))}
                </div>

                {/* Vegan Filter */}
                {selectedCategory !== 'vegan' && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="text-md font-semibold mb-3">Dietary Filters</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showVeganOnly}
                        onChange={(e) => setShowVeganOnly(e.target.checked)}
                        className="w-4 h-4 text-[#f17105] bg-gray-800 border-gray-600 rounded focus:ring-[#f17105] focus:ring-2"
                      />
                      <span className="flex items-center gap-1">
                        <Leaf className="h-4 w-4 text-green-500" />
                        Show Vegan Only
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Menu Items */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {selectedCategory === 'all' ? 'All Items' :
                 selectedCategory === 'vegan' ? 'Vegan Options' :
                 categories.find(cat => cat.key === selectedCategory)?.name}
                <span className="text-gray-400 text-lg ml-2">
                  ({displayedItems.length} item{displayedItems.length !== 1 ? 's' : ''})
                </span>
              </h2>
              
              {showVeganOnly && selectedCategory !== 'vegan' && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Leaf className="h-4 w-4" />
                  Vegan Only
                </div>
              )}
            </div>

            {/* Menu Items Grid */}
            {displayedItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No items found</h3>
                <p className="text-gray-500">Try selecting a different category or removing filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}