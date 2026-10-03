import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { Art } from '../product/Art';
import { formatVnd } from '../../lib/cart';
import { useCart } from '../../stores/cartStore';
import { useToast } from '../../stores/toastStore';
import { Flame, Clock, ShoppingCart, Zap, ChevronRight } from 'lucide-react';

interface FlashSaleSectionProps {
  products: Product[];
}

const TIME_SLOTS = [
  { id: 'morning', time: '09:00 - 12:00', status: 'Đã diễn ra' },
  { id: 'noon', time: '12:00 - 18:00', status: 'Đang diễn ra' },
  { id: 'evening', time: '18:00 - 21:00', status: 'Sắp diễn ra' },
  { id: 'night', time: '21:00 - 24:00', status: 'Đêm giá sốc' },
];

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const nav = useNavigate();
  const { add } = useCart();
  const toast = useToast();
  const [activeSlot, setActiveSlot] = useState('noon');

  // Countdown timer: 03 hours, 45 mins, 20 secs
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 3, minutes: 59, seconds: 59 }; // loop
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products that have discount > 0 or highest discount
  const flashProducts = products
    .filter((p) => p.old > p.price)
    .sort((a, b) => ((b.old - b.price) / b.old) - ((a.old - a.price) / a.old))
    .slice(0, 6);

  if (flashProducts.length === 0) return null;

  const padZero = (n: number) => n.toString().padStart(2, '0');

  const handleQuickAdd = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    add(p);
    toast.success(`Đã thêm "${p.name}" vào giỏ hàng với giá Flash Sale!`);
  };

  return (
    <section className="mt-8 rounded-2xl bg-gradient-to-r from-[#dc2626] via-[#ea580c] to-[#f97316] p-4 sm:p-6 text-white shadow-xl">
      {/* Header bar: Flame title + Countdown + Link */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#dc2626] shadow-md animate-bounce">
              <Flame className="w-5 h-5 fill-[#dc2626]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-white drop-shadow">
                  GIỜ VÀNG GIÁ SỐC
                </h2>
                <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-stone-950 shadow-sm animate-pulse">
                  Flash Sale
                </span>
              </div>
              <p className="text-[11px] text-white/90">Số lượng có hạn · Giá tốt nhất hôm nay</p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold text-white">
            <Clock className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-[11px] text-white/80 mr-1 hidden sm:inline">Kết thúc trong:</span>
            <span className="bg-black/60 px-1.5 py-0.5 rounded text-white font-mono">{padZero(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-black/60 px-1.5 py-0.5 rounded text-white font-mono">{padZero(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-black/60 px-1.5 py-0.5 rounded text-white font-mono">{padZero(timeLeft.seconds)}</span>
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

      {/* Time Slots Row */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TIME_SLOTS.map((slot) => {
          const isSelected = activeSlot === slot.id;
          return (
            <button
              key={slot.id}
              onClick={() => {
                setActiveSlot(slot.id);
                if (slot.id !== 'noon') {
                  toast.info(`Khung giờ "${slot.time}": Đã đặt thông báo nhắc nhở săn sale!`);
                }
              }}
              className={`py-2 px-3 rounded-xl text-center transition flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-white text-stone-900 shadow-md font-bold scale-[1.02]'
                  : 'bg-white/10 hover:bg-white/20 text-white font-medium border border-white/15'
              }`}
            >
              <span className="text-xs sm:text-sm font-black tracking-tight">{slot.time}</span>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider mt-0.5 ${
                  isSelected ? 'text-[#dc2626]' : 'text-yellow-300'
                }`}
              >
                {slot.status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product carousel / grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {flashProducts.map((p) => {
          const discountPercent = Math.round(((p.old - p.price) / p.old) * 100);
          const soldFake = Math.min(28, (p.sold % 20) + 12);
          const progressPercent = Math.min(100, Math.round((soldFake / 30) * 100));

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

              {/* Hot Deal Badge */}
              <div className="absolute top-2 right-2 z-10 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                Hot Deal
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

                {/* Progress bar: Đã bán X/30 */}
                <div className="mt-3">
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-rose-100 flex items-center">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-rose-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <span className="relative z-10 w-full text-center text-[9px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1">
                      <Flame className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
                      <span>Đã bán {soldFake}/30</span>
                    </span>
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
