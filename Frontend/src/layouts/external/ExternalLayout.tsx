import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useCart } from "../../stores/cartStore";
import { useToast } from "../../stores/toastStore";
import { useCompare } from "../../stores/compareStore";
import { formatVnd, cartSubtotal } from "../../lib/cart";
import { CATS } from "../../data/products";
import { SmartSearch } from "../../components/search/SmartSearch";
import { MiniCartDrawer } from "../../components/cart/MiniCartDrawer";
import { OrderLookupModal } from "../../components/order/OrderLookupModal";
import { FloatingActions } from "../../components/common/FloatingActions";
import { CompareFloatingBar } from "../../components/compare/CompareFloatingBar";
import { NotificationDropdown } from "../../components/header/NotificationDropdown";
import { AccountMenu } from "../../components/header/AccountMenu";
import { AuthModal } from "../../components/header/AuthModal";
import { AiConsultantWidget } from "../../components/ai/AiConsultantWidget";
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
  Scale,
  PhoneCall,
  PackageCheck,
  MapPin,
  ChevronDown,
} from "lucide-react";

// Unified container width across all external layout sections
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
  const { count: compareCount } = useCompare();
  const toast = useToast();
  const location = useLocation();
  const [lookupOpen, setLookupOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);

  const totalCartCount = items.reduce((s, i) => s + i.qty, 0);
  const cartTotalAmount = cartSubtotal(items);

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
          className={`${LAYOUT_CONTAINER} flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 py-2`}
        >
          {/* Logo & Category Dropdown Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#c2410c] to-[#ea580c] font-black text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-stone-900">
                    TechZone Computer
                  </span>
                </div>
              </div>
            </Link>

            {/* Category Dropdown Button (Phong Vũ / CellphoneS style) */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => setIsCatMenuOpen(!isCatMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
              >
                <LayoutGrid className="w-4 h-4 text-[#c2410c]" />
                <span>Danh mục</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {isCatMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setIsCatMenuOpen(false)}
                >
                  {CATS.map((c) => {
                    const Icon = CAT_ICONS[c] || LayoutGrid;
                    return (
                      <Link
                        key={c}
                        to={
                          c === "Tất cả"
                            ? "/products"
                            : `/products?category=${encodeURIComponent(c)}`
                        }
                        onClick={() => setIsCatMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-orange-50 hover:text-[#c2410c] transition"
                      >
                        <Icon className="w-4 h-4 text-[#c2410c]" />
                        <span>{c}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Smart Search Bar */}
          <SmartSearch />

          {/* Action buttons on Right */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Build PC Link with Chip icon */}
            <Link
              to="/build-pc"
              className={`hidden md:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs ${
                location.pathname === "/build-pc"
                  ? "bg-[#c2410c] text-white shadow-orange-500/20"
                  : "border border-orange-200 bg-orange-50 text-[#c2410c] hover:bg-[#c2410c] hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Xây Cấu Hình PC</span>
            </Link>

            {/* Compare Link */}
            <Link
              to="/compare"
              className={`relative flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 text-xs font-bold transition shadow-xs ${
                location.pathname === "/compare"
                  ? "bg-[#c2410c] text-white shadow-orange-500/20"
                  : "border border-stone-200 bg-stone-50/80 text-stone-700 hover:border-[#c2410c] hover:bg-white hover:text-[#c2410c]"
              }`}
              title="So sánh sản phẩm"
            >
              <Scale className="w-4 h-4 text-[#c2410c]" />
              <span className="hidden sm:inline">So Sánh</span>
              {compareCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#c2410c] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Warranty Lookup Link */}
            <Link
              to="/warranty"
              className={`hidden lg:flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 text-xs font-bold transition shadow-xs ${
                location.pathname === "/warranty"
                  ? "bg-[#c2410c] text-white shadow-orange-500/20"
                  : "border border-stone-200 bg-stone-50/80 text-stone-700 hover:border-[#c2410c] hover:bg-white hover:text-[#c2410c]"
              }`}
              title="Tra cứu bảo hành & RMA"
            >
              <ShieldCheck className="w-4 h-4 text-[#c2410c]" />
              <span>Bảo Hành</span>
            </Link>

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* User Account Menu with Auth hook */}
            <AccountMenu onOpenLookup={() => setLookupOpen(true)} />

            {/* Cart Button (Icon only with badge, no text) */}
            <button
              onClick={openDrawer}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                location.pathname === "/cart"
                  ? "border-[#c2410c] bg-orange-50 text-[#c2410c]"
                  : "border-stone-200 bg-white text-stone-700 hover:border-[#c2410c] hover:text-[#c2410c]"
              }`}
              aria-label="Giỏ hàng"
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#c2410c] px-1 text-[10px] font-bold text-white shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 4. MAIN PAGE CONTENT */}
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
                  100% linh kiện chính hãng Full VAT
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
                  Thanh toán linh hoạt
                </p>
                <p className="text-[11px] text-stone-500">
                  Chuyển khoản, thẻ ngân hàng & COD
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
                  <Link
                    to="/warranty"
                    className="hover:text-[#c2410c] text-stone-700 font-semibold transition flex items-center gap-1.5"
                  >
                    <span>Tra cứu bảo hành & tiến độ RMA</span>
                    <span className="px-1.5 py-0.2 rounded bg-orange-100 text-[#c2410c] text-[10px] font-bold">
                      Mới
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support/order-lookup"
                    className="hover:text-[#c2410c] transition"
                  >
                    Tra cứu trạng thái đơn hàng
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support/shopping-guide"
                    className="hover:text-[#c2410c] transition"
                  >
                    Hướng dẫn mua hàng online
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support/warranty-policy"
                    className="hover:text-[#c2410c] transition"
                  >
                    Chính sách bảo hành & đổi trả
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support/payment-guide"
                    className="hover:text-[#c2410c] transition"
                  >
                    Hướng dẫn thanh toán & đặt hàng
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support/shipping-policy"
                    className="hover:text-[#c2410c] transition"
                  >
                    Chính sách vận chuyển & kiểm hàng
                  </Link>
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
                {[
                  "VNPay",
                  "ATM Nội Địa",
                  "VNPAY-QR",
                  "Visa",
                  "Mastercard",
                  "COD",
                ].map((pay) => (
                  <span
                    key={pay}
                    className="px-2 py-1 bg-stone-100 border rounded text-[11px] font-semibold text-stone-700"
                  >
                    {pay}
                  </span>
                ))}
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

        {/* Bottom copyright & Ministry of Industry and Trade badge */}
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
      <AiConsultantWidget />
      <CompareFloatingBar />
    </div>
  );
}
