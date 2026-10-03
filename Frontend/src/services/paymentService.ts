import { ENV } from '../config/env';

export interface VNPayPaymentResponse {
  status: string;
  message: string;
  paymentUrl: string;
}

export interface VNPayCallbackResponse {
  status: string;
  message: string;
  orderId?: number;
  transactionNo?: string;
  bankCode?: string;
  amount?: number;
  responseCode?: string;
}

const API_BASE = ENV.API_URL;

/**
 * Khởi tạo link thanh toán VNPay cho đơn hàng
 */
export async function createVNPayPayment(orderId: number, bankCode?: string): Promise<VNPayPaymentResponse> {
  const res = await fetch(`${API_BASE}/api/payment/vnpay/create-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ orderId, bankCode }),
  });

  if (!res.ok) {
    let errMsg = `Không thể tạo phiên thanh toán VNPay (${res.status})`;
    try {
      const err = await res.json();
      if (err.message) errMsg = err.message;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json();
}

/**
 * Gửi các tham số từ VNPay callback về backend xác thực chữ ký và cập nhật trạng thái đơn
 */
export async function verifyVNPayCallback(params: URLSearchParams): Promise<VNPayCallbackResponse> {
  const queryString = params.toString();
  const res = await fetch(`${API_BASE}/api/payment/vnpay/callback?${queryString}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Xác thực giao dịch VNPay thất bại (${res.status})`);
  }

  return res.json();
}
