import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ProductCard } from "../../../components/product/ProductCard";
import { ProductCardSkeleton } from "../../../components/product/ProductCardSkeleton";
import { QuickViewModal } from "../../../components/product/QuickViewModal";
import { FilterSidebar, type FilterState } from "../../../components/home/FilterSidebar";
import { fetchProducts } from "../../../services/productService";
import { useCart } from "../../../stores/cartStore";
import { useToast } from "../../../stores/toastStore";
import type { Product } from "../../../types";
import { CATS } from "../../../data/products";
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  ChevronRight,
  Package,
  RotateCcw,
} from "lucide-react";

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const { add } = useCart();
  const toast = useToast();

  const searchQuery = params.get("search") || "";
  const currentCategory = params.get("category") || "Tất cả";
  const urlBrand = params.get("brand") || "";
  const urlSort = params.get("sort") || "default";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    priceRange: params.get("priceRange") || "all",
    brands: urlBrand ? [urlBrand] : [],
    inStockOnly: params.get("inStock") === "true",
    onSaleOnly: params.get("onSale") === "true",
    minRating: Number(params.get("rating") || 0),
  });

  const [sort, setSort] = useState(urlSort);

  useEffect(() => {
    const brand = params.get("brand");
    setFilters((prev) => ({
      ...prev,
      brands: brand ? [brand] : [],
      priceRange: params.get("priceRange") || "all",
    }));
  }, [params]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProducts(searchQuery, currentCategory)
      .then((data) => {
        if (active) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [searchQuery, currentCategory]);

  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) brandSet.add(p.brand.trim());
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.priceRange === "under-2m") {
      result = result.filter((p) => p.price < 2000000);
    } else if (filters.priceRange === "2m-10m") {
      result = result.filter((p) => p.price >= 2000000 && p.price <= 10000000);
    } else if (filters.priceRange === "10m-25m") {
      result = result.filter((p) => p.price > 10000000 && p.price <= 25000000);
    } else if (filters.priceRange === "over-25m") {
      result = result.filter((p) => p.price > 25000000);
    }

    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }

    if (filters.inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (filters.onSaleOnly) {
      result = result.filter((p) => p.old > p.price);
    }

    if (filters.minRating > 0) {
      result = result.filter((p) => p.rate >= filters.minRating);
    }

    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "sold") result.sort((a, b) => b.sold - a.sold);
    if (sort === "rate") result.sort((a, b) => b.rate - a.rate);

    return result;
  }, [products, filters, sort]);

  const handleAddToCart = (p: Product) => {
    add(p);
    toast.success(`Đã thêm "${p.name}" vào giỏ hàng!`);
  };

  const handleSelectCategory = (cat: string) => {
    const newParams = new URLSearchParams(params);
    if (cat === "Tất cả") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setParams(newParams);
  };

  const handleClearAllFilters = () => {
    setFilters({
      priceRange: "all",
      brands: [],
      inStockOnly: false,
      onSaleOnly: false,
      minRating: 0,
    });
    const newParams = new URLSearchParams(params);
    newParams.delete("brand");
    newParams.delete("priceRange");
    newParams.delete("inStock");
    newParams.delete("onSale");
    setParams(newParams);
  };

  const hasActiveFilters =
    filters.priceRange !== "all" ||
    filters.brands.length > 0 ||
    filters.inStockOnly ||
    filters.onSaleOnly ||
    filters.minRating > 0;

  return (
    <div className="w-full pb-16">
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-4 overflow-x-auto no-scrollbar py-1">
        <Link to="/" className="hover:text-stone-900 transition">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <Link to="/products" className="hover:text-stone-900 transition">Sản phẩm</Link>
        {currentCategory !== "Tất cả" && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-stone-800 font-bold">{currentCategory}</span>
          </>
        )}
        {searchQuery && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-[#c2410c] font-bold">Tìm kiếm: &quot;{searchQuery}&quot;</span>
          </>
        )}
      </nav>

      {/* 2. CATEGORY QUICK TABS */}
      <div className="mb-5 flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
        {CATS.map((c) => {
          const isActive = (c === "Tất cả" && (!currentCategory || currentCategory === "Tất cả")) || currentCategory === c;
          return (
            <button
              key={c}
              onClick={() => handleSelectCategory(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-[#c2410c] text-white shadow-2xs font-bold"
                  : "bg-white border border-stone-200 text-stone-700 hover:border-orange-300 hover:text-[#c2410c]"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* 3. TITLE & CONTROLS HEADER */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-stone-900 uppercase tracking-tight">
              {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : currentCategory === "Tất cả" ? "Tất cả sản phẩm" : currentCategory}
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#c2410c]">
              {filteredProducts.length} sản phẩm
            </span>
          </div>
          {searchQuery && (
            <p className="text-xs text-stone-500 mt-0.5">Tìm thấy {filteredProducts.length} thiết bị phù hợp</p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            {[
              { label: "Tất cả giá", val: "all" },
              { label: "Dưới 10tr", val: "2m-10m" },
              { label: "10tr - 25tr", val: "10m-25m" },
              { label: "Trên 25tr", val: "over-25m" },
            ].map((chip) => (
              <button
                key={chip.val}
                onClick={() => setFilters((prev) => ({ ...prev, priceRange: chip.val }))}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filters.priceRange === chip.val
                    ? "bg-[#c2410c] text-white font-bold"
                    : "bg-white border border-stone-200 text-stone-600 hover:border-orange-300 hover:text-[#c2410c]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#c2410c]" />
            <span>Bộ lọc</span>
          </button>

          <div className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs font-medium text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="default">Sắp xếp: Nổi bật</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
              <option value="sold">Bán chạy nhất</option>
              <option value="rate">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips strip */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-stone-400 text-[11px] mr-1">Đang lọc:</span>

          {filters.brands.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c2410c] font-bold text-[11px]"
            >
              <span>{b}</span>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    brands: prev.brands.filter((x) => x !== b),
                  }))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.priceRange !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c2410c] font-bold text-[11px]">
              <span>Khoảng giá</span>
              <button onClick={() => setFilters((prev) => ({ ...prev, priceRange: "all" }))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              <span>Còn hàng</span>
              <button onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: false }))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.onSaleOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
              <span>Khuyến mãi</span>
              <button onClick={() => setFilters((prev) => ({ ...prev, onSaleOnly: false }))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleClearAllFilters}
            className="text-[11px] text-stone-500 hover:text-[#c2410c] underline ml-2"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* 4. MAIN LAYOUT: SIDEBAR + PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            availableBrands={availableBrands}
            totalResults={filteredProducts.length}
          />
        </div>

        {showMobileFilter && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
              onClick={() => setShowMobileFilter(false)}
            />
            <div className="relative ml-auto w-full max-w-xs bg-white h-full p-4 overflow-y-auto overscroll-contain z-10 animate-in slide-in-from-right">
              <div className="flex justify-between items-center pb-3 border-b mb-3">
                <span className="font-bold text-sm text-stone-800">Bộ lọc sản phẩm</span>
                <button onClick={() => setShowMobileFilter(false)} className="p-1 rounded-full text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                availableBrands={availableBrands}
                totalResults={filteredProducts.length}
              />
            </div>
          </div>
        )}

        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-stone-800">Không tìm thấy sản phẩm nào</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Không có sản phẩm nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-[#c2410c] text-white text-xs font-bold transition hover:bg-[#9a3412] shadow-sm inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  onView={(x) => nav(`/products/${x.id}`)}
                  onAdd={handleAddToCart}
                  onQuickView={(x) => setQuickViewProduct(x)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
export default ProductsPage;
