import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { Art } from './Art';
import { Stars } from './Stars';
import { Button } from '../ui/Button';
import { formatVnd } from '../../lib/cart';
import { useCart } from '../../stores/cartStore';
import { useWishlist } from '../../stores/wishlistStore';
import { useToast } from '../../stores/toastStore';
import { X, ExternalLink, ShieldCheck, Truck, ShoppingCart, Heart } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const { toggle: toggleWishlist, has: hasWishlist } = useWishlist();
  const toast = useToast();
  const nav = useNavigate();

  if (!product) return null;
  const p = product;

  const handleAddToCart = () => {
    add(p, qty);
    toast.success(`Đã thêm ${qty} "${p.name}" vào giỏ hàng!`);
    onClose();
  };

  const handleViewDetail = () => {
    onClose();
    nav(`/products/${p.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Left: Product artwork */}
            <div className="p-8 bg-stone-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-stone-200">
              <div className="aspect-square w-full max-w-[240px]">
                <Art type={p.art} tint={p.tint} />
              </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c2410c] bg-orange-50 px-2 py-0.5 rounded">
                  {p.brand} · {p.cat}
                </span>

                <h2 className="mt-2 text-base font-bold text-stone-900 leading-snug line-clamp-2">
                  {p.name}
                </h2>

                <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
                  <div className="flex items-center gap-1">
                    <Stars value={p.rate} size={13} />
                    <span className="font-semibold text-stone-700">{p.rate}</span>
                  </div>
                  <span>·</span>
                  <span>{p.reviews} đánh giá</span>
                  <span>·</span>
                  <span>Đã bán {p.sold}</span>
                </div>

                {/* Price block */}
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[#c2410c]">{formatVnd(p.price)}</span>
                    {p.old > p.price && (
                      <span className="text-xs text-stone-400 line-through">{formatVnd(p.old)}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5" /> Miễn phí vận chuyển cho đơn này
                  </p>
                </div>

                {/* Quick features */}
                <div className="mt-3 space-y-1 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Bảo hành chính hãng 12-24 tháng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-mono text-[11px]">SKU:</span>
                    <span className="font-mono text-[11px]">{p.sku}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg bg-stone-50 text-xs">
                    <button
                      className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 font-bold transition rounded-l-lg"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{qty}</span>
                    <button
                      className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 font-bold transition rounded-r-lg"
                      onClick={() => setQty(Math.min(p.stock, qty + 1))}
                    >
                      +
                    </button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs py-2 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Thêm vào giỏ</span>
                  </Button>

                  <button
                    onClick={() => toggleWishlist(p)}
                    className={`p-2 rounded-xl border transition flex items-center justify-center ${
                      hasWishlist(p.id)
                        ? 'border-rose-300 bg-rose-50 text-rose-600'
                        : 'border-stone-200 bg-white text-stone-500 hover:text-rose-600 hover:border-rose-300'
                    }`}
                    title={hasWishlist(p.id) ? 'Bỏ thích sản phẩm' : 'Lưu vào yêu thích'}
                    aria-label={hasWishlist(p.id) ? 'Bỏ thích sản phẩm' : 'Lưu vào yêu thích'}
                  >
                    <Heart className={`w-4 h-4 ${hasWishlist(p.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={handleViewDetail}
                  className="w-full text-center text-xs text-stone-500 hover:text-[#c2410c] transition flex items-center justify-center gap-1 font-medium"
                >
                  <span>Xem thông số kỹ thuật chi tiết</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
