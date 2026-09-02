import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProductCard } from "../../components/product/ProductCard";
import { ProductCardSkeleton } from "../../components/product/ProductCardSkeleton";
import { QuickViewModal } from "../../components/product/QuickViewModal";
import { HeroBanners } from "../../components/home/HeroBanners";
import {
  FilterSidebar,
  type FilterState,
} from "../../components/home/FilterSidebar";
import { useCart } from "../../stores/cartStore";
import { useToast } from "../../stores/toastStore";
import { fetchProducts } from "../../services/productService";
import type { Product } from "../../types";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const { add, searchQuery, setSearchQuery } = useCart();
  const toast = useToast();

  const [sort, setSort] = useState("default");
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Faceted filter state
  const [filters, setFilters] = useState<FilterState>({
    priceRange: "all",
    brands: [],
    inStockOnly: false,
    onSaleOnly: false,
    minRating: 0,
  });

  const cat = params.get("category") || "Tất cả";
  const urlSearch = params.get("search");

  // Synchronize url search with cartStore search if provided
  useEffect(() => {
    if (urlSearch !== null && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch, searchQuery, setSearchQuery]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProducts(searchQuery, cat)
      .then((data) => {
        if (active) {
          setRawProducts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [searchQuery, cat]);

  // Extract unique brands from raw products for filter sidebar
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    rawProducts.forEach((p) => {
      if (p.brand && p.brand.trim()) brandSet.add(p.brand.trim());
    });
    return Array.from(brandSet).sort();
  }, [rawProducts]);

  // Apply faceted filters & sorting
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];

    // Filter by Price range
    if (filters.priceRange === "under-2m") {
      result = result.filter((p) => p.price < 2000000);
    } else if (filters.priceRange === "2m-10m") {
      result = result.filter((p) => p.price >= 2000000 && p.price <= 10000000);
    } else if (filters.priceRange === "10m-25m") {
      result = result.filter((p) => p.price > 10000000 && p.price <= 25000000);
    } else if (filters.priceRange === "over-25m") {
      result = result.filter((p) => p.price > 25000000);
    }

    // Filter by Brands
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }

    // Filter by inStock
    if (filters.inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Filter by onSale
    if (filters.onSaleOnly) {
      result = result.filter((p) => p.old > p.price);
    }

    // Filter by minRating
    if (filters.minRating > 0) {
      result = result.filter((p) => p.rate >= filters.minRating);
    }

    // Sorting
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "sold") result.sort((a, b) => b.sold - a.sold);
    if (sort === "rate") result.sort((a, b) => b.rate - a.rate);

    return result;
  }, [rawProducts, filters, sort]);

  const handleAddToCart = (p: Product) => {
    add(p);
    toast.success(`Đã thêm "${p.name}" vào giỏ hàng!`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const newParams = new URLSearchParams(params);
    newParams.delete("search");
    setParams(newParams);
  };

  return (
    <div className="w-full pb-12">
      {/* 1. HERO BANNER CAROUSEL & FLASH SALE */}
      {!searchQuery && cat === "Tất cả" && <HeroBanners />}

      {/* 2. PRODUCT SECTION WITH SIDEBAR */}
      <section className="mt-8">
        {/* Section title & controls */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 uppercase tracking-tight">
                {cat === "Tất cả" ? "Tất cả sản phẩm" : cat}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {filteredProducts.length} sản phẩm
              </span>
            </div>

            {searchQuery && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                <span>Kết quả tìm kiếm cho:</span>
                <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded flex items-center gap-1">
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={handleClearSearch}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile Filter toggle button */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>Bộ lọc</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs">
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
                <option value="rate">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar + Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              availableBrands={availableBrands}
              totalResults={filteredProducts.length}
            />
          </div>

          {/* Sidebar Drawer on Mobile */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full p-4 overflow-y-auto overscroll-contain z-10 animate-in slide-in-from-right">
                <div className="flex justify-between items-center pb-3 border-b mb-3">
                  <span className="font-bold text-sm text-stone-800">
                    Bộ lọc sản phẩm
                  </span>
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  onChange={(f) => {
                    setFilters(f);
                  }}
                  availableBrands={availableBrands}
                  totalResults={filteredProducts.length}
                />
              </div>
            </div>
          )}

          {/* Main Product Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white py-16 px-4 text-center">
                <p className="text-base font-semibold text-stone-700">
                  Không tìm thấy sản phẩm nào phù hợp
                </p>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  Hãy thử điều chỉnh lại bộ lọc giá, thương hiệu hoặc tìm kiếm
                  bằng từ khóa khác.
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      priceRange: "all",
                      brands: [],
                      inStockOnly: false,
                      onSaleOnly: false,
                      minRating: 0,
                    });
                    setSearchQuery("");
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-1.5">
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
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
