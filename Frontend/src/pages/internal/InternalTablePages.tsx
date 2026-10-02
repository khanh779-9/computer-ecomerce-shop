import { useEffect, useState } from 'react';
import { fetchProducts } from '../../services/productService';
import { fetchOrders, updateOrderStatus, type OrderResponse } from '../../services/orderService';
import { formatVnd } from '../../lib/cart';
import type { Product } from '../../types';

export function InternalTablePage({ title }: { title: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

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
              <div className="flex justify-end gap-2 pt-4">
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

      <div className="mt-5 overflow-hidden rounded border bg-white shadow-sm">
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
                  <th className="p-3 text-center">Thao tác</th>
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
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="rounded border bg-white px-2 py-1 text-xs text-stone-700 shadow-sm"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPING">SHIPPING</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
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
    </>
  );
}
