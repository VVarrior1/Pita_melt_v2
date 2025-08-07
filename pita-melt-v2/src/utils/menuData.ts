import { MenuItem, MenuCategory } from '@/types/menu';
import menuData from '@/data/menu.json';

export function getMenuData(): Record<string, MenuItem[]> {
  return menuData as Record<string, MenuItem[]>;
}

export function getAllMenuItems(): MenuItem[] {
  const data = getMenuData();
  return Object.values(data).flat();
}

export function getMenuItemsByCategory(category: MenuCategory): MenuItem[] {
  const data = getMenuData();
  return data[category] || [];
}

export function getMenuItemById(id: string): MenuItem | undefined {
  const allItems = getAllMenuItems();
  return allItems.find(item => item.id === id);
}

export function getVeganItems(): MenuItem[] {
  const allItems = getAllMenuItems();
  return allItems.filter(item => item.isVegan === true);
}

export function getCategoryDisplayName(category: MenuCategory): string {
  const categoryNames: Record<MenuCategory, string> = {
    'pita-wraps': 'Pita Wraps & Sandwiches',
    'platters': 'Platters',
    'special-platters': 'Special Platters',
    'salads': 'Salads',
    'desserts': 'Desserts',
    'beverages': 'Beverages',
    'dips': 'Dips',
    'sides': 'Sides',
    'pies': 'Pies'
  };
  
  return categoryNames[category] || category;
}

export function getMenuCategories(): Array<{ key: MenuCategory; name: string; items: MenuItem[] }> {
  const data = getMenuData();
  
  return Object.keys(data).map(category => ({
    key: category as MenuCategory,
    name: getCategoryDisplayName(category as MenuCategory),
    items: data[category]
  }));
}