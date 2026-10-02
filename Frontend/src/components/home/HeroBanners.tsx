import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    tag: "SIÊU PHẨM GAMING 2026",
    title: "Laptop Gaming RTX 40 Series — Chiến Mọi Tựa Game",
    desc: "Trang bị vi xử lý Intel Core Gen 14th & AMD Ryzen 8000, màn hình 165Hz mượt mà. Tặng kèm chuột gaming & balo chống sốc.",
    badge: "Giảm đến 25%",
    cta: "Xem Laptop Gaming",
    category: "Laptop",
    bgGradient: "from-stone-900 via-stone-800 to-[#1c3a34]",
    accentColor: "text-emerald-400",
  },
  {
    id: 2,
    tag: "MÙA TỰU TRƯỜNG",
    title: "Laptop Mỏng Nhẹ Dành Cho Học Sinh - Sinh Viên",
    desc: "Thời lượng pin ấn tượng lên đến 10 giờ, mỏng nhẹ chỉ từ 1.2kg. Giảm thêm 500.000đ khi xuất trình thẻ sinh viên chính chủ.",
    badge: "Trả góp 0% lãi suất",
    cta: "Sắm Ngay Đi Học",
    category: "Laptop",
    bgGradient: "from-[#0f172a] via-[#1e293b] to-[#0369a1]",
    accentColor: "text-sky-400",
  },
  {
    id: 3,
    tag: "WORKSTATION & DIY",
    title: "PC Chuyên Nghiệp — Render Đồ Họa & Livestream",
    desc: "Linh kiện chính hãng 100%, bảo hành tận nơi 36 tháng. Miễn phí công lắp ráp, đi dây nghệ thuật và cài đặt Windows bản quyền.",
    badge: "Tặng tản nhiệt nước",
    cta: "Khám Phá PC Gaming",
    category: "PC Gaming",
    bgGradient: "from-[#3b0764] via-[#581c87] to-stone-900",
    accentColor: "text-purple-400",
  },
];

export function HeroBanners() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const nav = useNavigate();

  // Auto carousel slide every 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="mt-3 sm:mt-4 w-full">
      {/* Clean Single Full-Width Banner Carousel */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${slide.bgGradient} p-5 sm:p-8 md:p-10 text-white flex flex-col justify-between shadow-md min-h-[280px] sm:min-h-[340px] md:min-h-[380px] transition-all duration-700`}
      >
        {/* Subtle Ambient Light Decoration */}
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 ${slide.accentColor}`}
            >
              {slide.tag}
            </span>
            <span className="text-[11px] font-semibold bg-[#c2410c] text-white px-2.5 py-0.5 rounded-full shadow-sm">
              {slide.badge}
            </span>
          </div>

          <h1 className="mt-2.5 sm:mt-3 text-lg sm:text-2xl md:text-3xl font-black leading-tight tracking-tight">
            {slide.title}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-stone-300 max-w-xl line-clamp-2 leading-relaxed">
            {slide.desc}
          </p>

          <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3">
            <Button
              className="bg-white text-stone-900 hover:bg-stone-100 font-bold px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm shadow-md transition-transform hover:scale-105"
              onClick={() =>
                nav(`/?category=${encodeURIComponent(slide.category)}`)
              }
            >
              {slide.cta}
            </Button>
            <span className="text-[11px] sm:text-xs text-stone-300 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Quà tặng trị giá 850.000đ</span>
            </span>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="relative z-10 mt-6 flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex gap-1.5">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? "w-8 bg-white"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Chuyển tới slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentSlide(
                  (prev) => (prev - 1 + SLIDES.length) % SLIDES.length,
                )
              }
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition"
              aria-label="Slide trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
              }
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition"
              aria-label="Slide tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
