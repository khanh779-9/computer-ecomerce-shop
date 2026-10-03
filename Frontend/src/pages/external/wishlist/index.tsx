import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../stores/wishlistStore';
import { useCart } from '../../../stores/cartStore';
import { useToast } from '../../../stores/toastStore';
import { Art } from '../../../components/product/Art';
import { Button } from '../../../components/ui/Button';
import { formatVnd } from '../../../lib/cart';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ChevronRight,
  ArrowRight,
  Search,
  ExternalLink,
} from 'lucide-react';
import type { Product } from '../../../types';

export function WishlistPage() {
  const { items, remove, clear, count } = useWishlist();
  const { add } = useCart();
  const toast = useToast();
  const nav = useNavigate();

  // Search & category filter inside wishlist
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  // Categories present in wishlist items
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.cat)));
    return ['ALL', ...cats];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCat === 'ALL' || item.cat === selectedCat;
      return matchSearch && matchCat;
    });
  }, [items, searchQuery, selectedCat]);

  const handleAddToCart = (p: Product) => {
    add(p, 1);
    toast.success(`Đã thêm "${p.name}" vào giỏ hàng!`);
  };

  const handleAddAllToCart = () => {
    if (filteredItems.length === 0) return;
    filteredItems.forEach((item) => add(item, 1));
    toast.success(`Đã thêm ${filteredItems.length} sản phẩm vào giỏ hàng!`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link to="/" className="hover:text-stone-900 transition">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-800">Sản phẩm yêu thích</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Danh sách sản phẩm yêu thích
            </h1>
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-rose-100 px-2 text-xs font-bold text-rose-700">
              {count}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Bảng theo dõi chi tiết cấu hình, tình trạng kho và biến động giá các thiết bị bạn đang quan tâm
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={clear}
              className="py-2 px-3 text-xs font-medium text-stone-600 hover:text-rose-600 border-stone-200 hover:border-rose-200 flex items-center gap-1.5 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ</span>
            </Button>

            <Button
              variant="solid"
              onClick={handleAddAllToCart}
              className="py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm rounded-xl"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Thêm tất cả vào giỏ ({filteredItems.length})</span>
            </Button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-stone-200 bg-white py-16 px-6 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-stone-900">
            Chưa có sản phẩm yêu thích nào trong danh sách
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Bấm vào biểu tượng trái tim ở từng sản phẩm hoặc tại trang chi tiết để lưu và theo dõi giá tại đây.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => nav('/products')}
              className="bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-2"
            >
              <span>Khám phá sản phẩm ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* Wishlist Content with Simplified Table */
        <div className="space-y-4">
          {/* Controls: Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh theo tên sản phẩm, mã SKU..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCat === c
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c === 'ALL' ? 'Tất cả danh mục' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    <th className="py-3.5 pl-4 pr-3">Sản phẩm</th>
                    <th className="py-3.5 px-3">Danh mục</th>
                    <th className="py-3.5 px-3">Đơn giá & Tiết kiệm</th>
                    <th className="py-3.5 px-3">Tình trạng kho</th>
                    <th className="py-3.5 pl-3 pr-4 text-right">Thao tác</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-stone-400">
                        Không tìm thấy sản phẩm nào khớp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((p) => {
                      const discountPercent =
                        p.old > p.price
                          ? Math.round(((p.old - p.price) / p.old) * 100)
                          : 0;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-orange-50/20 transition-colors group"
                        >
                          {/* Col 1: Product: Name (top), SKU (bottom), no brand badge */}
                          <td className="py-3.5 pl-4 pr-3">
                            <div className="flex items-center gap-3">
                              {/* Artwork Thumbnail */}
                              <div
                                onClick={() => nav(`/products/${p.id}`)}
                                className="h-14 w-14 shrink-0 rounded-xl bg-stone-50 p-2 border border-stone-200/80 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform"
                              >
                                <Art type={p.art} tint={p.tint} />
                              </div>

                              {/* Name (top) & SKU (bottom) */}
                              <div className="space-y-0.5">
                                <Link
                                  to={`/products/${p.id}`}
                                  className="font-bold text-xs sm:text-[13px] text-stone-900 hover:text-[#c2410c] transition-colors line-clamp-2 leading-snug block max-w-md"
                                  title={p.name}
                                >
                                  {p.name}
                                </Link>

                                <span className="font-mono text-[11px] text-stone-400 block">
                                  SKU: {p.sku}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Category */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="font-medium text-stone-700 bg-stone-100 px-2 py-1 rounded-md text-[11px]">
                              {p.cat}
                            </span>
                          </td>

                          {/* Col 3: Pricing & Savings */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="text-sm font-black text-[#dc2626]">
                                {formatVnd(p.price)}
                              </span>
                              {p.old > p.price && (
                                <div className="flex items-center gap-1.5 text-[11px]">
                                  <span className="text-stone-400 line-through">
                                    {formatVnd(p.old)}
                                  </span>
                                  <span className="text-[10px] font-bold text-white bg-[#dc2626] px-1 rounded">
                                    -{discountPercent}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Col 4: Stock Status - Text only, NO icon */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {p.stock > 0 ? (
                              <span className="font-medium text-emerald-700 text-xs">
                                Còn hàng ({p.stock})
                              </span>
                            ) : (
                              <span className="font-medium text-rose-600 text-xs">
                                Hết hàng
                              </span>
                            )}
                          </td>

                          {/* Col 5: Actions */}
                          <td className="py-3.5 pl-3 pr-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                onClick={() => handleAddToCart(p)}
                                className="py-1.5 px-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
                                title="Thêm sản phẩm này vào giỏ hàng"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Thêm giỏ</span>
                              </Button>

                              <button
                                onClick={() => nav(`/products/${p.id}`)}
                                className="p-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 bg-white transition"
                                title="Xem chi tiết sản phẩm"
                                aria-label="Xem chi tiết"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => remove(p.id)}
                                className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 bg-white transition"
                                title="Gỡ khỏi danh sách yêu thích"
                                aria-label="Gỡ khỏi danh sách yêu thích"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50/60 px-4 py-2.5 text-xs text-stone-500">
              <span>
                Hiển thị <strong>{filteredItems.length}</strong> / <strong>{items.length}</strong> sản phẩm yêu thích
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
