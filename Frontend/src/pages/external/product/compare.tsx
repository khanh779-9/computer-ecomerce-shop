import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCompare } from '../../../stores/compareStore';
import { useCart } from '../../../stores/cartStore';
import { useToast } from '../../../stores/toastStore';
import { Art } from '../../../components/product/Art';
import { Stars } from '../../../components/product/Stars';
import { Button } from '../../../components/ui/Button';
import { formatVnd } from '../../../lib/cart';
import {
  Scale,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronLeft,
  Plus,
} from 'lucide-react';

export function ComparePage() {
  const { items, remove, clear } = useCompare();
  const { add } = useCart();
  const toast = useToast();
  const nav = useNavigate();

  const [highlightDiff, setHighlightDiff] = useState(false);

  const handleAddToCart = (product: any) => {
    add(product);
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-[#c2410c] shadow-inner mb-4">
          <Scale className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">Chưa có sản phẩm nào để so sánh</h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Chọn biểu tượng cân hoặc nút &ldquo;So sánh&rdquo; tại các sản phẩm bạn quan tâm để đặt cạnh nhau so sánh chi tiết.
        </p>
        <div className="mt-6">
          <Button
            onClick={() => nav('/products')}
            className="bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md"
          >
            Khám phá sản phẩm ngay
          </Button>
        </div>
      </main>
    );
  }

  // Helper check if values in a row are different across items
  const isDifferent = (getter: (p: any) => any) => {
    if (items.length <= 1) return false;
    const firstVal = JSON.stringify(getter(items[0]));
    return items.some((item) => JSON.stringify(getter(item)) !== firstVal);
  };

  const specRows = [
    {
      title: 'Thương hiệu',
      render: (p: any) => <span className="font-bold text-stone-900">{p.brand}</span>,
      isDiff: isDifferent((p) => p.brand),
    },
    {
      title: 'Danh mục linh kiện',
      render: (p: any) => <span className="text-stone-700">{p.cat}</span>,
      isDiff: isDifferent((p) => p.cat),
    },
    {
      title: 'Giá bán hiện tại',
      render: (p: any) => (
        <div>
          <span className="text-sm font-black text-[#c2410c]">{formatVnd(p.price)}</span>
          {p.old > p.price && (
            <p className="text-[11px] text-stone-400 line-through">{formatVnd(p.old)}</p>
          )}
        </div>
      ),
      isDiff: isDifferent((p) => p.price),
    },
    {
      title: 'Mức giảm giá',
      render: (p: any) => {
        const discount = p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
        return discount > 0 ? (
          <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-xs">
            Tiết kiệm {discount}%
          </span>
        ) : (
          <span className="text-stone-400">Giá chuẩn</span>
        );
      },
      isDiff: isDifferent((p) => p.old > p.price),
    },
    {
      title: 'Tình trạng kho hàng',
      render: (p: any) =>
        p.stock > 0 ? (
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Còn hàng ({p.stock} sản phẩm)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-rose-500 font-medium">
            <XCircle className="w-4 h-4" />
            <span>Tạm hết hàng</span>
          </div>
        ),
      isDiff: isDifferent((p) => p.stock > 0),
    },
    {
      title: 'Đánh giá & Lượt bán',
      render: (p: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Stars value={p.rate} size={13} />
            <span className="font-bold text-stone-800">{p.rate}/5</span>
          </div>
          <span className="text-[11px] text-stone-500">Đã bán {p.sold} lượt</span>
        </div>
      ),
      isDiff: isDifferent((p) => p.rate),
    },
    {
      title: 'Mã định danh (SKU / ID)',
      render: (p: any) => <span className="font-mono text-xs text-stone-500">SKU-{p.id.toString().padStart(5, '0')}</span>,
      isDiff: isDifferent((p) => p.id),
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb / Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại danh mục sản phẩm</span>
      </Link>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-[#c2410c]">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                So Sánh Chi Tiết Sản Phẩm ({items.length}/4)
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Xem xét và đối chiếu trực quan các thông số kỹ thuật, mức giá và trạng thái của từng mẫu
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-200/70 transition">
            <input
              type="checkbox"
              checked={highlightDiff}
              onChange={(e) => setHighlightDiff(e.target.checked)}
              className="rounded text-[#c2410c] focus:ring-[#c2410c] w-3.5 h-3.5"
            />
            <Sparkles className="w-3.5 h-3.5 text-[#c2410c]" />
            <span>Nổi bật điểm khác nhau</span>
          </label>

          <button
            onClick={clear}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa hết</span>
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs">
          {/* Header Row: Products Overview */}
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/70 divide-x divide-stone-200">
              <th className="p-4 w-48 text-xs font-bold uppercase tracking-wider text-stone-400">
                Sản phẩm
              </th>
              {items.map((prod) => (
                <th key={prod.id} className="p-4 w-64 align-top">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Image & remove button */}
                    <div className="relative w-32 h-32 rounded-xl bg-white border border-stone-200 p-2 flex items-center justify-center shadow-sm">
                      <Art type={prod.art} tint={prod.tint} />
                      <button
                        onClick={() => remove(prod.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-stone-200 hover:bg-rose-500 hover:text-white text-stone-600 transition shadow-sm"
                        title="Bỏ so sánh sản phẩm này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Link
                      to={`/products/${prod.id}`}
                      className="text-xs sm:text-sm font-bold text-stone-900 hover:text-[#c2410c] line-clamp-2 leading-tight transition"
                    >
                      {prod.name}
                    </Link>

                    <Button
                      onClick={() => handleAddToCart(prod)}
                      className="w-full py-2 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Thêm vào giỏ</span>
                    </Button>
                  </div>
                </th>
              ))}
              {/* Slot placeholder if < 4 items */}
              {items.length < 4 && (
                <th className="p-4 w-48 align-middle text-center bg-stone-50/30">
                  <div className="flex flex-col items-center justify-center space-y-2 py-8 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                    <Plus className="w-6 h-6 text-stone-300" />
                    <span className="text-[11px] font-semibold">Còn {4 - items.length} vị trí trống</span>
                    <Button
                      onClick={() => nav('/products')}
                      variant="outline"
                      className="text-[11px] px-3 py-1.5 border-stone-300 text-stone-600"
                    >
                      Thêm sản phẩm
                    </Button>
                  </div>
                </th>
              )}
            </tr>
          </thead>

          {/* Body Rows: Specifications */}
          <tbody className="divide-y divide-stone-200">
            {specRows.map((row, idx) => {
              const shouldHighlight = highlightDiff && row.isDiff;
              return (
                <tr
                  key={idx}
                  className={`divide-x divide-stone-200 transition ${
                    shouldHighlight ? 'bg-orange-50/70 font-semibold text-stone-900' : 'hover:bg-stone-50/50'
                  }`}
                >
                  <td className="p-4 font-bold text-stone-700 bg-stone-50/40 w-48">
                    <div className="flex items-center gap-1.5">
                      {shouldHighlight && <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />}
                      <span>{row.title}</span>
                    </div>
                  </td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-4 align-middle">
                      {row.render(prod)}
                    </td>
                  ))}
                  {items.length < 4 && <td className="bg-stone-50/20" />}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
