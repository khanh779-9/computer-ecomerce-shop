import { useState } from 'react';
import { fetchOrderById, type OrderResponse } from '../../services/orderService';
import { formatVnd } from '../../lib/cart';
import { Button } from '../ui/Button';
import { X, Search, Package, Clock, CheckCircle2, AlertCircle, Truck, MapPin, Phone, User } from 'lucide-react';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderLookupModal({ isOpen, onClose }: OrderLookupModalProps) {
  const [orderInput, setOrderInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderInput.trim().replace(/^ORD-?/i, '');
    const numId = parseInt(cleanId, 10);

    if (isNaN(numId) || numId <= 0) {
      setError('Vui lòng nhập mã đơn hàng hợp lệ (ví dụ: 1 hoặc ORD-1)');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const data = await fetchOrderById(numId);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy thông tin đơn hàng này.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Chờ xử lý
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Truck className="w-3.5 h-3.5" /> Đang vận chuyển
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Giao thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 bg-stone-50">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#c2410c]" />
              <h2 className="text-base font-bold text-stone-800">Tra cứu tình trạng đơn hàng</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Search form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Nhập mã đơn hàng (ví dụ: 1 hoặc ORD-1)..."
                  value={orderInput}
                  onChange={(e) => setOrderInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c2410c] border-stone-300"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#c2410c] text-white hover:bg-[#9a3412] px-4 text-sm"
              >
                {loading ? 'Đang tìm...' : 'Tra cứu'}
              </Button>
            </form>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Order details */}
            {order && (
              <div className="border rounded-xl bg-stone-50/50 p-4 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-stone-400 font-mono">Mã đơn:</span>{' '}
                    <span className="font-bold text-stone-900 text-sm">#ORD-{order.id}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Recipient info */}
                <div className="grid grid-cols-2 gap-2 text-stone-600 bg-white p-3 rounded-lg border border-stone-200">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-medium text-stone-800">{order.recipientName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{order.phone}</span>
                  </div>
                  <div className="col-span-2 flex items-start gap-1.5 mt-1 pt-1 border-t border-stone-100">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span className="text-stone-700">{order.address}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <p className="font-semibold text-stone-700">Chi tiết sản phẩm ({order.items?.length || 0}):</p>
                  <div className="divide-y divide-stone-200 bg-white rounded-lg border border-stone-200 max-h-48 overflow-y-auto">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-medium text-stone-800 truncate">{it.productName}</p>
                          <p className="text-stone-400 text-[11px]">
                            {formatVnd(it.unitPrice)} × {it.quantity}
                          </p>
                        </div>
                        <span className="font-semibold text-stone-800 shrink-0">{formatVnd(it.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price summary */}
                <div className="border-t border-stone-200 pt-3 space-y-1.5 text-stone-600">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatVnd(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{order.shippingFee === 0 ? 'Miễn phí' : formatVnd(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phương thức:</span>
                    <span className="font-medium text-stone-800">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-stone-200 pt-2 text-stone-900">
                    <span>Tổng đơn hàng:</span>
                    <span className="text-[#c2410c]">{formatVnd(order.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
