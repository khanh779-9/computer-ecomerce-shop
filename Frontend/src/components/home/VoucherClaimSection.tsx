import { useState, useEffect } from 'react';
import { fetchActiveVouchers, type Voucher } from '../../services/voucherService';
import { useToast } from '../../stores/toastStore';
import { formatVnd } from '../../lib/cart';
import { Ticket, Copy, Check, Sparkles, Truck } from 'lucide-react';

const FALLBACK_VOUCHERS: Voucher[] = [
  {
    id: 1,
    code: 'TECHZONE50',
    description: 'Giảm ngay 50.000đ cho đơn hàng linh kiện & phụ kiện từ 500K',
    discountAmount: 50000,
    discountPercent: 0,
    minOrderAmount: 500000,
    isFreeShip: false,
    isActive: true,
  },
  {
    id: 2,
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển hỏa tốc 2H cho mọi đơn hàng từ 1.000.000đ',
    discountAmount: 30000,
    discountPercent: 0,
    minOrderAmount: 1000000,
    isFreeShip: true,
    isActive: true,
  },
  {
    id: 3,
    code: 'VIPGAMING',
    description: 'Giảm ngay 200.000đ khi sắm Laptop Gaming hoặc Build PC từ 15 triệu',
    discountAmount: 200000,
    discountPercent: 0,
    minOrderAmount: 15000000,
    isFreeShip: true,
    isActive: true,
  },
  {
    id: 4,
    code: 'VNPAYTECH',
    description: 'Hoàn tiền 5% tối đa 100.000đ khi thanh toán qua Cổng VNPay-QR',
    discountAmount: 100000,
    discountPercent: 5,
    minOrderAmount: 2000000,
    isFreeShip: false,
    isActive: true,
  },
];

export function VoucherClaimSection() {
  const [vouchers, setVouchers] = useState<Voucher[]>(FALLBACK_VOUCHERS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchActiveVouchers()
      .then((data) => {
        if (data && data.length > 0) {
          setVouchers(data);
        }
      })
      .catch(() => {
        // Use fallback coupons
      });
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã giảm giá: "${code}"! Áp dụng khi thanh toán.`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  return (
    <section className="mt-8 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50/90 via-amber-50/50 to-white p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-orange-200/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#c2410c] text-white shadow-sm">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight flex items-center gap-2">
              <span>Mã Giảm Giá Độc Quyền</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#c2410c] border border-orange-300">
                Thu thập ngay
              </span>
            </h2>
            <p className="text-xs text-stone-500">Bấm &quot;Sao chép&quot; để tự động áp dụng mã khi đặt hàng</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#c2410c] font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Tiết kiệm thêm đến 500.000đ</span>
        </div>
      </div>

      {/* Vouchers Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {vouchers.map((v) => {
          const isCopied = copiedCode === v.code;
          return (
            <div
              key={v.id || v.code}
              className="relative flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-3.5 shadow-xs hover:shadow-md hover:border-orange-300 transition-all group overflow-hidden"
            >
              {/* Left ticket punch hole decoration */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f7f6f3] border-r border-stone-200" />
              {/* Right ticket punch hole decoration */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f7f6f3] border-l border-stone-200" />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-black text-sm text-[#c2410c] tracking-wide bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    {v.code}
                  </span>
                  {v.isFreeShip ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Freeship
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      Giảm {formatVnd(v.discountAmount)}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs font-semibold text-stone-700 leading-snug line-clamp-2">
                  {v.description}
                </p>

                <p className="mt-1 text-[11px] text-stone-400">
                  Đơn tối thiểu: <strong>{formatVnd(v.minOrderAmount)}</strong>
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-dashed border-stone-200 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">HSD: Trong tháng này</span>
                <button
                  onClick={() => handleCopy(v.code)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#c2410c] hover:bg-[#9a3412] text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
