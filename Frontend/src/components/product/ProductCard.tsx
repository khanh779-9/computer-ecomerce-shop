import type { Product } from '../../types';
import { Art } from './Art';
import { Stars } from './Stars';
import { formatVnd } from '../../lib/cart';
import { useCompare } from '../../stores/compareStore';
import { useWishlist } from '../../stores/wishlistStore';
import { Eye, ShoppingCart, Scale, Gift, Heart } from 'lucide-react';

interface ProductCardProps {
  p: Product;
  onView: (p: Product) => void;
  onAdd: (p: Product) => void;
  onQuickView?: (p: Product) => void;
}

export function ProductCard({ p, onView, onAdd, onQuickView }: ProductCardProps) {
  const { toggle, has } = useCompare();
  const { toggle: toggleWishlist, has: hasWishlist } = useWishlist();
  const isCompared = has(p.id);
  const isFavorite = hasWishlist(p.id);
  const discountPercent = p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0;

  // Gift preview simulation for tech e-commerce
  const hasGift = p.price >= 5000000;
  const giftText = p.cat === 'Laptop' || p.cat === 'PC Gaming'
    ? 'Tặng balo gaming & chuột không dây'
    : 'Tặng voucher 100K mua phụ kiện';

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-stone-200 bg-white shadow-2xs hover:shadow-xl hover:border-red-300 transition-all duration-300 overflow-hidden">
      {/* Top Image area */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50/60 p-3 sm:p-4 cursor-pointer">
        <div
          onClick={() => onView(p)}
          className="h-full w-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
        >
          <Art type={p.art} tint={p.tint} />
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="rounded-md bg-[#dc2626] px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
              Giảm {discountPercent}%
            </span>
          )}
          {p.sold > 80 && (
            <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-sm">
              Bán chạy
            </span>
          )}
        </div>

        {/* Top Right: Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(p);
          }}
          className={`absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all shadow-xs ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 border border-rose-200 scale-105'
              : 'bg-white/80 backdrop-blur-xs text-stone-400 hover:text-rose-600 hover:bg-white border border-stone-200/80 hover:scale-110'
          }`}
          title={isFavorite ? 'Bỏ thích sản phẩm' : 'Lưu vào sản phẩm yêu thích'}
          aria-label={isFavorite ? 'Bỏ thích sản phẩm' : 'Lưu vào sản phẩm yêu thích'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick Action buttons on hover */}
        <div className="absolute bottom-2.5 left-1/2 -translate-y-0 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 z-20">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(p);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-stone-700 hover:text-[#dc2626] text-xs font-semibold shadow-md backdrop-blur-sm border border-stone-200 hover:scale-105"
              title="Xem nhanh thông số"
            >
              <Eye className="w-3 h-3" />
              <span>Xem</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle(p);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm border transition hover:scale-105 ${
              isCompared
                ? 'bg-[#c2410c] text-white border-[#c2410c]'
                : 'bg-white/95 text-stone-700 hover:text-[#c2410c] border-stone-200'
            }`}
            title={isCompared ? 'Đã có trong so sánh (Bấm để gỡ)' : 'Thêm vào so sánh cấu hình'}
          >
            <Scale className="w-3 h-3" />
            <span>{isCompared ? 'Đã so' : 'So sánh'}</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5 border-t border-stone-100">
        <div>
          {/* Brand & Stock status */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
            <span className="text-[#c2410c] font-black uppercase text-[10px] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60">
              {p.brand}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              Còn hàng
            </span>
          </div>

          {/* Product Name */}
          <button
            onClick={() => onView(p)}
            className="mt-1.5 line-clamp-2 min-h-[38px] text-left text-xs sm:text-[13px] font-bold text-stone-800 hover:text-[#dc2626] transition-colors leading-snug"
            title={p.name}
          >
            {p.name}
          </button>

          {/* Pricing Row */}
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-black text-[#dc2626] tracking-tight">
              {formatVnd(p.price)}
            </span>
            {p.old > p.price && (
              <span className="text-[11px] text-stone-400 line-through">
                {formatVnd(p.old)}
              </span>
            )}
          </div>

          {/* Gift announcement (Phong Vũ style) */}
          {hasGift && (
            <div className="mt-2 rounded-lg bg-orange-50/70 border border-orange-200/60 p-1.5 flex items-center gap-1.5 text-[10px] text-stone-700">
              <Gift className="w-3 h-3 text-[#c2410c] shrink-0" />
              <span className="truncate">{giftText}</span>
            </div>
          )}

          {/* Rating & Sold count */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-stone-500">
            <div className="flex items-center gap-1">
              <Stars value={p.rate} size={11} />
              <span className="font-bold text-stone-700">{p.rate}</span>
              <span className="text-stone-400">({p.reviews})</span>
            </div>
            <span>Đã bán {p.sold}</span>
          </div>
        </div>

        {/* Action Button: Add to Cart */}
        <div className="mt-3">
          <button
            className="w-full text-xs py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition hover:shadow"
            onClick={() => onAdd(p)}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span>Thêm giỏ hàng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
