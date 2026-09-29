const API_BASE = import.meta.env.VITE_API_URL || '';

export interface BackendCartItem {
  id: number;
  productId: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  art: string;
  tint: string;
  stock: number;
  quantity: number;
  subtotal: number;
}

export interface BackendCart {
  id: number;
  userId?: number;
  sessionId?: string;
  items: BackendCartItem[];
  totalItems: number;
  totalPrice: number;
}

export async function fetchCart(userId?: number, sessionId?: string): Promise<BackendCart> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId.toString());
  if (sessionId) params.append('sessionId', sessionId);

  const res = await fetch(`${API_BASE}/api/cart?${params.toString()}`);
  if (!res.ok) throw new Error('Không thể tải giỏ hàng');
  return res.json();
}

export async function addCartItem(productId: number, quantity: number, userId?: number, sessionId?: string): Promise<BackendCart> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId.toString());
  if (sessionId) params.append('sessionId', sessionId);

  const res = await fetch(`${API_BASE}/api/cart/items?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) throw new Error('Không thể thêm sản phẩm vào giỏ');
  return res.json();
}

export async function updateCartItemQty(productId: number, quantity: number, userId?: number, sessionId?: string): Promise<BackendCart> {
  const params = new URLSearchParams({ quantity: quantity.toString() });
  if (userId) params.append('userId', userId.toString());
  if (sessionId) params.append('sessionId', sessionId);

  const res = await fetch(`${API_BASE}/api/cart/items/${productId}?${params.toString()}`, {
    method: 'PUT',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error('Không thể cập nhật số lượng');
  return res.json();
}

export async function removeCartItem(productId: number, userId?: number, sessionId?: string): Promise<BackendCart> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId.toString());
  if (sessionId) params.append('sessionId', sessionId);

  const res = await fetch(`${API_BASE}/api/cart/items/${productId}?${params.toString()}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error('Không thể xóa sản phẩm');
  return res.json();
}

export async function clearBackendCart(userId?: number, sessionId?: string): Promise<void> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId.toString());
  if (sessionId) params.append('sessionId', sessionId);

  await fetch(`${API_BASE}/api/cart?${params.toString()}`, {
    method: 'DELETE',
  });
}
