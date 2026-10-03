import React, { createContext, useContext, useState } from 'react';
import type { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  add: (p: Product, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  query: (q: string) => void;
  open: (v: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const Ctx = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('techzone_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  React.useEffect(() => {
    try {
      localStorage.setItem('techzone_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const add = (p: Product, qty = 1) => {
    setItems((c) => {
      const x = c.find((i) => i.id === p.id);
      return x
        ? c.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + qty, p.stock) } : i))
        : [...c, { ...p, qty }];
    });
    setIsDrawerOpen(true);
  };

  const setQty = (id: number, qty: number) =>
    setItems((c) =>
      qty <= 0
        ? c.filter((i) => i.id !== id)
        : c.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i))
    );

  const remove = (id: number) => setItems((c) => c.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <Ctx.Provider
      value={{
        items,
        searchQuery,
        setSearchQuery,
        add,
        setQty,
        remove,
        clear,
        query: setSearchQuery,
        open: setSearchQuery,
        isDrawerOpen,
        setIsDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
