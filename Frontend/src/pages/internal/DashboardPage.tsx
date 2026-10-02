import { useEffect, useState } from 'react';
import { fetchOrders, type OrderResponse } from '../../services/orderService';
import { fetchProducts } from '../../services/productService';
import { formatVnd } from '../../lib/cart';
import type { Product } from '../../types';

export function DashboardPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchProducts()])
      .then(([ords, prods]) => {
        setOrders(ords);
        setProducts(prods);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard Quản Trị</h1>
        <p className="text-xs text-stone-500">Tổng quan tình hình kinh doanh TechZone Computer</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng đơn hàng', value: orders.length, color: 'text-stone-900' },
          { label: 'Doanh thu tích lũy', value: formatVnd(totalRevenue), color: 'text-[#c2410c]' },
          { label: 'Sản phẩm kinh doanh', value: products.length, color: 'text-emerald-700' },
          { label: 'Cảnh báo sắp hết hàng', value: lowStockProducts.length, color: lowStockProducts.length > 0 ? 'text-rose-600' : 'text-stone-700' },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{card.label}</p>
            <b className={`mt-2 block text-2xl font-bold ${card.color}`}>
              {loading ? '...' : card.value}
            </b>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Đơn hàng gần nhất */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3">Đơn hàng mới nhất</h2>
          <div className="divide-y text-sm">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800">#{o.id} · {o.recipientName}</p>
                  <p className="text-xs text-stone-500">{o.paymentMethod} · {new Date(o.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#c2410c]">{formatVnd(o.total)}</p>
                  <span className="text-xs text-stone-500">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sản phẩm sắp hết hàng */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3">Sản phẩm cần nhập thêm</h2>
          <div className="divide-y text-sm">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-stone-800 truncate">{p.name}</p>
                  <p className="text-xs text-stone-500">{p.cat} · Mã {p.sku}</p>
                </div>
                <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 text-xs font-bold whitespace-nowrap">
                  Còn {p.stock} cái
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
