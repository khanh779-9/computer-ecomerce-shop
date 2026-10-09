import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { Art } from '../product/Art';
import { formatVnd } from '../../lib/cart';
import { useCart } from '../../stores/cartStore';
import { useToast } from '../../stores/toastStore';
import { Flame, ShoppingCart, Zap, ChevronRight } from 'lucide-react';

interface FlashSaleSectionProps {
  products: Product[];
}

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const nav = useNavigate();
  const { add } = useCart();
  const toast = useToast();

  // Filter products that have discount > 0 or highest discount
  const flashProducts = products
    .filter((p) => p.old > p.price)
    .sort((a, b) => ((b.old - b.price) / b.old) - ((a.old - a.price) / a.old))
    .slice(0, 6);

  if (flashProducts.length === 0) return null;

  const handleQuickAdd = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    add(p);
    toast.success(`Đã thêm "${p.name}" vào giỏ hàng với giá Flash Sale!`);
  };

  return (
    <section className="mt-8 rounded-2xl bg-gradient-to-r from-[#dc2626] via-[#ea580c] to-[#f97316] p-4 sm:p-6 text-white shadow-xl">
      {/* Header bar: sale title + link */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#dc2626] shadow-md animate-bounce">
              <Flame className="w-5 h-5 fill-[#dc2626]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black tracking-tight text-white">
                  Ưu đãi trong ngày
                </h2>
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Đang giảm giá
                </span>
              </div>
              <p className="text-[11px] text-white/90">Số lượng có hạn · Giá tốt nhất hôm nay</p>
            </div>
          </div>

        </div>

        <button
          onClick={() => nav('/?sort=price-desc')}
          className="flex items-center gap-1 text-xs font-bold text-white hover:text-yellow-200 transition bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/20"
        >
          <span>Xem tất cả ưu đãi</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product carousel / grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {flashProducts.map((p) => {
          const discountPercent = Math.round(((p.old - p.price) / p.old) * 100);
          return (
            <div
              key={p.id}
              onClick={() => nav(`/products/${p.id}`)}
              className="group relative flex flex-col justify-between rounded-xl bg-white p-3 text-stone-900 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-white/60"
            >
              {/* Discount Tag */}
              <div className="absolute top-2 left-2 z-10 rounded-md bg-[#dc2626] px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                <span>-{discountPercent}%</span>
              </div>

              {/* Image */}
              <div className="relative aspect-square w-full flex items-center justify-center p-2 mt-4 bg-stone-50 rounded-lg group-hover:scale-105 transition-transform duration-300">
                <Art type={p.art} tint={p.tint} />
              </div>

              {/* Content */}
              <div className="mt-2.5 flex flex-1 flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-400">{p.brand}</span>
                  <h3 className="line-clamp-2 text-xs font-bold text-stone-800 leading-snug group-hover:text-[#dc2626] transition-colors min-h-[32px]">
                    {p.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-2">
                    <span className="text-sm font-black text-[#dc2626] block leading-none">
                      {formatVnd(p.price)}
                    </span>
                    <span className="text-[11px] text-stone-400 line-through mt-0.5 block">
                      {formatVnd(p.old)}
                    </span>
                  </div>
                </div>

                {/* Sales information from the product data */}
                <div className="mt-3">
                  <div className="flex items-center gap-1 text-[10px] text-stone-500">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span>Đã bán {p.sold}</span>
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => handleQuickAdd(e, p)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white py-1.5 text-[11px] font-bold shadow-sm transition"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Mua ngay</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
