import { apiClient } from './apiClient';

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

interface PagedOrderResponse {
  content?: OrderResponse[];
}

export async function createOrder(req: CreateOrderRequest): Promise<OrderResponse> {
  return apiClient.post<OrderResponse>('/api/orders', req);
}

export async function fetchOrderById(id: number): Promise<OrderResponse> {
  return apiClient.get<OrderResponse>(`/api/orders/${id}`);
}

export async function fetchOrders(): Promise<OrderResponse[]> {
  const response = await apiClient.get<OrderResponse[] | PagedOrderResponse>('/api/orders');
  return Array.isArray(response) ? response : response.content ?? [];
}

export async function updateOrderStatus(orderId: number, status: string): Promise<OrderResponse> {
  return apiClient.patch<OrderResponse>(`/api/orders/${orderId}/status`, { status });
}

export async function deleteOrder(orderId: number): Promise<void> {
  await apiClient.delete(`/api/orders/${orderId}`);
}
