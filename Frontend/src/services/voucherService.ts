const API_BASE = import.meta.env.VITE_API_URL || '';

import { apiClient } from './apiClient';

export interface Voucher {
  id: number;
  code: string;
  description: string;
  discountAmount: number;
  discountPercent: number;
  minOrderAmount: number;
  isFreeShip: boolean;
  isActive: boolean;
}

export interface VoucherValidationResult {
  valid: boolean;
  code?: string;
  description?: string;
  discountAmount?: number;
  isFreeShip?: boolean;
  message: string;
}

export async function fetchActiveVouchers(): Promise<Voucher[]> {
  const res = await fetch(`${API_BASE}/api/vouchers`);
  if (!res.ok) throw new Error('Không thể tải mã giảm giá');
  return res.json();
}

export async function validateVoucher(code: string, orderAmount: number): Promise<VoucherValidationResult> {
  const res = await fetch(`${API_BASE}/api/vouchers/validate?code=${encodeURIComponent(code)}&orderAmount=${orderAmount}`);
  if (!res.ok) throw new Error('Lỗi kiểm tra mã giảm giá');
  return res.json();
}

// =============== ADMIN ===============

export async function fetchAllVouchers(): Promise<Voucher[]> {
  return apiClient.get<Voucher[]>('/api/vouchers/admin/all');
}

export async function createVoucher(payload: {
  code: string;
  description: string;
  discountAmount: number;
  discountPercent?: number;
  minOrderAmount: number;
  isFreeShip?: boolean;
  isActive?: boolean;
}): Promise<Voucher> {
  return apiClient.post<Voucher>('/api/vouchers/admin', payload);
}

export async function updateVoucher(id: number, payload: {
  code: string;
  description: string;
  discountAmount: number;
  discountPercent?: number;
  minOrderAmount: number;
  isFreeShip?: boolean;
  isActive?: boolean;
}): Promise<Voucher> {
  return apiClient.put<Voucher>(`/api/vouchers/admin/${id}`, payload);
}

export async function setVoucherActive(id: number, isActive: boolean): Promise<Voucher> {
  return apiClient.patch<Voucher>(`/api/vouchers/admin/${id}/status`, { isActive });
}

export async function deleteVoucher(id: number): Promise<void> {
  await apiClient.delete(`/api/vouchers/admin/${id}`);
}
