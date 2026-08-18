import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useCart } from "../../stores/cartStore";
import { useToast } from "../../stores/toastStore";
import { CATS } from "../../data/products";
import { SmartSearch } from "../../components/search/SmartSearch";
import { MiniCartDrawer } from "../../components/cart/MiniCartDrawer";
import { OrderLookupModal } from "../../components/order/OrderLookupModal";
import { FloatingActions } from "../../components/common/FloatingActions";
import { NotificationDropdown } from "../../components/header/NotificationDropdown";
import { AccountMenu } from "../../components/header/AccountMenu";
import { AuthModal } from "../../components/header/AuthModal";
import {
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Send,
  Cpu,
  Monitor,
  Flame,
  LayoutGrid,
  Keyboard,
  Mouse,
  HardDrive,
  Headphones,
  Zap,
} from "lucide-react";

// Unified spacious container width across all external layout sections
const LAYOUT_CONTAINER = "mx-auto w-full max-w-[1536px] px-3 sm:px-6 lg:px-8";

const CAT_ICONS: Record<string, any> = {
  "Tất cả": LayoutGrid,
  Laptop: Flame,
  "PC Gaming": Cpu,
  "Màn hình": Monitor,
  "Bàn phím": Keyboard,
  Chuột: Mouse,
  "Linh kiện PC": HardDrive,
  "Tai nghe & Loa": Headphones,
};

