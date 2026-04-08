"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  medicineId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  dosage?: string;
  frequency?: string;
}

interface CartContextType {
  items: CartItem[];
  prescriptionUrl: string | null;
  setPrescriptionUrl: (url: string | null) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  addItems: (items: Omit<CartItem, 'id'>[]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('skinshop-cart');
      const savedUrl = localStorage.getItem('skinshop-prescription');
      if (saved) setItems(JSON.parse(saved));
      if (savedUrl) setPrescriptionUrl(savedUrl);
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('skinshop-cart', JSON.stringify(items));
      if (prescriptionUrl) localStorage.setItem('skinshop-prescription', prescriptionUrl);
      else localStorage.removeItem('skinshop-prescription');
    }
  }, [items, prescriptionUrl, isLoaded]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      const existing = prev.find(i =>
        item.medicineId
          ? i.medicineId === item.medicineId
          : i.name.toLowerCase() === item.name.toLowerCase()
      );
      if (existing) {
        return prev.map(i =>
          (item.medicineId ? i.medicineId === item.medicineId : i.name.toLowerCase() === item.name.toLowerCase())
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      const id = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return [...prev, { ...item, id }];
    });
  };

  const addItems = (newItems: Omit<CartItem, 'id'>[]) => {
    newItems.forEach(item => addItem(item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setPrescriptionUrl(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, prescriptionUrl, setPrescriptionUrl, addItem, addItems, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
