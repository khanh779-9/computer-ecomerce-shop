import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../stores/cartStore";
import { fetchProducts, fetchTrendingSearches } from "../../services/productService";
import type { Product } from "../../types";
import { Art } from "../product/Art";
import { formatVnd } from "../../lib/cart";
import { Search, X, TrendingUp, ArrowRight, Loader2 } from "lucide-react";

const HOT_KEYWORDS = [
  "Laptop Gaming",
  "RTX 4060",
  "Bàn phím cơ",
  "Màn hình 2K",
  "Logitech G304",
  "Tai nghe chụp tai",
];

export function SmartSearch() {
  const { searchQuery, setSearchQuery } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>(HOT_KEYWORDS);
  const containerRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  // Load trending keywords from Redis
  useEffect(() => {
    fetchTrendingSearches()
      .then((keywords) => {
        if (keywords && keywords.length > 0) {
          setTrendingKeywords(keywords);
        }
      })
      .catch(() => {});
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetchProducts(searchQuery.trim())
        .then((items) => {
          setSuggestions(items.slice(0, 5));
        })
        .catch(() => {
          setSuggestions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (p: Product) => {
    setIsOpen(false);
    nav(`/products/${p.id}`);
  };

  const handleSearchSubmit = (keyword?: string) => {
    const query = keyword !== undefined ? keyword : searchQuery;
    setSearchQuery(query);
    setIsOpen(false);
    nav(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl mx-1 sm:mx-4 lg:mx-6">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit();
            }
          }}
          placeholder="Tìm laptop, PC, linh kiện..."
          className="w-full rounded-full border border-stone-300 bg-stone-50/80 py-2 pl-9 sm:pl-10 pr-9 text-xs sm:text-sm text-stone-800 placeholder-stone-400 transition focus:border-[#c2410c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 shadow-sm"
        />
        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery("");
              setSuggestions([]);
            }}
            className="absolute right-3 p-1 text-stone-400 hover:text-stone-600 rounded-full"
            title="Xóa"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : loading ? (
          <Loader2 className="absolute right-3 w-4 h-4 text-stone-400 animate-spin pointer-events-none" />
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {searchQuery.trim().length >= 2 ? (
            <div>
              <div className="px-4 py-2 bg-stone-50 border-b flex justify-between items-center text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                <span>Gợi ý sản phẩm phù hợp</span>
                {loading && (
                  <span className="text-[#c2410c] normal-case">
                    Đang tìm...
                  </span>
                )}
              </div>

              {suggestions.length === 0 && !loading ? (
                <div className="p-4 text-center text-xs text-stone-500">
                  Không tìm thấy sản phẩm nào khớp với &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                  {suggestions.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="px-4 py-2.5 flex items-center gap-3 hover:bg-stone-50 cursor-pointer transition"
                    >
                      <div className="w-11 h-11 rounded border bg-stone-50 p-1 shrink-0 flex items-center justify-center">
                        <Art type={p.art} tint={p.tint} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {p.brand} · {p.cat}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-[#c2410c]">
                          {formatVnd(p.price)}
                        </p>
                        {p.old > p.price && (
                          <p className="text-[10px] text-stone-400 line-through">
                            {formatVnd(p.old)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={() => handleSearchSubmit()}
                className="border-t bg-stone-50 px-4 py-2.5 text-xs text-stone-700 hover:text-[#c2410c] flex items-center justify-between cursor-pointer font-medium hover:bg-stone-100 transition"
              >
                <span>Xem tất cả kết quả cho &quot;{searchQuery}&quot;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 mb-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>Từ khóa tìm kiếm phổ biến</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trendingKeywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleSearchSubmit(kw)}
                    className="px-2.5 py-1 rounded-full text-xs bg-stone-100 text-stone-700 hover:bg-[#c2410c]/10 hover:text-[#c2410c] transition border border-stone-200"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
