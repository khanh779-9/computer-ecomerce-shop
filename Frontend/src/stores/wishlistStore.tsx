import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { useToast } from './toastStore';
import { useAuth } from './authStore';
import { tokenStorage } from '../services/apiClient';
import {
  fetchWishlist,
  addToWishlist as apiAdd,
  removeFromWishlist as apiRemove,
  clearWishlist as apiClear,
  type WishlistItem,
} from '../services/wishlistService';

interface WishlistContextType {
  items: Product[];
  add: (p: Product) => boolean;
  remove: (id: number) => void;
  toggle: (p: Product) => void;
  clear: () => void;
  has: (id: number) => boolean;
  count: number;
  syncing: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = 'techzone_wishlist_items';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [syncing, setSyncing] = useState(false);

  const syncedRef = useRef(false);
  const guestItemsRef = useRef<Product[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const isSyncEnabled = isAuthenticated && !!user && !tokenStorage.get()?.startsWith('mock_');

  // Sync wishlist with backend when user logs in / out
  useEffect(() => {
    let cancelled = false;

    if (!isSyncEnabled) {
      if (syncedRef.current) {
        // Just logged out — start fresh locally
        syncedRef.current = false;
        guestItemsRef.current = [];
        setItems([]);
      }
      return;
    }

    const wasSynced = syncedRef.current;
    const localGuestItems = wasSynced ? [] : items;
    syncedRef.current = true;
    setSyncing(true);

    (async () => {
      try {
        // Push guest items saved locally up to the server (merge on first login)
        if (localGuestItems.length > 0) {
          await Promise.allSettled(
            localGuestItems.map((p) => apiAdd(p.id))
          );
        }
        const serverItems: WishlistItem[] = await fetchWishlist();
        if (!cancelled) {
          setItems(serverItems.map((i) => i.product));
        }
      } catch {
        // Network/backend error — keep local items as fallback
        if (!cancelled && !wasSynced) {
          setItems((prev) => (prev.length > 0 ? prev : localGuestItems));
        }
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncEnabled, user?.id]);

  const has = (id: number) => items.some((i) => i.id === id);

  const add = (p: Product): boolean => {
    if (has(p.id)) {
      toast.info(`"${p.name}" đã có trong danh sách yêu thích.`);
      return false;
    }
    setItems((prev) => [p, ...prev]);
    toast.success(`Đã thêm "${p.name}" vào danh sách yêu thích!`);

    if (isSyncEnabled && !tokenStorage.get()?.startsWith('mock_')) {
      apiAdd(p.id).catch(() => {
        toast.error('Không đồng bộ được danh sách yêu thích với máy chủ.');
      });
    }
    return true;
  };

  const remove = (id: number) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      toast.info(`Đã gỡ "${item.name}" khỏi danh sách yêu thích.`);
    }

    if (isSyncEnabled && !tokenStorage.get()?.startsWith('mock_')) {
      apiRemove(id).catch(() => {});
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

    if (isSyncEnabled && !tokenStorage.get()?.startsWith('mock_')) {
      apiClear().catch(() => {});
    }
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
        syncing,
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
