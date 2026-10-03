import { useEffect, useState } from 'react';
import { fetchProducts } from '../../services/productService';
import { fetchOrders, updateOrderStatus, type OrderResponse } from '../../services/orderService';
import { formatVnd } from '../../lib/cart';
import type { Product } from '../../types';
import { Printer, Ticket, CheckCircle2, XCircle, Tag, Plus, X } from 'lucide-react';
import { InvoiceModal } from '../../components/admin/InvoiceModal';

interface VoucherItem {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minSpend: number;
  usedCount: number;
  maxUsage: number;
  expiryDate: string;
  active: boolean;
}

export function InternalTablePage({ title }: { title: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice modal state
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<OrderResponse | null>(null);

  // Vouchers state
  const [vouchers, setVouchers] = useState<VoucherItem[]>([
    {
      id: 'v_1',
      code: 'TECHZONE50',
      title: 'Giảm 50.000đ đơn linh kiện',
      discountType: 'FIXED',
      discountValue: 50000,
      minSpend: 1000000,
      usedCount: 42,
      maxUsage: 100,
      expiryDate: '2026-12-31',
      active: true,
    },
    {
      id: 'v_2',
      code: 'FREESHIP',
      title: 'Miễn phí vận chuyển toàn quốc',
      discountType: 'FIXED',
      discountValue: 40000,
      minSpend: 500000,
      usedCount: 156,
      maxUsage: 500,
      expiryDate: '2026-12-31',
      active: true,
    },
    {
      id: 'v_3',
      code: 'GAMINGVIP',
      title: 'Giảm 5% đơn PC Gaming & Laptop',
      discountType: 'PERCENT',
      discountValue: 5,
      minSpend: 15000000,
      usedCount: 18,
      maxUsage: 50,
      expiryDate: '2026-11-30',
      active: true,
    },
  ]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: '',
    title: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
    discountValue: 10,
    minSpend: 2000000,
    maxUsage: 100,
    expiryDate: '2026-12-31',
  });

  // Form thêm sản phẩm mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    brand: 'Asus',
    category: 'Laptop',
    price: 15000000,
    stock: 10,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (title === 'Products') {
        const data = await fetchProducts();
        setProducts(data);
      } else if (title === 'Orders') {
        const data = await fetchOrders();
        setOrders(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [title]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      // optimistic update fallback
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const art = newProd.category === 'PC Gaming' ? 'pc' : newProd.category === 'Linh kiện PC' ? 'component' : 'laptop';
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: 'TZ-' + Math.floor(Math.random() * 9000 + 1000),
          name: newProd.name,
          brand: newProd.brand,
          category: newProd.category,
          price: Number(newProd.price),
          stock: Number(newProd.stock),
          art,
          tint: '#c7d2fe',
        }),
      });
      if (res.ok) {
        await loadData();
        setShowAddModal(false);
        setNewProd({ name: '', brand: 'Asus', category: 'Laptop', price: 15000000, stock: 10 });
      } else {
        alert('Không thể tạo sản phẩm trên hệ thống');
      }
    } catch {
      alert('Lỗi kết nối tới Backend');
    }
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucher.code.trim()) return;

    const v: VoucherItem = {
      id: `v_${Date.now()}`,
      code: newVoucher.code.toUpperCase().trim(),
      title: newVoucher.title.trim(),
      discountType: newVoucher.discountType,
      discountValue: Number(newVoucher.discountValue),
      minSpend: Number(newVoucher.minSpend),
      usedCount: 0,
      maxUsage: Number(newVoucher.maxUsage),
      expiryDate: newVoucher.expiryDate,
      active: true,
    };

    setVouchers([v, ...vouchers]);
    setShowVoucherModal(false);
    setNewVoucher({
      code: '',
      title: '',
      discountType: 'PERCENT',
      discountValue: 10,
      minSpend: 2000000,
      maxUsage: 100,
      expiryDate: '2026-12-31',
    });
  };

  const toggleVoucherActive = (id: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v))
    );
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
          <p className="text-xs text-stone-500">Quản lý và theo dõi {title.toLowerCase()} của hệ thống</p>
        </div>
        {title === 'Products' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] transition"
          >
            + Thêm sản phẩm mới
          </button>
        )}
        {title === 'Vouchers' && (
          <button
            onClick={() => setShowVoucherModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#c2410c] px-4 py-2 text-xs font-bold text-white hover:bg-[#ea580c] transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Voucher mới</span>
          </button>
        )}
      </div>

      {/* Modal thêm sản phẩm */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Thêm sản phẩm mới</h2>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Tên sản phẩm *</label>
                <input
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="Laptop Lenovo Legion 5..."
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Thương hiệu</label>
                  <input
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Danh mục</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="PC Gaming">PC Gaming</option>
                    <option value="Màn hình">Màn hình</option>
                    <option value="Bàn phím">Bàn phím</option>
                    <option value="Chuột">Chuột</option>
                    <option value="Linh kiện PC">Linh kiện PC</option>
                    <option value="Tai nghe & Loa">Tai nghe & Loa</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Số lượng kho *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded border px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c]"
                >
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm Voucher */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-stone-900">Tạo mã Voucher khuyến mãi</h2>
              <button onClick={() => setShowVoucherModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mã Voucher (Code) *</label>
                <input
                  required
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                  placeholder="Ví dụ: TECHZONE10"
                  className="w-full rounded-lg border border-stone-300 p-2 uppercase font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tiêu đề khuyến mãi *</label>
                <input
                  required
                  value={newVoucher.title}
                  onChange={(e) => setNewVoucher({ ...newVoucher, title: e.target.value })}
                  placeholder="Ví dụ: Giảm 10% đơn từ 2 triệu..."
                  className="w-full rounded-lg border border-stone-300 p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Hình thức giảm</label>
                  <select
                    value={newVoucher.discountType}
                    onChange={(e) => setNewVoucher({ ...newVoucher, discountType: e.target.value as any })}
                    className="w-full rounded-lg border border-stone-300 p-2"
                  >
                    <option value="PERCENT">Giảm theo %</option>
                    <option value="FIXED">Giảm tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Giá trị giảm {newVoucher.discountType === 'PERCENT' ? '(%)' : '(VNĐ)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newVoucher.discountValue}
                    onChange={(e) => setNewVoucher({ ...newVoucher, discountValue: Number(e.target.value) })}
                    className="w-full rounded-lg border border-stone-300 p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    value={newVoucher.minSpend}
                    onChange={(e) => setNewVoucher({ ...newVoucher, minSpend: Number(e.target.value) })}
                    className="w-full rounded-lg border border-stone-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Số lượt tối đa</label>
                  <input
                    type="number"
                    value={newVoucher.maxUsage}
                    onChange={(e) => setNewVoucher({ ...newVoucher, maxUsage: Number(e.target.value) })}
                    className="w-full rounded-lg border border-stone-300 p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Ngày hết hạn</label>
                <input
                  type="date"
                  value={newVoucher.expiryDate}
                  onChange={(e) => setNewVoucher({ ...newVoucher, expiryDate: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold"
                >
                  Tạo Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table view */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-sm text-stone-500">Đang tải dữ liệu...</div>
        ) : title === 'Products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Tên sản phẩm</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3 text-right">Giá bán</th>
                  <th className="p-3 text-center">Tồn kho</th>
                  <th className="p-3 text-center">Đã bán</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono text-xs text-stone-500">{p.sku}</td>
                    <td className="p-3 font-medium text-stone-900 max-w-md truncate">{p.name}</td>
                    <td className="p-3"><span className="rounded bg-stone-100 px-2 py-0.5 text-xs">{p.cat}</span></td>
                    <td className="p-3 text-right font-semibold text-[#c2410c]">{formatVnd(p.price)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${p.stock < 5 ? 'bg-rose-100 text-rose-700 font-semibold' : 'bg-emerald-50 text-emerald-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3 text-center text-stone-500">{p.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : title === 'Orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">Mã đơn</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3">Phương thức</th>
                  <th className="p-3 text-right">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-center">Thao tác & In phiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50">
                    <td className="p-3 font-semibold text-stone-900">#{o.id}</td>
                    <td className="p-3 font-medium">{o.recipientName}</td>
                    <td className="p-3 text-stone-500">{o.phone}</td>
                    <td className="p-3"><span className="text-xs text-stone-600">{o.paymentMethod}</span></td>
                    <td className="p-3 text-right font-bold text-[#c2410c]">{formatVnd(o.total)}</td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2.5 py-1 text-xs font-semibold ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : o.status === 'SHIPPING'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : o.status === 'CONFIRMED'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : o.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : o.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="rounded-lg border bg-white px-2 py-1 text-xs text-stone-700 shadow-2xs"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPING">SHIPPING</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <button
                          onClick={() => setSelectedOrderForInvoice(o)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-[#c2410c] hover:text-[#c2410c] text-xs font-semibold transition"
                          title="In phiếu giao hàng & Hóa đơn"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">In hóa đơn</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : title === 'Vouchers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">Mã Voucher</th>
                  <th className="p-3">Tên chương trình</th>
                  <th className="p-3">Mức giảm</th>
                  <th className="p-3">Đơn tối thiểu</th>
                  <th className="p-3 text-center">Lượt dùng</th>
                  <th className="p-3">Hạn sử dụng</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">
                      <span className="bg-orange-50 text-[#c2410c] px-2 py-1 rounded border border-orange-200">
                        {v.code}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{v.title}</td>
                    <td className="p-3 font-bold text-[#c2410c]">
                      {v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatVnd(v.discountValue)}
                    </td>
                    <td className="p-3 text-stone-600">{formatVnd(v.minSpend)}</td>
                    <td className="p-3 text-center text-xs">
                      <span className="font-semibold text-stone-800">{v.usedCount}</span> / {v.maxUsage}
                    </td>
                    <td className="p-3 text-xs text-stone-500 font-mono">{v.expiryDate}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleVoucherActive(v.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          v.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {v.active ? 'Đang hoạt động' : 'Tạm dừng'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Tên / Nội dung</th>
                <th className="p-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">#{String(i).padStart(4, '0')}</td>
                  <td className="p-3">Sample {title} {i}</td>
                  <td className="p-3 text-emerald-600">Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invoice Modal Preview */}
      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          isOpen={!!selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
    </>
  );
}
