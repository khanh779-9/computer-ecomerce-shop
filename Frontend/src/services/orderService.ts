export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  recipientName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: string;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface OrderResponse {
  id: number;
  status: string;
  paymentMethod: string;
  recipientName: string;
  phone: string;
  address: string;
  note?: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: OrderItemResponse[];
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function createOrder(req: CreateOrderRequest): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    let errMsg = `Lỗi đặt hàng (${res.status})`;
    try {
      const err = await res.json();
      if (err.message) errMsg = err.message;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json();
}

export async function fetchOrderById(id: number): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/api/orders/${id}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Không tìm thấy đơn hàng #${id}`);
    }
    throw new Error(`Lỗi tra cứu đơn hàng (${res.status})`);
  }
  return res.json();
}

export async function fetchOrders(): Promise<OrderResponse[]> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Lỗi tải danh sách đơn hàng từ máy chủ (${res.status})`);
  }
  return res.json();
}

export async function updateOrderStatus(orderId: number, status: string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error(`Không thể cập nhật trạng thái đơn #${orderId}`);
  return res.json();
}
