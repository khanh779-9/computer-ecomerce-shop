import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ProductCard } from "../../../components/product/ProductCard";
import { ProductCardSkeleton } from "../../../components/product/ProductCardSkeleton";
import { QuickViewModal } from "../../../components/product/QuickViewModal";
import { HeroBanners } from "../../../components/home/HeroBanners";
import { FlashSaleSection } from "../../../components/home/FlashSaleSection";
import { VoucherClaimSection } from "../../../components/home/VoucherClaimSection";
import { BrandShowcase } from "../../../components/home/BrandShowcase";
import { fetchProducts } from "../../../services/productService";
import { useCart } from "../../../stores/cartStore";
import { useToast } from "../../../stores/toastStore";
import type { Product } from "../../../types";
import { Laptop, Cpu, Monitor, ChevronRight } from "lucide-react";

export function HomePage() {
  const nav = useNavigate();
  const { add } = useCart();
  const toast = useToast();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProducts()
      .then((data) => {
        if (active) {
          setAllProducts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = (p: Product) => {
    add(p);
    toast.success(`Đã thêm "${p.name}" vào giỏ hàng!`);
  };

  const handleSelectBrand = (brand: string) => {
    if (brand) {
      nav(`/products?brand=${encodeURIComponent(brand)}`);
    } else {
      nav("/products");
    }
  };

  const laptops = allProducts.filter((p) => p.cat === "Laptop").slice(0, 4);
  const pcAndParts = allProducts
    .filter((p) => p.cat === "PC Gaming" || p.cat === "Linh kiện PC")
    .slice(0, 4);
  const monitorsAndPeripherals = allProducts
    .filter(
      (p) => p.cat === "Màn hình" || p.cat === "Bàn phím" || p.cat === "Chuột",
    )
    .slice(0, 4);

  return (
    <div className="w-full pb-16 space-y-10">
      {/* 1. HERO BANNERS & COMMITMENTS */}
      <HeroBanners />

      {/* 2. FLASH SALE GIỜ VÀNG (Real-time countdown, stock progress) */}
      <FlashSaleSection products={allProducts} />

      {/* 3. VOUCHER CLAIM TICKETS */}
      <VoucherClaimSection />

      {/* 4. SHOWCASE SHELF 1: LAPTOP GAMING & VĂN PHÒNG */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#c2410c]">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight">
                Laptop Mới Nhất & Bán Chạy
              </h2>
              <p className="text-xs text-stone-400">
                Laptop Gaming RTX 40 Series, MacBook, Laptop Ultrabook Mỏng Nhẹ
              </p>
            </div>
          </div>

          <Link
            to="/products?category=Laptop"
            className="flex items-center gap-1 text-xs font-bold text-[#c2410c] hover:text-[#9a3412] transition"
          >
            <span>Xem tất cả Laptop</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : laptops.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  onView={(x) => nav(`/products/${x.id}`)}
                  onAdd={handleAddToCart}
                  onQuickView={(x) => setQuickViewProduct(x)}
                />
              ))}
        </div>
      </section>

      {/* 5. SHOWCASE SHELF 2: PC GAMING & LINH KIỆN MÁY TÍNH */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight">
                PC Gaming & Linh Kiện Phần Cứng
              </h2>
              <p className="text-xs text-stone-400">
                Card màn hình VGA, CPU Intel & AMD, RAM Fury, Nguồn máy tính
              </p>
            </div>
          </div>

          <Link
            to="/products?category=Linh%20ki%E1%BB%87n%20PC"
            className="flex items-center gap-1 text-xs font-bold text-[#c2410c] hover:text-[#9a3412] transition"
          >
            <span>Xem tất cả Linh kiện</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : pcAndParts.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  onView={(x) => nav(`/products/${x.id}`)}
                  onAdd={handleAddToCart}
                  onQuickView={(x) => setQuickViewProduct(x)}
                />
              ))}
        </div>
      </section>

      {/* 6. SHOWCASE SHELF 3: MÀN HÌNH & THIẾT BỊ NGOẠI VI */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight">
                Màn Hình Đồ Họa, Gaming & Phụ Kiện
              </h2>
              <p className="text-xs text-stone-400">
                Màn hình tần số quét cao, bàn phím cơ quang học, chuột gaming
                eSports
              </p>
            </div>
          </div>

          <Link
            to="/products?category=M%C3%A0n%20h%C3%ACnh"
            className="flex items-center gap-1 text-xs font-bold text-[#c2410c] hover:text-[#9a3412] transition"
          >
            <span>Xem tất cả Màn hình & Phụ kiện</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : monitorsAndPeripherals.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  onView={(x) => nav(`/products/${x.id}`)}
                  onAdd={handleAddToCart}
                  onQuickView={(x) => setQuickViewProduct(x)}
                />
              ))}
        </div>
      </section>

      {/* 7. BRAND SHOWCASE (ASUS, Dell, MSI, Apple, Gigabyte...) */}
      <BrandShowcase onSelectBrand={handleSelectBrand} />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
export default HomePage;
