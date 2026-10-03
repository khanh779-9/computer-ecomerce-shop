import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Art } from "../../../components/product/Art";
import { Stars } from "../../../components/product/Stars";
import { ProductCard } from "../../../components/product/ProductCard";
import { Button } from "../../../components/ui/Button";
import { formatVnd } from "../../../lib/cart";
import { useCart } from "../../../stores/cartStore";
import { useToast } from "../../../stores/toastStore";
import { useCompare } from "../../../stores/compareStore";
import { useWishlist } from "../../../stores/wishlistStore";
import {
  fetchProductById,
  fetchProducts,
} from "../../../services/productService";
import { ProductReviewSection } from "../../../components/product/ProductReviewSection";
import type { Product } from "../../../types";
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  CreditCard,
  ChevronRight,
  ShoppingCart,
  CheckCircle2,
  Scale,
  Heart,
} from "lucide-react";

export function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const toast = useToast();
  const { toggle, has } = useCompare();
  const { toggle: toggleWishlist, has: hasWishlist } = useWishlist();

  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchProductById(Number(id))
      .then((p) => {
        if (active && p) {
          setProduct(p);
          setLoading(false);
          // Fetch related products in the same category
          fetchProducts("", p.cat)
            .then((list) => {
              if (active) {
                setRelatedProducts(
                  list.filter((x) => x.id !== p.id).slice(0, 4),
                );
              }
            })
            .catch(() => {});
        } else if (active) {
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-12 text-center text-sm text-stone-500 animate-pulse">
        <div className="mx-auto h-12 w-12 rounded-full bg-stone-200 mb-4" />
        <p className="font-medium text-stone-700">
          Đang tải thông tin chi tiết sản phẩm...
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-6xl p-12 text-center">
        <p className="text-base font-semibold text-stone-700">
          Không tìm thấy sản phẩm
        </p>
        <p className="text-xs text-stone-400 mt-1">
          Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.
        </p>
        <Button
          className="mt-5 bg-[#c2410c] text-white"
          onClick={() => nav("/products")}
        >
          Quay lại danh mục sản phẩm
        </Button>
      </main>
    );
  }

  const p = product;
  const discountPercent =
    p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0;

  const handleAddToCart = () => {
    add(p, qty);
    toast.success(`Đã thêm ${qty} "${p.name}" vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    add(p, qty);
    nav("/checkout");
  };

  const imageAngles = [
    { label: "Góc chính diện", tint: p.tint },
    { label: "Góc nghiêng", tint: "#94a3b8" },
    { label: "Cổng kết nối", tint: "#64748b" },
  ];

  return (
    <div className="w-full pb-20">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-5 overflow-x-auto no-scrollbar py-1">
        <Link to="/" className="hover:text-stone-900 transition">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <Link to="/products" className="hover:text-stone-900 transition">
          Sản phẩm
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <Link
          to={`/products?category=${encodeURIComponent(p.cat)}`}
          className="hover:text-stone-900 transition"
        >
          {p.cat}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span className="text-stone-800 font-semibold truncate max-w-md">
          {p.name}
        </span>
      </nav>

      {/* 2. Main Product Info Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative rounded-2xl border border-stone-200 bg-white p-8 shadow-sm flex items-center justify-center overflow-hidden">
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-[#c2410c] text-white text-xs font-bold px-2 py-0.5 rounded shadow">
                Giảm {discountPercent}%
              </span>
            )}
            <div className="aspect-square w-full max-w-[340px]">
              <Art type={p.art} src={p.imageUrl} alt={p.name} />
            </div>
          </div>

          {/* Thumbnail list */}
          <div className="flex gap-2 justify-center">
            {imageAngles.map((_img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-16 rounded-xl border p-1 bg-white transition ${
                  activeImageIndex === idx
                    ? "border-[#c2410c] ring-2 ring-[#c2410c]/20 shadow-sm"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Art type={p.art} src={p.imageUrl} alt={p.name} />
                </div>
              </button>
            ))}
          </div>

          {/* Trust commitments */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 space-y-2.5 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bảo hành chính hãng 12-24 tháng toàn quốc</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Hỗ trợ 1 đổi 1 trong vòng 30 ngày nếu phát sinh lỗi phần cứng
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#c2410c] shrink-0" />
              <span>
                Giao hàng hỏa tốc trong 2 giờ tại nội thành Hà Nội & TP.HCM
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Thanh toán linh hoạt: Chuyển khoản, Thẻ ATM/Visa, Ship COD
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Purchase Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c2410c] bg-orange-50 px-2 py-0.5 rounded">
                {p.brand}
              </span>
              <span className="text-xs text-stone-400">
                Mã SKU:{" "}
                <strong className="font-mono text-stone-700">{p.sku}</strong>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Còn hàng ({p.stock} sản
                phẩm)
              </span>
            </div>

            <h1 className="mt-2 text-xl sm:text-2xl font-black text-stone-900 leading-snug">
              {p.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-stone-500 pb-3 border-b border-stone-200">
              <a
                href="#product-reviews-section"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("product-reviews-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 hover:text-[#c2410c] transition cursor-pointer"
              >
                <Stars value={p.rate} size={14} />
                <span className="font-bold text-stone-800">{p.rate}</span>
                <span className="underline decoration-stone-300 underline-offset-2">
                  ({p.reviews} đánh giá thực tế)
                </span>
              </a>
              <span>·</span>
              <span>
                Đã bán <strong>{p.sold}</strong> sản phẩm
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/70 to-stone-50 p-5 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-[#c2410c]">
                {formatVnd(p.price)}
              </span>
              {p.old > p.price && (
                <>
                  <span className="text-sm text-stone-400 line-through">
                    {formatVnd(p.old)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Tiết kiệm {formatVnd(p.old - p.price)}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-stone-500">
              ✓ Giá đã bao gồm thuế VAT 10% · Miễn phí công lắp đặt và cài đặt
              phần mềm cơ bản.
            </p>

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-sm">
                <button
                  className="px-3.5 py-2.5 text-stone-600 hover:bg-stone-100 font-bold transition rounded-l-xl"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Giảm số lượng"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-sm text-stone-800">
                  {qty}
                </span>
                <button
                  className="px-3.5 py-2.5 text-stone-600 hover:bg-stone-100 font-bold transition rounded-r-xl"
                  onClick={() => setQty(Math.min(p.stock, qty + 1))}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>

              <Button
                variant="orange-outline"
                onClick={handleAddToCart}
                className="flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm vào giỏ</span>
              </Button>

              <Button
                variant="solid"
                onClick={handleBuyNow}
                className="flex-1 py-3 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all rounded-xl"
              >
                Mua ngay
              </Button>
            </div>

            {/* Compare & Wishlist buttons */}
            <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => toggle(p)}
                className={`w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition ${
                  has(p.id)
                    ? "border-[#c2410c] text-[#c2410c] bg-orange-50/70 hover:bg-orange-100/50"
                    : "border-stone-300 text-stone-700 hover:border-orange-300 hover:text-[#c2410c]"
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>
                  {has(p.id) ? "✓ Đã trong so sánh" : "So sánh cấu hình"}
                </span>
              </Button>

              <Button
                variant="outline"
                onClick={() => toggleWishlist(p)}
                className={`w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition ${
                  hasWishlist(p.id)
                    ? "border-rose-300 text-rose-600 bg-rose-50/70 hover:bg-rose-100/50"
                    : "border-stone-300 text-stone-700 hover:border-rose-300 hover:text-rose-600"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${hasWishlist(p.id) ? "fill-rose-500 text-rose-500" : "text-stone-500"}`}
                />
                <span>
                  {hasWishlist(p.id)
                    ? "✓ Đã lưu yêu thích"
                    : "Lưu vào yêu thích"}
                </span>
              </Button>
            </div>
          </div>

          {/* Technical Specifications Table */}
          <section className="pt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b-2 border-stone-800 pb-2">
              Thông số kỹ thuật chính hãng
            </h2>
            <div className="mt-3 border rounded-xl overflow-hidden bg-white text-xs sm:text-[13px] shadow-sm">
              <table className="w-full divide-y divide-stone-100">
                <tbody className="divide-y divide-stone-100">
                  {[
                    ["Thương hiệu", p.brand],
                    ["Danh mục", p.cat],
                    ["Mã sản phẩm (SKU)", p.sku],
                    [
                      "Bảo hành tiêu chuẩn",
                      "24 tháng chính hãng (1 đổi 1 trong 30 ngày)",
                    ],
                    [
                      "Xuất xứ hàng hóa",
                      "Phân phối chính ngạch tại Việt Nam (Full VAT)",
                    ],
                    [
                      "Tình trạng sản phẩm",
                      "Mới 100%, Nguyên seal hộp từ nhà sản xuất",
                    ],
                    [
                      "Bộ sản phẩm gồm",
                      "Máy tính/Thiết bị, Cáp nguồn sạc, Sách HDSD, Phiếu bảo hành",
                    ],
                  ].map(([k, v], idx) => (
                    <tr
                      key={k}
                      className={idx % 2 === 0 ? "bg-stone-50/50" : "bg-white"}
                    >
                      <td className="w-32 sm:w-44 p-2.5 sm:p-3 font-semibold text-stone-600 border-r border-stone-100">
                        {k}
                      </td>
                      <td className="p-2.5 sm:p-3 text-stone-800">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <ProductReviewSection
        productId={p.id}
        productName={p.name}
        productBrand={p.brand}
        initialRating={p.rate}
        initialReviewCount={p.reviews}
        onReviewAdded={(newAvg, newCount) => {
          setProduct((prev) =>
            prev ? { ...prev, rate: newAvg, reviews: newCount } : null,
          );
        }}
      />

      {/* 3. Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 uppercase tracking-tight">
                Sản phẩm cùng phân khúc ({p.cat})
              </h2>
            </div>
            <Link
              to={`/products?category=${encodeURIComponent(p.cat)}`}
              className="text-xs font-semibold text-[#c2410c] hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-3">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                p={rel}
                onView={(x) => nav(`/products/${x.id}`)}
                onAdd={(x) => {
                  add(x);
                  toast.success(`Đã thêm "${x.name}" vào giỏ hàng!`);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Sticky Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-xl flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-stone-500 block leading-tight">
            Tổng thanh toán:
          </span>
          <span className="text-base font-black text-[#c2410c]">
            {formatVnd(p.price * qty)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleAddToCart}
            className="px-3 sm:px-3.5 py-2 rounded-xl border border-[#c2410c] text-[#c2410c] text-xs font-bold hover:bg-orange-50 whitespace-nowrap"
          >
            Thêm giỏ
          </button>
          <button
            onClick={handleBuyNow}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#c2410c] text-white text-xs font-bold hover:bg-[#9a3412] whitespace-nowrap"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProductDetailPage;
