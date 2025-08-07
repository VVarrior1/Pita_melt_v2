import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem, Price } from '@/types/menu';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (
    menuItem: MenuItem, 
    selectedSize: Price, 
    customizations: Record<string, string | string[]>,
    quantity?: number,
    specialInstructions?: string
  ) => void;
  
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const calculateItemPrice = (
  menuItem: MenuItem,
  selectedSize: Price,
  customizations: Record<string, string | string[]>
): number => {
  let price = selectedSize.price;
  
  // Add customization price modifiers
  if (menuItem.customizations) {
    menuItem.customizations.forEach(customization => {
      const selectedOption = customizations[customization.id];
      if (selectedOption) {
        if (Array.isArray(selectedOption)) {
          // Multiple selections (checkboxes)
          selectedOption.forEach(optionId => {
            const option = customization.options.find(opt => opt.id === optionId);
            if (option) {
              price += option.priceModifier;
            }
          });
        } else {
          // Single selection (radio/select)
          const option = customization.options.find(opt => opt.id === selectedOption);
          if (option) {
            price += option.priceModifier;
          }
        }
      }
    });
  }
  
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

const generateCartItemId = (
  menuItem: MenuItem,
  selectedSize: Price,
  customizations: Record<string, string | string[]>,
  specialInstructions?: string
): string => {
  const customizationString = Object.entries(customizations)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${Array.isArray(value) ? value.sort().join(',') : value}`)
    .join('|');
  
  return `${menuItem.id}-${selectedSize.size}-${customizationString}-${specialInstructions || ''}`;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (menuItem, selectedSize, customizations, quantity = 1, specialInstructions) => {
        const itemPrice = calculateItemPrice(menuItem, selectedSize, customizations);
        const cartItemId = generateCartItemId(menuItem, selectedSize, customizations, specialInstructions);
        
        const newCartItem: CartItem = {
          id: cartItemId,
          menuItem,
          quantity,
          selectedSize,
          customizations,
          totalPrice: itemPrice * quantity,
          specialInstructions
        };
        
        set(state => {
          const existingItemIndex = state.items.findIndex(item => item.id === cartItemId);
          
          if (existingItemIndex >= 0) {
            // Item already exists, update quantity
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
              totalPrice: (updatedItems[existingItemIndex].quantity + quantity) * itemPrice
            };
            return { items: updatedItems };
          } else {
            // New item, add to cart
            return { items: [...state.items, newCartItem] };
          }
        });
      },
      
      removeItem: (itemId) => {
        set(state => ({
          items: state.items.filter(item => item.id !== itemId)
        }));
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        
        set(state => ({
          items: state.items.map(item => {
            if (item.id === itemId) {
              const unitPrice = item.totalPrice / item.quantity;
              return {
                ...item,
                quantity,
                totalPrice: Math.round(unitPrice * quantity * 100) / 100
              };
            }
            return item;
          })
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },
      
      setCartOpen: (isOpen) => {
        set({ isOpen });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const total = get().items.reduce((total, item) => total + item.totalPrice, 0);
        return Math.round(total * 100) / 100;
      }
    }),
    {
      name: 'pita-melt-cart',
      partialize: (state) => ({ items: state.items })
    }
  )
);