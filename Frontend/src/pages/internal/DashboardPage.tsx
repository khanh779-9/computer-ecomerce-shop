import { useEffect, useState } from 'react';
import { fetchOrders, type OrderResponse } from '../../services/orderService';
import { fetchProducts } from '../../services/productService';
import { formatVnd } from '../../lib/cart';
import type { Product } from '../../types';
import {
  TrendingUp,
  CreditCard,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  Calendar,
  DollarSign,
  Activity,
} from 'lucide-react';

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

  // Mock 7-day revenue trend data
  const revenueTrend = [
    { day: 'T2', amount: 32500000, height: '45%' },
    { day: 'T3', amount: 48900000, height: '65%' },
    { day: 'T4', amount: 39200000, height: '52%' },
    { day: 'T5', amount: 62000000, height: '80%' },
    { day: 'T6', amount: 55400000, height: '72%' },
    { day: 'T7', amount: 78900000, height: '95%' },
    { day: 'CN', amount: 84200000, height: '100%' },
  ];

  // Category sales breakdown
  const categoryBreakdown = [
    { name: 'Laptop Gaming & Văn phòng', pct: 42, color: 'bg-[#c2410c]' },
    { name: 'PC Gaming & Máy bộ lắp ráp', pct: 28, color: 'bg-emerald-600' },
    { name: 'Linh kiện phần cứng (VGA, CPU, RAM)', pct: 18, color: 'bg-blue-600' },
    { name: 'Màn hình máy tính & Gear', pct: 12, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Dashboard Quản Trị & Báo Cáo</h1>
          <p className="text-xs text-stone-500">Số liệu kinh doanh thời gian thực tại TechZone Computer</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-semibold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>7 ngày qua</span>
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% tăng trưởng
          </span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Doanh thu tích lũy',
            value: formatVnd(totalRevenue),
            sub: '+24% so với tháng trước',
            color: 'text-[#c2410c]',
            bgIcon: 'bg-orange-100 text-[#c2410c]',
            icon: DollarSign,
          },
          {
            label: 'Tổng đơn đặt hàng',
            value: orders.length.toString(),
            sub: '98% đơn xử lý thành công',
            color: 'text-stone-900',
            bgIcon: 'bg-blue-100 text-blue-700',
            icon: Package,
          },
          {
            label: 'Sản phẩm đang bán',
            value: products.length.toString(),
            sub: 'Đầy đủ 8 danh mục phần cứng',
            color: 'text-emerald-700',
            bgIcon: 'bg-emerald-100 text-emerald-700',
            icon: Layers,
          },
          {
            label: 'Cảnh báo tồn kho thấp',
            value: lowStockProducts.length.toString(),
            sub: lowStockProducts.length > 0 ? 'Cần tạo đơn nhập kho sớm' : 'Kho hàng dồi dào',
            color: lowStockProducts.length > 0 ? 'text-rose-600' : 'text-stone-700',
            bgIcon: lowStockProducts.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-600',
            icon: AlertTriangle,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{card.label}</p>
                <div className={`w-8 h-8 rounded-xl ${card.bgIcon} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <b className={`text-2xl font-black ${card.color}`}>
                  {loading ? '...' : card.value}
                </b>
                <span className="text-[11px] text-stone-400 block mt-1">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* 1. Revenue 7-day Bar Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-tight">Xu hướng doanh thu tuần này</h2>
              <p className="text-xs text-stone-400">Doanh thu bán lẻ theo ngày (VNĐ)</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Cao điểm: Chủ Nhật
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 h-56 flex items-end justify-between gap-3 sm:gap-6 px-2">
            {revenueTrend.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded shadow-xs mb-1 whitespace-nowrap">
                  {formatVnd(item.amount)}
                </div>
                <div
                  className="w-full max-w-[42px] bg-gradient-to-t from-[#c2410c] to-[#ea580c] rounded-t-xl group-hover:from-orange-600 group-hover:to-amber-500 transition-all duration-300 shadow-sm"
                  style={{ height: item.height }}
                />
                <span className="text-xs font-bold text-stone-600 mt-1">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Category Mix & Payment Breakdown (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-tight">Cơ cấu doanh thu theo ngành</h2>
            <p className="text-xs text-stone-400">Tỷ trọng đóng góp doanh thu</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs text-stone-700">
                  <span className="font-semibold truncate max-w-[200px]">{cat.name}</span>
                  <span className="font-bold">{cat.pct}%</span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method distribution */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Kênh thanh toán</span>
            <div className="flex gap-2 text-xs">
              <div className="flex-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px]">VNPay / Chuyển khoản</span>
                <strong className="text-sm font-bold text-[#c2410c]">68%</strong>
              </div>
              <div className="flex-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px]">Tiền mặt COD</span>
                <strong className="text-sm font-bold text-stone-800">32%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Đơn hàng gần nhất */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800">Đơn hàng mới nhất</h2>
            <span className="text-xs text-stone-400">{orders.length} tổng đơn</span>
          </div>
          <div className="divide-y divide-stone-100 text-sm">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-800">#{o.id} · {o.recipientName}</p>
                  <p className="text-xs text-stone-500">{o.paymentMethod} · {new Date(o.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#c2410c]">{formatVnd(o.total)}</p>
                  <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-stone-100 text-stone-600">
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sản phẩm sắp hết hàng */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800">Cảnh báo nhập hàng</h2>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              {lowStockProducts.length} mặt hàng
            </span>
          </div>
          <div className="divide-y divide-stone-100 text-sm">
            {lowStockProducts.slice(0, 5).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-stone-800 truncate">{p.name}</p>
                  <p className="text-xs text-stone-500">{p.cat} · SKU: {p.sku}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 text-xs font-bold whitespace-nowrap">
                  Còn {p.stock} cái
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
