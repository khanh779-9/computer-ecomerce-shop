import { useNavigate } from 'react-router-dom';
import { useCart } from '../../stores/cartStore';
import { cartSubtotal, formatVnd, shippingFee } from '../../lib/cart';
import { Art } from '../product/Art';
import { Button } from '../ui/Button';
import { X, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

const FREE_SHIP_THRESHOLD = 500000;

export function MiniCartDrawer() {
  const { items, isDrawerOpen, closeDrawer, setQty, remove } = useCart();
  const nav = useNavigate();

  if (!isDrawerOpen) return null;

  const subtotal = cartSubtotal(items);
  const ship = shippingFee(subtotal);
  const freeShipRemaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-4 bg-stone-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#c2410c]" />
              <h2 className="text-base font-bold text-stone-800">
                Giỏ hàng của bạn{' '}
                <span className="text-xs font-normal text-stone-500">
                  ({items.reduce((s, i) => s + i.qty, 0)} sản phẩm)
                </span>
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress bar */}
          <div className="border-b bg-amber-50/70 px-5 py-3 text-xs text-stone-700">
            <div className="flex items-center gap-2 mb-1.5 font-medium">
              <Truck className="w-4 h-4 text-[#c2410c] shrink-0" />
              {freeShipRemaining === 0 ? (
                <span className="text-emerald-700 font-semibold">
                  🎉 Chúc mừng! Đơn hàng được MIỄN PHÍ giao hàng toàn quốc!
                </span>
              ) : (
                <span>
                  Mua thêm <strong className="text-[#c2410c]">{formatVnd(freeShipRemaining)}</strong> để được{' '}
                  <strong>Freeship</strong> (đơn từ 500k)
                </span>
              )}
            </div>
            <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c2410c] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center text-stone-400">
                <ShoppingBag className="w-16 h-16 stroke-1 text-stone-300 mb-3" />
                <p className="text-sm font-medium text-stone-600">Giỏ hàng của bạn đang trống</p>
                <p className="text-xs text-stone-400 mt-1 max-w-xs">
                  Hãy thêm những chiếc laptop, linh kiện hoặc phụ kiện công nghệ ưng ý vào giỏ nhé!
                </p>
                <Button
                  className="mt-5 text-xs bg-[#c2410c] text-white hover:bg-[#9a3412]"
                  onClick={() => {
                    closeDrawer();
                    nav('/');
                  }}
                >
                  Khám phá sản phẩm ngay
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-3.5 flex gap-3 items-center">
                  <div className="w-16 h-16 rounded border bg-stone-50 p-1.5 shrink-0 flex items-center justify-center">
                    <Art type={item.art} tint={item.tint} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold text-stone-800 line-clamp-1 hover:text-[#c2410c]">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[13px] font-bold text-[#c2410c]">{formatVnd(item.price)}</span>
                      {item.old > item.price && (
                        <span className="text-[11px] text-stone-400 line-through">{formatVnd(item.old)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded bg-white text-xs">
                        <button
                          className="px-2 py-0.5 text-stone-500 hover:bg-stone-100 transition"
                          onClick={() => setQty(item.id, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="w-7 text-center font-medium">{item.qty}</span>
                        <button
                          className="px-2 py-0.5 text-stone-500 hover:bg-stone-100 transition"
                          onClick={() => setQty(item.id, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition p-1"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t bg-stone-50/90 px-5 py-4 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-stone-800">{formatVnd(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span className="font-semibold">
                    {ship === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      formatVnd(ship)
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm">
                  <span className="font-bold text-stone-900">Tổng cộng:</span>
                  <span className="font-bold text-[#c2410c] text-base">{formatVnd(subtotal + ship)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  className="text-xs py-2.5 border-stone-300 text-stone-700 hover:bg-white"
                  onClick={() => {
                    closeDrawer();
                    nav('/cart');
                  }}
                >
                  Xem giỏ hàng
                </Button>
                <Button
                  className="text-xs py-2.5 bg-[#c2410c] text-white hover:bg-[#9a3412] flex items-center justify-center gap-1.5 shadow-sm"
                  onClick={() => {
                    closeDrawer();
                    nav('/checkout');
                  }}
                >
                  <span>Thanh toán</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
