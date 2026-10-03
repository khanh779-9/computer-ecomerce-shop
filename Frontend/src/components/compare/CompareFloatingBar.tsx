import { Link } from 'react-router-dom';
import { useCompare } from '../../stores/compareStore';
import { Art } from '../product/Art';
import { Scale, X, ArrowRight } from 'lucide-react';
import { formatVnd } from '../../lib/cart';

export function CompareFloatingBar() {
  const { items, remove, clear, count } = useCompare();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border border-stone-200 bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 shrink-0">
            <div className="p-1.5 rounded-lg bg-orange-100 text-[#c2410c]">
              <Scale className="w-4 h-4" />
            </div>
            <span>So sánh ({count}/4)</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {items.map((prod) => (
              <div
                key={prod.id}
                className="relative group w-11 h-11 rounded-lg border border-stone-200 bg-stone-50 p-1 shrink-0 flex items-center justify-center shadow-xs"
                title={`${prod.name} - ${formatVnd(prod.price)}`}
              >
                <Art type={prod.art} tint={prod.tint} />
                <button
                  type="button"
                  onClick={() => remove(prod.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow hover:bg-rose-600"
                  title="Gỡ sản phẩm"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={clear}
            className="text-[11px] font-semibold text-stone-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition"
          >
            Xóa hết
          </button>

          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-md transition hover:scale-105"
          >
            <span>So sánh ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
