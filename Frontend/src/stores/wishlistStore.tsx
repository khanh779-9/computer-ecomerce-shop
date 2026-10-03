import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';
import { useToast } from './toastStore';

interface WishlistContextType {
  items: Product[];
  add: (p: Product) => boolean;
  remove: (id: number) => void;
  toggle: (p: Product) => void;
  clear: () => void;
  has: (id: number) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = 'techzone_wishlist_items';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const has = (id: number) => items.some((i) => i.id === id);

  const add = (p: Product): boolean => {
    if (has(p.id)) {
      toast.info(`"${p.name}" đã có trong danh sách yêu thích.`);
      return false;
    }
    setItems((prev) => [p, ...prev]);
    toast.success(`Đã thêm "${p.name}" vào danh sách yêu thích!`);
    return true;
  };

  const remove = (id: number) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      toast.info(`Đã gỡ "${item.name}" khỏi danh sách yêu thích.`);
    }
  };

  const toggle = (p: Product) => {
    if (has(p.id)) {
      remove(p.id);
    } else {
      add(p);
    }
  };

  const clear = () => {
    setItems([]);
    toast.info('Đã xóa toàn bộ sản phẩm khỏi danh sách yêu thích.');
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        add,
        remove,
        toggle,
        clear,
        has,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