export function ExternalLayout() {
  const { items, openDrawer } = useCart();
  const toast = useToast();
  const location = useLocation();
  const [lookupOpen, setLookupOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const totalCartCount = items.reduce((s, i) => s + i.qty, 0);

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    toast.success(
      "Đăng ký nhận bản tin khuyến mãi thành công! Ưu đãi 5% đã được gửi vào email.",
    );
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col text-stone-800">
      {/* 2. MAIN HEADER */}
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-md shadow-sm transition">
        <div
          className={`${LAYOUT_CONTAINER} flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 py-1.5`}
        >
          {/* Left section: Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9a3412] to-[#ea580c] font-black text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-base sm:text-lg font-black tracking-tight text-stone-900">
                    TechZone
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-[#c2410c] uppercase tracking-wider hidden xs:inline sm:inline">
                    Computer
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Smart Search Bar */}
          <SmartSearch />

          {/* Action buttons (Right border: Icon-only buttons) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Build PC Link */}
            <Link
              to="/build-pc"
              className={`hidden md:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-sm ${
                location.pathname === "/build-pc"
                  ? "bg-[#c2410c] text-white shadow-orange-500/20"
                  : "border border-orange-200 bg-orange-50/80 text-[#c2410c] hover:bg-[#c2410c] hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Xây Cấu Hình PC</span>
            </Link>

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* User Account Menu with Auth hook */}
            <AccountMenu onOpenLookup={() => setLookupOpen(true)} />

            {/* Cart Button */}
            <button
              onClick={openDrawer}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition shadow-sm ${
                location.pathname === "/cart"
                  ? "border-[#c2410c] bg-orange-50 text-[#c2410c]"
                  : "border-stone-200 bg-stone-50/80 text-stone-800 hover:border-[#c2410c] hover:bg-white hover:text-[#c2410c]"
              }`}
              aria-label="Xem giỏ hàng"
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-4 h-4 text-[#c2410c]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#c2410c] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. CATEGORY NAVIGATION BAR WITH ICONS */}
        <nav className="border-t border-stone-100 bg-white">
          <div
            className={`${LAYOUT_CONTAINER} flex items-center justify-between`}
          >
            <div className="flex overflow-x-auto no-scrollbar gap-1 py-1.5 -mx-2 px-2 text-xs sm:text-[13px]">
              {CATS.map((c) => {
                const searchParams = new URLSearchParams(location.search);
                const currentCat = searchParams.get("category");
                const isHome = location.pathname === "/";
                const isActive =
                  isHome &&
                  ((c === "Tất cả" && !currentCat) || currentCat === c);
                const IconComponent = CAT_ICONS[c] || LayoutGrid;

                return (
                  <Link
                    key={c}
                    to={
                      c === "Tất cả"
                        ? "/"
                        : `/?category=${encodeURIComponent(c)}`
                    }
                    className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#c2410c] text-white font-bold shadow-sm"
                        : "text-stone-600 hover:text-[#c2410c] hover:bg-stone-100"
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#c2410c]"}`}
                    />
                    <span>{c}</span>
                  </Link>
                );
              })}
            </div>

            {/* Value proposition badges (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 text-[11.5px] text-stone-500 font-medium pl-4 shrink-0">
              <span className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Chính hãng
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <RotateCcw className="w-3.5 h-3.5" /> 30 ngày đổi mới
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Trả góp 0%
              </span>
            </div>
          </div>
        </nav>
      </header>

      {/* 4. MAIN PAGE CONTENT (UNIFIED WIDE CONTAINER) */}
      <main className="flex-1 w-full">
        <div className={`${LAYOUT_CONTAINER} py-4 sm:py-6`}>
          <Outlet />
        </div>
      </main>

      {/* 5. FOOTER CHUẨN THƯƠNG MẠI ĐIỆN TỬ */}
      <footer className="mt-16 border-t border-stone-200 bg-white text-stone-600">
        {/* Value features strip */}
        <div className="border-b border-stone-100 bg-stone-50/70 py-6">
          <div
            className={`${LAYOUT_CONTAINER} grid grid-cols-2 md:grid-cols-4 gap-4`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  Cam kết chính hãng
                </p>
                <p className="text-[11px] text-stone-500">
                  100% linh kiện chính hãng VAT
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  Giao siêu tốc 2H
                </p>
                <p className="text-[11px] text-stone-500">
                  Freeship nội thành đơn từ 500K
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  30 ngày đổi trả
                </p>
                <p className="text-[11px] text-stone-500">
                  Lỗi 1 đổi 1 tận nơi nhanh chóng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  Trả góp 0% lãi suất
                </p>
                <p className="text-[11px] text-stone-500">
                  Duyệt hồ sơ nhanh qua thẻ tín dụng
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer main columns */}
        <div className="py-12">
          <div
            className={`${LAYOUT_CONTAINER} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8`}
          >
            {/* Col 1: Brand & Showrooms */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c2410c] font-black text-white">
                  TZ
                </div>
                <span className="text-base font-bold text-stone-900">
                  TechZone Computer
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
                Hệ thống bán lẻ máy tính xách tay, PC Gaming, linh kiện phần
                cứng và thiết bị công nghệ hàng đầu Việt Nam. Đối tác chiến lược
                của Asus, Dell, MSI, Apple, Logitech.
              </p>
              <div className="text-xs space-y-1.5 text-stone-600 pt-1">
                <p>
                  📍 <strong>Showroom 1:</strong> 123 Đường 3/2, Phường 11, Quận
                  10, TP.HCM
                </p>
                <p>
                  📍 <strong>Showroom 2:</strong> 456 Thái Hà, Đống Đa, Hà Nội
                </p>
                <p>
                  📞 <strong>Hotline bảo hành & kỹ thuật:</strong> 1900.8888
                  (8:00 - 21:30)
                </p>
                <p>
                  ✉️ <strong>Email:</strong> support@techzone.vn
                </p>
              </div>
            </div>

            {/* Col 2: Customer support */}
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[12px]">
                Hỗ trợ khách hàng
              </h3>
              <ul className="space-y-2 text-stone-500">
                <li>
                  <button
                    onClick={() => setLookupOpen(true)}
                    className="hover:text-[#c2410c] transition"
                  >
                    Tra cứu trạng thái đơn hàng
                  </button>
                </li>
                <li>
                  <a href="#policy" className="hover:text-[#c2410c] transition">
                    Hướng dẫn mua hàng online
                  </a>
                </li>
                <li>
                  <a
                    href="#warranty"
                    className="hover:text-[#c2410c] transition"
                  >
                    Chính sách bảo hành & đổi trả
                  </a>
                </li>
                <li>
                  <a
                    href="#installment"
                    className="hover:text-[#c2410c] transition"
                  >
                    Hướng dẫn trả góp 0%
                  </a>
                </li>
                <li>
                  <a href="#ship" className="hover:text-[#c2410c] transition">
                    Chính sách vận chuyển & kiểm hàng
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Payment & Shipping */}
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[12px]">
                Thanh toán & Vận chuyển
              </h3>
              <p className="text-stone-500 text-[11px]">
                Hỗ trợ đa dạng phương thức thanh toán an toàn:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["VietQR", "VNPay", "MoMo", "Visa", "Mastercard", "COD"].map(
                  (pay) => (
                    <span
                      key={pay}
                      className="px-2 py-1 bg-stone-100 border rounded text-[11px] font-semibold text-stone-700"
                    >
                      {pay}
                    </span>
                  ),
                )}
              </div>
              <p className="text-stone-500 text-[11px] pt-2">
                Đối tác vận chuyển:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["GHTK", "Viettel Post", "AhaMove", "GHN"].map((ship) => (
                  <span
                    key={ship}
                    className="px-2 py-1 bg-stone-100 border rounded text-[11px] text-stone-600"
                  >
                    {ship}
                  </span>
                ))}
              </div>
            </div>

            {/* Col 4: Newsletter */}
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[12px]">
                Nhận ưu đãi độc quyền
              </h3>
              <p className="text-stone-500 text-[11px]">
                Đăng ký nhận mã giảm giá 5% cho đơn hàng đầu tiên và thông báo
                khuyến mãi sớm nhất.
              </p>
              <form onSubmit={handleSubscribeNewsletter} className="space-y-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs focus:border-[#c2410c] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#c2410c] px-3 py-2 text-xs font-semibold text-white hover:bg-[#9a3412] transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Đăng ký nhận tin</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-stone-200 bg-stone-100/60 py-4 text-center text-xs text-stone-500">
          <div
            className={`${LAYOUT_CONTAINER} flex flex-col sm:flex-row items-center justify-between gap-2`}
          >
            <span>
              © 2026 <strong>TechZone Computer</strong>. All rights reserved.
            </span>
            <span>Giấy phép ĐKKD số: 0312345678 do Sở KH&ĐT TP.HCM cấp</span>
          </div>
        </div>
      </footer>

      {/* 6. MODALS & FLOATING CONTROLS */}
      <MiniCartDrawer />
      <OrderLookupModal
        isOpen={lookupOpen}
        onClose={() => setLookupOpen(false)}
      />
      <AuthModal />
      <FloatingActions />
    </div>
  );
}
