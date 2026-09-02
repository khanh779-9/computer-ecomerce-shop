import type { Product } from '../../types';
import { Art } from './Art';
import { Stars } from './Stars';
import { Button } from '../ui/Button';
import { formatVnd } from '../../lib/cart';
import { Eye, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  p: Product;
  onView: (p: Product) => void;
  onAdd: (p: Product) => void;
  onQuickView?: (p: Product) => void;
}

export function ProductCard({ p, onView, onAdd, onQuickView }: ProductCardProps) {
  const discountPercent = p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0;

  return (
    <div className="group relative flex flex-col rounded-xl border border-stone-200 bg-white shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 overflow-hidden">
      {/* Product Image & badges */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100/60 p-3 sm:p-4 cursor-pointer">
        <div
          onClick={() => onView(p)}
          className="h-full w-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
        >
          <Art type={p.art} tint={p.tint} />
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 rounded-md bg-[#c2410c] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Hot / Best seller tag */}
        {p.sold > 100 && (
          <span className="absolute top-2 right-2 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
            Hot
          </span>
        )}

        {/* Quick View Button overlay on hover */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(p);
            }}
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-stone-700 hover:text-[#c2410c] text-xs font-semibold shadow-md backdrop-blur-sm border border-stone-200 hover:scale-105"
            title="Xem nhanh"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem nhanh</span>
          </button>
        )}
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5 border-t border-stone-100">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
            <span className="hover:text-stone-600 truncate">{p.brand}</span>
            <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 shrink-0">{p.cat}</span>
          </div>

          {/* Name */}
          <button
            onClick={() => onView(p)}
            className="mt-1 line-clamp-2 min-h-[38px] text-left text-xs sm:text-[13px] font-semibold text-stone-800 hover:text-[#c2410c] transition-colors leading-snug"
            title={p.name}
          >
            {p.name}
          </button>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-[15px] font-black text-[#c2410c]">{formatVnd(p.price)}</span>
            {p.old > p.price && (
              <span className="text-[10px] sm:text-[11px] text-stone-400 line-through">{formatVnd(p.old)}</span>
            )}
          </div>

          {/* Rating & Sold count */}
          <div className="mt-1.5 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500">
            <div className="flex items-center gap-1">
              <Stars value={p.rate} size={11} />
              <span className="font-semibold text-stone-700">{p.rate}</span>
            </div>
            <span>Đã bán {p.sold}</span>
          </div>
        </div>

        {/* Add to cart action */}
        <div className="mt-2.5 sm:mt-3">
          <Button
            variant="solid"
            className="w-full text-xs py-1.5 sm:py-2 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold flex items-center justify-center gap-1.5 shadow-sm"
            onClick={() => onAdd(p)}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Thêm vào giỏ</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
