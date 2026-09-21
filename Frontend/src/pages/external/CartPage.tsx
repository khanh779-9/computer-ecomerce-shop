import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../stores/cartStore';
import { useToast } from '../../stores/toastStore';
import { cartSubtotal, formatVnd, shippingFee } from '../../lib/cart';
import { Art } from '../../components/product/Art';
import { Button } from '../../components/ui/Button';
import {
  ShoppingBag,
  Trash2,
  Truck,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const FREE_SHIP_THRESHOLD = 500000;

const AVAILABLE_VOUCHERS = [
  { code: 'TECHZONE50', desc: 'Giảm 50.000đ cho đơn từ 1.000.000đ', discount: 50000, minOrder: 1000000 },
  { code: 'FREESHIP', desc: 'Miễn phí giao hàng toàn quốc', discountShip: true, minOrder: 0 },
  { code: 'SINHVIEN', desc: 'Giảm 100.000đ cho tân sinh viên (đơn từ 5tr)', discount: 100000, minOrder: 5000000 },
];

export function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const toast = useToast();
  const nav = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountShip?: boolean;
  } | null>(null);

  const subtotal = cartSubtotal(items);
  let baseShip = shippingFee(subtotal);
  if (appliedCoupon?.discountShip) {
    baseShip = 0;
  }

  const voucherDiscount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(0, subtotal - voucherDiscount + baseShip);
  const freeShipRemaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100));

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã giảm giá.');
      return;
    }

    const found = AVAILABLE_VOUCHERS.find((v) => v.code === code);
    if (!found) {
      toast.error(`Mã giảm giá "${code}" không hợp lệ hoặc đã hết hạn.`);
      return;
    }

    if (subtotal < found.minOrder) {
      toast.error(`Mã "${code}" chỉ áp dụng cho đơn hàng từ ${formatVnd(found.minOrder)}.`);
      return;
    }

    setAppliedCoupon({
      code: found.code,
      discount: found.discount || 0,
      discountShip: found.discountShip,
    });
    setCouponCode('');
    toast.success(`Áp dụng mã "${found.code}" thành công!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Đã hủy áp dụng mã giảm giá.');
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h1 className="text-xl font-bold text-stone-800">Giỏ hàng của bạn đang trống</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto">
          Không có sản phẩm nào trong giỏ hàng. Hãy khám phá hàng ngàn laptop, PC và phụ kiện chính hãng tại TechZone!
        </p>
        <Button
          onClick={() => nav('/')}
          className="mt-6 bg-[#c2410c] hover:bg-[#9a3412] text-white px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md"
        >
          Khám phá sản phẩm ngay
        </Button>
      </main>
    );
  }

  return (
    <div className="w-full pb-16">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">Giỏ hàng của bạn</h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700">
            {items.reduce((s, i) => s + i.qty, 0)} sản phẩm
          </span>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
              clear();
              toast.info('Đã xóa tất cả sản phẩm khỏi giỏ hàng.');
            }
          }}
          className="text-xs text-stone-400 hover:text-rose-600 transition flex items-center gap-1 font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      {/* Free shipping progress */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#c2410c]" />
            {freeShipRemaining === 0 ? (
              <span className="text-emerald-700 font-bold">
                🎉 Bạn đã đủ điều kiện MIỄN PHÍ VẬN CHUYỂN toàn quốc!
              </span>
            ) : (
              <span>
                Mua thêm <strong className="text-[#c2410c]">{formatVnd(freeShipRemaining)}</strong> để được{' '}
                <strong>Freeship</strong> (đơn từ 500k)
              </span>
            )}
          </span>
          <span className="text-stone-500 font-mono">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-[#c2410c] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Items + Order Summary */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden divide-y divide-stone-100">
            {items.map((i) => (
              <div key={i.id} className="p-4 sm:p-5 flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl border border-stone-100 bg-stone-50 p-2 shrink-0 flex items-center justify-center">
                  <Art type={i.art} tint={i.tint} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#c2410c] bg-orange-50 px-1.5 py-0.5 rounded">
                      {i.brand}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">SKU: {i.sku}</span>
                  </div>

                  <Link
                    to={`/products/${i.id}`}
                    className="text-xs sm:text-sm font-bold text-stone-800 hover:text-[#c2410c] transition line-clamp-1"
                  >
                    {i.name}
                  </Link>

                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-sm sm:text-base font-black text-[#c2410c]">{formatVnd(i.price)}</span>
                    {i.old > i.price && (
                      <span className="text-xs text-stone-400 line-through">{formatVnd(i.old)}</span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 text-xs">
                    <button
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition rounded-l-lg font-bold"
                      onClick={() => setQty(i.id, i.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-stone-800">{i.qty}</span>
                    <button
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition rounded-r-lg font-bold"
                      onClick={() => setQty(i.id, i.qty + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      remove(i.id);
                      toast.info(`Đã xóa "${i.name}" khỏi giỏ.`);
                    }}
                    className="text-stone-400 hover:text-rose-600 transition p-1"
                    title="Xóa sản phẩm này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#c2410c] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tiếp tục mua thêm linh kiện & sản phẩm khác</span>
          </Link>
        </div>

        {/* Right: Order Summary Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-base font-black text-stone-900 pb-2 border-b border-stone-100">
              Tóm tắt đơn hàng
            </h2>

            {/* Voucher input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>Mã khuyến mãi / Voucher</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã (TECHZONE50, FREESHIP...)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs uppercase placeholder:normal-case focus:border-[#c2410c] focus:outline-none"
                />
                <Button
                  variant="dark"
                  onClick={() => handleApplyCoupon()}
                  className="text-xs px-3 py-1.5 font-bold"
                >
                  Áp dụng
                </Button>
              </div>

              {/* Applied coupon pill */}
              {appliedCoupon && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã áp mã {appliedCoupon.code}
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-rose-600 hover:underline font-bold text-[11px]">
                    Hủy
                  </button>
                </div>
              )}

              {/* Available vouchers quick select */}
              <div className="pt-1 flex flex-wrap gap-1.5">
                {AVAILABLE_VOUCHERS.map((v) => (
                  <button
                    key={v.code}
                    onClick={() => handleApplyCoupon(v.code)}
                    className="px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50/60 text-[11px] font-mono text-[#c2410c] hover:bg-[#c2410c] hover:text-white transition"
                    title={v.desc}
                  >
                    +{v.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing lines */}
            <div className="space-y-2 pt-3 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Tạm tính hàng hóa:</span>
                <span className="font-semibold text-stone-800">{formatVnd(subtotal)}</span>
              </div>

              {voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Giảm giá khuyến mãi:</span>
                  <span>-{formatVnd(voucherDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span className="font-semibold">
                  {baseShip === 0 ? (
                    <span className="text-emerald-600 font-bold">Miễn phí</span>
                  ) : (
                    formatVnd(baseShip)
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t border-stone-200 pt-3 text-sm font-black text-stone-900">
                <span>Tổng thanh toán:</span>
                <span className="text-[#c2410c] text-lg">{formatVnd(grandTotal)}</span>
              </div>
              <p className="text-[10px] text-stone-400 text-right">(Đã bao gồm thuế GTGT 10%)</p>
            </div>

            {/* Checkout CTA */}
            <Button
              onClick={() => nav('/checkout')}
              className="w-full py-3 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Tiến hành thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Guarantee note */}
            <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bảo mật thông tin giao dịch & đơn hàng 100%</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
