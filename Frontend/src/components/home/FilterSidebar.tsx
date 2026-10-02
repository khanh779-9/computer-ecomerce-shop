import { SlidersHorizontal, RotateCcw, Check, Star } from 'lucide-react';

export interface FilterState {
  priceRange: string;
  brands: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
  minRating: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableBrands: string[];
  totalResults: number;
}

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-2m', label: 'Dưới 2.000.000đ' },
  { id: '2m-10m', label: '2.000.000đ - 10.000.000đ' },
  { id: '10m-25m', label: '10.000.000đ - 25.000.000đ' },
  { id: 'over-25m', label: 'Trên 25.000.000đ' },
];

export function FilterSidebar({
  filters,
  onChange,
  availableBrands,
  totalResults,
}: FilterSidebarProps) {
  const handlePriceChange = (rangeId: string) => {
    onChange({ ...filters, priceRange: rangeId });
  };

  const handleBrandToggle = (brand: string) => {
    const exists = filters.brands.includes(brand);
    const newBrands = exists
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ ...filters, brands: newBrands });
  };

  const handleReset = () => {
    onChange({
      priceRange: 'all',
      brands: [],
      inStockOnly: false,
      onSaleOnly: false,
      minRating: 0,
    });
  };

  const hasActiveFilters =
    filters.priceRange !== 'all' ||
    filters.brands.length > 0 ||
    filters.inStockOnly ||
    filters.onSaleOnly ||
    filters.minRating > 0;

  return (
    <aside className="w-full bg-white rounded-xl border border-stone-200 p-4 space-y-5 shadow-sm text-xs text-stone-700">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-[#c2410c]" />
          <span>Bộ lọc tìm kiếm</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-[#c2410c] hover:underline font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>

      {/* 1. Mức giá */}
      <div className="space-y-2">
        <p className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[11px]">
          Khoảng giá
        </p>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((pr) => (
            <label
              key={pr.id}
              className="flex items-center gap-2 cursor-pointer hover:text-stone-900 select-none py-0.5"
            >
              <input
                type="radio"
                name="priceRange"
                checked={filters.priceRange === pr.id}
                onChange={() => handlePriceChange(pr.id)}
                className="accent-[#c2410c] h-3.5 w-3.5"
              />
              <span className={filters.priceRange === pr.id ? 'font-semibold text-[#c2410c]' : ''}>
                {pr.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Thương hiệu */}
      {availableBrands.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-stone-100">
          <p className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[11px]">
            Thương hiệu
          </p>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {availableBrands.map((brand) => {
              const checked = filters.brands.includes(brand);
              return (
                <label
                  key={brand}
                  className="flex items-center justify-between cursor-pointer hover:text-stone-900 select-none py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleBrandToggle(brand)}
                      className="accent-[#c2410c] h-3.5 w-3.5 rounded"
                    />
                    <span className={checked ? 'font-semibold text-stone-900' : ''}>{brand}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Tình trạng */}
      <div className="space-y-2 pt-3 border-t border-stone-100">
        <p className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[11px]">
          Tình trạng
        </p>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.onSaleOnly}
              onChange={(e) => onChange({ ...filters, onSaleOnly: e.target.checked })}
              className="accent-[#c2410c] h-3.5 w-3.5 rounded"
            />
            <span>Đang có giảm giá</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
              className="accent-[#c2410c] h-3.5 w-3.5 rounded"
            />
            <span>Còn hàng trong kho</span>
          </label>
        </div>
      </div>

      {/* 4. Đánh giá */}
      <div className="space-y-2 pt-3 border-t border-stone-100">
        <p className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[11px]">
          Đánh giá
        </p>
        <div className="space-y-1">
          {[4, 4.5].map((star) => (
            <label
              key={star}
              className="flex items-center gap-2 cursor-pointer select-none py-0.5"
            >
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === star}
                onChange={() => onChange({ ...filters, minRating: filters.minRating === star ? 0 : star })}
                className="accent-[#c2410c] h-3.5 w-3.5"
              />
              <span className="flex items-center gap-1 text-stone-600">
                <span>Từ {star}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                <span>trở lên</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter summary badge */}
      <div className="pt-2 text-[11px] text-stone-400 text-center border-t border-stone-100">
        Tìm thấy <strong>{totalResults}</strong> sản phẩm phù hợp
      </div>
    </aside>
  );
}
