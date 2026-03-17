'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: string; // generated unique id for cart line
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

interface CartContextType {
  items: CartItem[];
  tableNumber: string | null;
  setTableNumber: (num: string) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  clearTableSession: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('menuflow_cart');
    const savedTable = localStorage.getItem('menuflow_table');
    if (saved) setItems(JSON.parse(saved));
    if (savedTable) setTableNumber(savedTable);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('menuflow_cart', JSON.stringify(items));
      if (tableNumber) localStorage.setItem('menuflow_table', tableNumber);
    }
  }, [items, tableNumber, isLoaded]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      const existing = prev.find(i => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map(i => i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, { ...item, id: Math.random().toString(36).substring(7) }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const clearTableSession = () => {
    setItems([]);
    setTableNumber(null);
    localStorage.removeItem('menuflow_cart');
    localStorage.removeItem('menuflow_table');
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, clearTableSession, subtotal, itemCount, tableNumber, setTableNumber }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
