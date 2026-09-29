const API_BASE = import.meta.env.VITE_API_URL || '';

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
