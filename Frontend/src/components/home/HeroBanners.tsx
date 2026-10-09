import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Art } from "../product/Art";
import {
  ChevronLeft,
  ChevronRight,
  Laptop,
  Cpu,
  Monitor,
  Keyboard,
  Mouse,
  HardDrive,
  Headphones,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const CATEGORIES = [
  { name: "Laptop & MacBook", cat: "Laptop", icon: Laptop, tag: "Giảm đến 30%" },
  { name: "PC Gaming & Đồ họa", cat: "PC Gaming", icon: Cpu, tag: "Tặng quà 850K" },
  { name: "Linh kiện PC (VGA, CPU)", cat: "Linh kiện PC", icon: HardDrive, tag: "Giá sốc" },
  { name: "Màn hình máy tính", cat: "Màn hình", icon: Monitor, tag: "144Hz - 240Hz" },
  { name: "Bàn phím cơ & Chuột", cat: "Bàn phím", icon: Keyboard, tag: "Chính hãng" },
  { name: "Chuột Gaming & Văn phòng", cat: "Chuột", icon: Mouse, tag: "Hot" },
  { name: "Tai nghe & Loa Gaming", cat: "Tai nghe & Loa", icon: Headphones, tag: "Âm thanh vòm" },
];

const SLIDES = [
  {
    id: 1,
    tag: "Laptop gaming",
    title: "Laptop gaming cho những buổi chơi dài",
    desc: "Màn hình 165Hz, RTX 4060 và tản nhiệt hai quạt. Xem các mẫu đang có sẵn tại TechZone.",
    badge: "Giảm đến 30%",
    cta: "Sắm Laptop Gaming Ngay",
    category: "Laptop",
    bgGradient: "from-stone-900 via-stone-800 to-[#9a3412]",
    accentColor: "text-amber-400",
    artType: "laptop",
    artTint: "#fbbf24",
    priceLabel: "Chỉ từ",
    priceValue: "18.990.000đ",
    specs: ["RTX 4060 8GB GDDR6", "Intel Core i7-14650HX", "165Hz 100% sRGB", "Tản nhiệt 2 quạt 3D"],
    giftText: "Tặng kèm balo & chuột gaming",
  },
  {
    id: 2,
    tag: "Laptop văn phòng",
    title: "Máy nhẹ, pin lâu cho việc học và làm việc",
    desc: "Các mẫu máy từ 1,1 kg, màn hình dễ nhìn và đủ pin cho một ngày ở trường hoặc văn phòng.",
    badge: "Ưu đãi sinh viên",
    cta: "Khám Phá Ưu Đãi Sinh Viên",
    category: "Laptop",
    bgGradient: "from-stone-800 via-stone-700 to-[#57534e]",
    accentColor: "text-sky-300",
    artType: "laptop",
    artTint: "#38bdf8",
    priceLabel: "Chỉ từ",
    priceValue: "11.490.000đ",
    specs: ["Pin 12 giờ liên tục", "Trọng lượng 1.1kg", "Màn hình IPS chống lóa", "Bảo hành 24T chính hãng"],
    giftText: "Tặng túi chống sốc & chuột",
  },
  {
    id: 3,
    tag: "Build PC theo nhu cầu",
    title: "Bạn đưa ngân sách, TechZone lên cấu hình",
    desc: "Tư vấn linh kiện phù hợp, lắp ráp gọn gàng và kiểm tra máy trước khi giao.",
    badge: "Tặng tản nước AIO",
    cta: "Tự Xây Cấu Hình PC",
    category: "PC Gaming",
    bgGradient: "from-stone-900 via-[#431407] to-[#9a3412]",
    accentColor: "text-orange-300",
    artType: "pc",
    artTint: "#f97316",
    priceLabel: "Cấu hình từ",
    priceValue: "9.990.000đ",
    specs: ["Tản nhiệt nước AIO 240mm", "Nguồn 750W 80 Plus Gold", "Bảo hành tận nơi 36T", "Free lắp & đi dây"],
    giftText: "Tặng lót chuột dài 80cm",
  },
];

export function HeroBanners() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="mt-3 sm:mt-4 w-full">
      {/* 3-Column Hero Grid: Sidebar Menu + Main Slider + Right Sub-banners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* 1. Left: Category Mega Sidebar (Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between rounded-2xl border border-stone-200 bg-white p-2.5 shadow-sm">
          <div className="space-y-0.5">
            <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>Danh Mục Sản Phẩm</span>
              </span>
            </div>

            {CATEGORIES.map((catItem) => {
              const Icon = catItem.icon;
              return (
                <button
                  key={catItem.name}
                  onClick={() => nav(`/products?category=${encodeURIComponent(catItem.cat)}`)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-orange-50/80 hover:text-[#c2410c] text-stone-700 transition group text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 text-stone-400 group-hover:text-[#c2410c] shrink-0 transition-colors" />
                    <span className="font-semibold truncate">{catItem.name}</span>
                  </div>
                  {catItem.tag && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 group-hover:bg-orange-100 text-stone-500 group-hover:text-[#c2410c] shrink-0 transition-colors">
                      {catItem.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick PC Builder Callout in Sidebar */}
          <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-xs">
            <p className="font-bold text-[#c2410c] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Smart PC Builder</span>
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5">Tự động check socket & nguồn điện</p>
            <button
              onClick={() => nav("/build-pc")}
              className="mt-2 w-full py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-[11px] transition flex items-center justify-center gap-1 shadow-xs"
            >
              <span>Xây cấu hình ngay</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2. Center: Main Promotional Carousel (Expanded to 9 cols) */}
        <div className="lg:col-span-9 flex flex-col">
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${slide.bgGradient} p-5 sm:p-7 md:p-8 text-white flex flex-col justify-between shadow-md h-full min-h-[320px] transition-all duration-700`}
          >
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
              {/* Left Column: Headlines, Promo tags, CTA button */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold tracking-wide text-white/70">
                    {slide.tag}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight text-white drop-shadow-xs">
                  {slide.title}
                </h1>

                <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 leading-relaxed">
                  {slide.desc}
                </p>

                {/* Action Row */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    className="bg-white text-stone-900 hover:bg-stone-100 font-bold px-5 py-2.5 text-xs sm:text-sm shadow-md rounded-lg flex items-center gap-1.5"
                    onClick={() => nav(`/products?category=${encodeURIComponent(slide.category)}`)}
                  >
                    <span>{slide.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <span className="text-xs text-white/70">
                    {slide.priceLabel} {slide.priceValue}
                  </span>
                </div>
              </div>

              {/* Right Column: Visual Showcase Card */}
              <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center relative">
                <div className="relative w-full max-w-[280px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-2xl flex flex-col items-center text-center group hover:bg-white/15 transition-all">
                  {/* Floating Price Pill */}
                  {/* Artwork Showcase */}
                  <div className="h-36 w-36 relative flex items-center justify-center my-1 filter drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Art type={slide.artType} tint={slide.artTint} />
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel navigation controls */}
            <div className="relative z-10 mt-6 flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex gap-1.5">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? "w-7 bg-white" : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                  className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                  className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Commitments Strip (Phong Vũ / CellphoneS style) */}
      <div className="mt-3.5 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-3 shadow-2xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900 leading-tight">100% Chính Hãng</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Bảo hành 12 - 36 tháng VAT</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-3 shadow-2xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900 leading-tight">Giao Siêu Tốc 2H</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Freeship đơn từ 500.000đ</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-3 shadow-2xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900 leading-tight">Lỗi 1 Đổi 1 Trong 30 Ngày</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Đổi mới tại nhà thuận tiện</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-3 shadow-2xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900 leading-tight">Hỗ Trợ Kỹ Thuật 24/7</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Lắp ráp & cài phần mềm miễn phí</p>
          </div>
        </div>
      </div>
    </section>
  );
}
