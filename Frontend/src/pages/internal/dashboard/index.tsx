import { useEffect, useState } from 'react';
import { fetchOrders, type OrderResponse } from '../../../services/orderService';
import { fetchProducts } from '../../../services/productService';
import { formatVnd } from '../../../lib/cart';
import type { Product } from '../../../types';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Layers,
  Calendar,
  DollarSign,
} from 'lucide-react';

type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: 'Hôm nay',
  week: 'Tuần này',
  month: 'Tháng này',
  quarter: 'Quý này',
  year: 'Năm nay',
};

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfPeriod(date: Date, period: DashboardPeriod) {
  const result = startOfDay(date);
  if (period === 'today') return result;
  if (period === 'week') {
    result.setDate(result.getDate() - 6);
  } else if (period === 'month') {
    result.setDate(1);
  } else if (period === 'quarter') {
    result.setMonth(Math.floor(result.getMonth() / 3) * 3, 1);
  } else {
    result.setMonth(0, 1);
  }
  return result;
}

export function DashboardPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<DashboardPeriod>('today');

  useEffect(() => {
    Promise.all([fetchOrders(), fetchProducts()])
      .then(([ords, prods]) => {
        setOrders(ords);
        setProducts(prods);
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const periodStart = startOfPeriod(now, period);
  const periodOrders = orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return createdAt >= periodStart && createdAt <= now;
  });
  const totalRevenue = periodOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = products.filter((p) => p.stock <= 5);

  const bucketCount = period === 'today'
    ? 6
    : period === 'week'
      ? 7
      : period === 'month'
        ? Math.max(now.getDate(), 1)
        : period === 'quarter' ? 3 : 12;
  const revenueTrend = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(periodStart);
    if (period === 'today') {
      bucketStart.setHours(index * 4, 0, 0, 0);
    } else if (period === 'year' || period === 'quarter') {
      bucketStart.setMonth(periodStart.getMonth() + index, 1);
    } else {
      bucketStart.setDate(periodStart.getDate() + index);
    }
    const bucketEnd = new Date(bucketStart);
    if (period === 'today') {
      bucketEnd.setHours(bucketStart.getHours() + 4);
    } else if (period === 'year' || period === 'quarter') {
      bucketEnd.setMonth(bucketStart.getMonth() + 1, 1);
    } else {
      bucketEnd.setDate(bucketStart.getDate() + 1);
    }
    const amount = periodOrders
      .filter((order) => {
        const createdAt = new Date(order.createdAt);
        return order.status !== 'CANCELLED' && createdAt >= bucketStart && createdAt < bucketEnd;
      })
      .reduce((sum, order) => sum + order.total, 0);

    return {
      day: period === 'today'
        ? `${String(bucketStart.getHours()).padStart(2, '0')}h`
        : period === 'year' || period === 'quarter'
          ? `T${bucketStart.getMonth() + 1}`
          : period === 'month'
            ? `${bucketStart.getDate()}`
            : new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(bucketStart).replace('.', ''),
      amount,
    };
  });
  const maxRevenue = Math.max(...revenueTrend.map((item) => item.amount), 1);
  const paidOrders = periodOrders.filter((order) => order.status !== 'CANCELLED');
  const paymentTotals = paidOrders.reduce(
    (totals, order) => {
      const paymentMethod = order.paymentMethod.toUpperCase();
      if (paymentMethod.includes('VNPAY') || paymentMethod.includes('BANK')) {
        totals.online += 1;
      } else {
        totals.cod += 1;
      }
      return totals;
    },
    { online: 0, cod: 0 },
  );
  const paymentOrderCount = paymentTotals.online + paymentTotals.cod;
  const onlinePaymentPct = paymentOrderCount > 0
    ? Math.round((paymentTotals.online / paymentOrderCount) * 100)
    : 0;
  const codPaymentPct = paymentOrderCount > 0 ? 100 - onlinePaymentPct : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Dashboard Quản Trị & Báo Cáo</h1>
          <p className="text-xs text-stone-500">Số liệu kinh doanh thời gian thực tại TechZone Computer</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 font-semibold text-stone-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as DashboardPeriod)}
              className="cursor-pointer bg-transparent text-xs outline-none"
              aria-label="Khoảng thời gian thống kê"
            >
              {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            Dữ liệu từ đơn hàng
          </span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Doanh thu tích lũy',
            value: formatVnd(totalRevenue),
            sub: `${paidOrders.length} đơn không bị hủy`,
            color: 'text-[#c2410c]',
            bgIcon: 'bg-orange-100 text-[#c2410c]',
            icon: DollarSign,
          },
          {
            label: 'Tổng đơn đặt hàng',
            value: periodOrders.length.toString(),
            sub: paidOrders.length > 0
              ? `${Math.round((paidOrders.filter((order) => order.status === 'DELIVERED').length / paidOrders.length) * 100)}% đã giao`
              : 'Chưa có đơn hợp lệ',
            color: 'text-stone-900',
            bgIcon: 'bg-blue-100 text-blue-700',
            icon: Package,
          },
          {
            label: 'Sản phẩm đang bán',
            value: products.length.toString(),
            sub: `${new Set(products.map((product) => product.cat)).size} danh mục`,
            color: 'text-emerald-700',
            bgIcon: 'bg-emerald-100 text-emerald-700',
            icon: Layers,
          },
          {
            label: 'Cảnh báo tồn kho thấp',
            value: lowStockProducts.length.toString(),
            sub: lowStockProducts.length > 0 ? 'Cần kiểm tra nhập kho' : 'Kho hàng dồi dào',
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
        <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-tight">Xu hướng doanh thu {PERIOD_LABELS[period].toLowerCase()}</h2>
                <p className="text-xs text-stone-400">Doanh thu bán lẻ theo kỳ đã chọn (VNĐ)</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {revenueTrend.some((item) => item.amount > 0)
                ? `Cao điểm: ${revenueTrend.reduce((peak, item) => item.amount > peak.amount ? item : peak).day}`
                : 'Chưa có doanh thu'}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 min-w-0 overflow-hidden px-2 pt-4">
            <div className="flex h-full items-end justify-between gap-2 sm:gap-4">
            {revenueTrend.map((item) => (
              <div key={item.day} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <div className="pointer-events-none absolute bottom-7 z-10 opacity-0 transition-opacity group-hover:opacity-100 text-[10px] font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                  {formatVnd(item.amount)}
                </div>
                <div
                  className="w-full max-w-[42px] bg-gradient-to-t from-[#c2410c] to-[#ea580c] rounded-t-xl group-hover:from-orange-600 group-hover:to-amber-500 transition-all duration-300 shadow-sm"
                  style={{ height: `${Math.max((item.amount / maxRevenue) * 100, item.amount > 0 ? 4 : 0)}%` }}
                />
                <span className="text-xs font-bold text-stone-600">{item.day}</span>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* 2. Category Mix & Payment Breakdown (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-tight">Phương thức thanh toán</h2>
            <p className="text-xs text-stone-400">Tỷ trọng theo các đơn hợp lệ</p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-stone-700">
                <span className="font-semibold">Đơn online / chuyển khoản</span>
                <span className="font-bold">{onlinePaymentPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-[#c2410c]" style={{ width: `${onlinePaymentPct}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-stone-700">
                <span className="font-semibold">Tiền mặt COD</span>
                <span className="font-bold">{codPaymentPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-stone-600" style={{ width: `${codPaymentPct}%` }} />
              </div>
            </div>
            {paymentOrderCount === 0 && (
              <p className="text-xs text-stone-400">Chưa có đơn hàng để phân tích.</p>
            )}
          </div>

          {/* Payment Method distribution */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Kênh thanh toán</span>
            <div className="flex gap-2 text-xs">
              <div className="flex-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px]">VNPay / Chuyển khoản</span>
                <strong className="text-sm font-bold text-[#c2410c]">{onlinePaymentPct}%</strong>
              </div>
              <div className="flex-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px]">Tiền mặt COD</span>
                <strong className="text-sm font-bold text-stone-800">{codPaymentPct}%</strong>
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
            <span className="text-xs text-stone-400">{periodOrders.length} tổng đơn</span>
          </div>
          <div className="divide-y divide-stone-100 text-sm">
            {periodOrders.slice(0, 5).map((o) => (
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
