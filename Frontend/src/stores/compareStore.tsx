import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';
import { useToast } from './toastStore';

interface CompareContextType {
  items: Product[];
  add: (p: Product) => boolean;
  remove: (id: number) => void;
  toggle: (p: Product) => void;
  clear: () => void;
  has: (id: number) => boolean;
  count: number;
}

const CompareContext = createContext<CompareContextType | null>(null);

const STORAGE_KEY = 'techzone_compare_items';
const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
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
      toast.info(`"${p.name}" đã có trong danh sách so sánh.`);
      return false;
    }
    if (items.length >= MAX_COMPARE) {
      toast.error(`Bạn chỉ có thể so sánh tối đa ${MAX_COMPARE} sản phẩm cùng lúc!`);
      return false;
    }
    setItems((prev) => [...prev, p]);
    toast.success(`Đã thêm "${p.name}" vào bảng so sánh (${items.length + 1}/${MAX_COMPARE})`);
    return true;
  };

  const remove = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggle = (p: Product) => {
    if (has(p.id)) {
      remove(p.id);
      toast.info(`Đã gỡ "${p.name}" khỏi bảng so sánh.`);
    } else {
      add(p);
    }
  };

  const clear = () => {
    setItems([]);
    toast.info('Đã xóa toàn bộ sản phẩm khỏi bảng so sánh.');
  };

  return (
    <CompareContext.Provider
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
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
