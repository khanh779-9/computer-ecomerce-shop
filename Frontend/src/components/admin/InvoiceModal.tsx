import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { formatVnd } from '../../lib/cart';
import type { OrderResponse } from '../../services/orderService';

interface InvoiceModalProps {
  order: OrderResponse;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ order, isOpen, onClose }: InvoiceModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('vi-VN')
    : new Date().toLocaleDateString('vi-VN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200">
        
        {/* Modal Controls (Not printed) */}
        <div className="print:hidden sticky top-0 z-10 flex items-center justify-between border-b bg-stone-50 px-5 py-3">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Xem trước Phiếu Bán Hàng & Hóa Đơn Bán Lẻ
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Hóa Đơn (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CONTENT */}
        <div className="p-8 space-y-6 text-stone-800 bg-white" id="printable-invoice">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-stone-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c2410c] font-black text-white text-sm">
                  TZ
                </span>
                <span className="text-xl font-black tracking-tight text-stone-900">
                  TechZone Computer
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ TECHZONE</p>
              <p className="text-[11px] text-stone-500">Showroom: 123 Đường 3/2, P.11, Q.10, TP. Hồ Chí Minh</p>
              <p className="text-[11px] text-stone-500">Hotline: 1900.8888 · Website: techzone.vn · MST: 0312345678</p>
            </div>

            <div className="text-right">
              <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">HÓA ĐƠN BÁN LẺ</h2>
              <p className="text-xs font-mono font-bold text-[#c2410c] mt-0.5">#{order.id}</p>
              <p className="text-[11px] text-stone-500 mt-1">Ngày lập: {invoiceDate}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                {order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Customer & Shipping info */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <span className="text-stone-400 block font-semibold text-[10px] uppercase tracking-wider mb-1">Khách Hàng</span>
              <p className="font-bold text-stone-900 text-sm">{order.recipientName}</p>
              <p className="text-stone-600 mt-0.5">Điện thoại: <strong>{order.phone}</strong></p>
              <p className="text-stone-600">Mã đơn hàng: #{order.id}</p>
            </div>
            <div>
              <span className="text-stone-400 block font-semibold text-[10px] uppercase tracking-wider mb-1">Địa Chỉ Nhận Hàng</span>
              <p className="text-stone-800 leading-relaxed font-medium">{order.address || 'Nhận tại cửa hàng Showroom'}</p>
              <p className="text-stone-500 mt-1 text-[11px]">Trạng thái: <strong>{order.status}</strong></p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-center">STT</th>
                  <th className="p-3">Tên sản phẩm / Linh kiện</th>
                  <th className="p-3 text-center w-16">SL</th>
                  <th className="p-3 text-right w-28">Đơn giá</th>
                  <th className="p-3 text-right w-32">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 text-center font-mono text-stone-400">{idx + 1}</td>
                      <td className="p-3">
                        <span className="font-semibold text-stone-900 block">{item.productName}</span>
                        <span className="text-[10px] text-stone-400">Bảo hành 24-36 tháng chính hãng</span>
                      </td>
                      <td className="p-3 text-center font-bold text-stone-700">{item.quantity}</td>
                      <td className="p-3 text-right font-medium text-stone-600">{formatVnd(item.unitPrice)}</td>
                      <td className="p-3 text-right font-bold text-stone-900">{formatVnd(item.unitPrice * item.quantity)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 text-center font-mono text-stone-400">1</td>
                    <td className="p-3">
                      <span className="font-semibold text-stone-900 block">Đơn hàng linh kiện máy tính #{order.id}</span>
                      <span className="text-[10px] text-stone-400">Bảo hành chính hãng TechZone</span>
                    </td>
                    <td className="p-3 text-center font-bold text-stone-700">1</td>
                    <td className="p-3 text-right font-medium text-stone-600">{formatVnd(order.total)}</td>
                    <td className="p-3 text-right font-bold text-stone-900">{formatVnd(order.total)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex justify-end text-xs">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Tạm tính:</span>
                <span className="font-semibold">{formatVnd(order.total)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-emerald-600">Miễn phí (0 đ)</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Thuế VAT (10%):</span>
                <span className="font-semibold text-stone-500">Đã bao gồm</span>
              </div>
              <div className="border-t-2 border-stone-800 pt-2 flex justify-between text-sm">
                <span className="font-black text-stone-900">TỔNG THANH TOÁN:</span>
                <span className="font-black text-[#c2410c] text-base">{formatVnd(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Warranty & Return policy commitment */}
          <div className="border border-stone-200 bg-stone-50/70 p-3 rounded-xl text-[11px] text-stone-500 space-y-1 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-stone-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chính sách đổi trả & bảo hành:</span>
            </div>
            <p>• Hỗ trợ 1 đổi 1 trong 30 ngày đầu tiên nếu sản phẩm phát sinh lỗi phần cứng do nhà sản xuất.</p>
            <p>• Quý khách vui lòng giữ lại hóa đơn này và vỏ hộp trùng số Serial để được hưởng quyền lợi bảo hành nhanh nhất.</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center text-xs pt-4 text-stone-600">
            <div>
              <p className="font-bold text-stone-800">Người Mua Hàng</p>
              <p className="text-[10px] text-stone-400 italic">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
              <p className="font-medium text-stone-700">{order.recipientName}</p>
            </div>
            <div>
              <p className="font-bold text-stone-800">Đại Diện Cửa Hàng TechZone</p>
              <p className="text-[10px] text-stone-400 italic">(Ký, đóng dấu xác nhận)</p>
              <div className="h-16 flex items-center justify-center">
                <span className="px-3 py-1 rounded border-2 border-rose-600 text-rose-600 font-black uppercase text-[11px] rotate-[-5deg] opacity-75">
                  ĐÃ XÁC NHẬN BÁN
                </span>
              </div>
              <p className="font-medium text-stone-700">Kế Toán Bán Lẻ</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
