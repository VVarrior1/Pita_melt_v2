export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  prices: Price[];
  image?: string;
  category: MenuCategory;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  customizations?: Customization[];
}

export interface Price {
  size: 'S' | 'M' | 'L' | 'Jumbo' | 'Regular' | 'Can' | 'Bottle';
  price: number;
  label: string; // e.g., "S: $8.50"
}

export interface Customization {
  id: string;
  name: string;
  type: 'radio' | 'checkbox' | 'select';
  required: boolean;
  maxSelections?: number; // For checkbox type - max number of selections allowed
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  priceModifier: number; // +/- price change
}

export type MenuCategory = 
  | 'pita-wraps' 
  | 'platters' 
  | 'special-platters' 
  | 'salads' 
  | 'desserts' 
  | 'beverages' 
  | 'dips' 
  | 'sides' 
  | 'pies';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize: Price;
  customizations: Record<string, string | string[]>;
  totalPrice: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  estimatedPickupTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
}

export type OrderStatus = 
  | 'pending'           // Just created, payment not processed
  | 'payment_processing' // Payment in progress
  | 'confirmed'         // Payment successful, order confirmed
  | 'preparing'         // Kitchen is preparing
  | 'ready'            // Ready for pickup
  | 'completed'        // Customer picked up
  | 'cancelled';       // Order cancelled

export type PaymentStatus = 
  | 'pending'
  | 'processing' 
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export interface MenuData {
  [key: string]: MenuItem[];
}