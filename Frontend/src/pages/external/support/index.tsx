import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchOrderById, type OrderResponse } from '../../../services/orderService';
import { formatVnd } from '../../../lib/cart';
import { Button } from '../../../components/ui/Button';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  ChevronRight,
  FileText,
  BadgeCheck,
  Check,
  ExternalLink,
} from 'lucide-react';

export type SupportTopic =
  | 'order-lookup'
  | 'shopping-guide'
  | 'warranty-policy'
  | 'payment-guide'
  | 'shipping-policy';

const SUPPORT_NAV_ITEMS: { id: SupportTopic; label: string; desc: string }[] = [
  {
    id: 'order-lookup',
    label: 'Tra cứu trạng thái đơn hàng',
    desc: 'Kiểm tra tiến độ giao hàng và thông tin đơn hàng',
  },
  {
    id: 'shopping-guide',
    label: 'Hướng dẫn mua hàng online',
    desc: 'Các bước đặt hàng và mẹo chọn cấu hình máy tính',
  },
  {
    id: 'warranty-policy',
    label: 'Chính sách bảo hành & đổi trả',
    desc: 'Quy định bảo hành chính hãng và chính sách 1 đổi 1 trong 30 ngày',
  },
  {
    id: 'payment-guide',
    label: 'Hướng dẫn thanh toán & đặt hàng',
    desc: 'Các phương thức thanh toán an toàn: QR code, thẻ, COD',
  },
  {
    id: 'shipping-policy',
    label: 'Chính sách vận chuyển & kiểm hàng',
    desc: 'Thời gian giao hàng, phí vận chuyển và chính sách đồng kiểm',
  },
];

export function SupportPage() {
  const { topic } = useParams<{ topic?: string }>();
  const nav = useNavigate();

  // Validate active topic or fallback to order-lookup
  const activeTopic: SupportTopic = SUPPORT_NAV_ITEMS.some((i) => i.id === topic)
    ? (topic as SupportTopic)
    : 'order-lookup';

  const handleSelectTopic = (id: SupportTopic) => {
    nav(`/support/${id}`);
  };

  const currentTopicMeta = SUPPORT_NAV_ITEMS.find((i) => i.id === activeTopic)!;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link to="/" className="hover:text-stone-900 transition">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-500">Hỗ trợ khách hàng</span>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-800">{currentTopicMeta.label}</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 p-6 sm:p-8 text-white shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Trung tâm hỗ trợ khách hàng TechZone</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {currentTopicMeta.label}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {currentTopicMeta.desc}
          </p>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Sidebar Navigation (4 cols) */}
        <aside className="lg:col-span-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs space-y-1">
          <div className="px-3 py-2 border-b border-stone-100 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Hỗ trợ khách hàng
            </h2>
            <p className="text-[11px] text-stone-400 mt-0.5">Chọn chủ đề bạn cần trợ giúp</p>
          </div>

          {SUPPORT_NAV_ITEMS.map((item) => {
            const isActive = activeTopic === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTopic(item.id)}
                className={`w-full text-left p-3 rounded-xl text-xs transition flex items-start justify-between gap-2 ${
                  isActive
                    ? 'bg-stone-900 text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-semibold">{item.label}</div>
                  <div
                    className={`text-[11px] line-clamp-1 ${
                      isActive ? 'text-stone-300' : 'text-stone-400'
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isActive ? 'text-white' : 'text-stone-400'
                  }`}
                />
              </button>
            );
          })}

          {/* Quick Contact Box */}
          <div className="mt-4 rounded-xl bg-orange-50/80 border border-orange-200/80 p-3.5 space-y-2 text-xs">
            <p className="font-bold text-[#c2410c] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Tổng đài chăm sóc 24/7
            </p>
            <p className="text-stone-600 text-[11px]">
              Hotline miễn phí: <strong className="text-stone-900 font-bold">1800 6868</strong>
            </p>
            <p className="text-stone-600 text-[11px]">
              Email hỗ trợ: <strong className="text-stone-900 font-bold">support@techzone.vn</strong>
            </p>
          </div>
        </aside>

        {/* Right Content Area (8 cols) */}
        <main className="lg:col-span-8 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
          {activeTopic === 'order-lookup' && <OrderLookupTopicView />}
          {activeTopic === 'shopping-guide' && <ShoppingGuideTopicView />}
          {activeTopic === 'warranty-policy' && <WarrantyPolicyTopicView />}
          {activeTopic === 'payment-guide' && <PaymentGuideTopicView />}
          {activeTopic === 'shipping-policy' && <ShippingPolicyTopicView />}
        </main>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. ORDER LOOKUP VIEW
// -------------------------------------------------------------
function OrderLookupTopicView() {
  const [orderInput, setOrderInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderInput.trim().replace(/^ORD-?/i, '');
    const numId = parseInt(cleanId, 10);

    if (isNaN(numId) || numId <= 0) {
      setError('Vui lòng nhập mã đơn hàng số hợp lệ (ví dụ: 1 hoặc ORD-1)');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const data = await fetchOrderById(numId);
      setOrder(data);
    } catch (err: any) {
      setError(err?.message || 'Không tìm thấy thông tin đơn hàng này trong hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Chờ xử lý
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <Truck className="w-3.5 h-3.5" /> Đang vận chuyển
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Giao thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-xl font-black text-stone-900">Tra cứu trạng thái đơn hàng trực tuyến</h2>
        <p className="mt-1 text-xs text-stone-500">
          Nhập mã đơn hàng được gửi qua email hoặc tin nhắn SMS để kiểm tra lộ trình giao vận.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <label className="block text-xs font-bold text-stone-700">Mã đơn hàng của bạn</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              placeholder="Ví dụ: 1, 2 hoặc ORD-1..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !orderInput.trim()}
            className="bg-[#c2410c] hover:bg-[#9a3412] text-white px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs transition"
          >
            {loading ? 'Đang tìm...' : 'Tra cứu ngay'}
          </Button>
        </div>
        {error && (
          <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}
      </form>

      {/* Order Results */}
      {order && (
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-5 space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <div>
              <span className="text-xs text-stone-400">Mã đơn: </span>
              <strong className="text-sm font-black text-stone-900">ORD-{order.id}</strong>
              <span className="text-xs text-stone-400 ml-2">({order.createdAt})</span>
            </div>
            {getStatusBadge(order.status)}
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-stone-100">
            <div className="space-y-1">
              <p className="text-stone-400">Người nhận:</p>
              <p className="font-semibold text-stone-800">{order.recipientName}</p>
              <p className="text-stone-600">{order.phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-stone-400">Địa chỉ giao hàng:</p>
              <p className="text-stone-700 leading-relaxed">{order.address}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">Sản phẩm trong đơn</h4>
            <div className="divide-y divide-stone-100 border rounded-lg bg-white overflow-hidden text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-stone-800">{item.productName}</p>
                    <p className="text-[11px] text-stone-400">Số lượng: x{item.quantity}</p>
                  </div>
                  <span className="font-bold text-stone-900">{formatVnd(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200 font-bold text-sm">
            <span>Tổng thanh toán:</span>
            <span className="text-base text-[#c2410c]">{formatVnd(order.total)}</span>
          </div>
        </div>
      )}

      {/* Status Explanations */}
      <div className="pt-4 border-t border-stone-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
          Ý nghĩa các trạng thái đơn hàng
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 space-y-1">
            <span className="font-bold text-amber-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Chờ xử lý / Đang xử lý
            </span>
            <p className="text-stone-600 text-[11px]">
              Đơn hàng đã được ghi nhận trên hệ thống. Nhân viên kho đang kiểm tra linh kiện và đóng gói.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 space-y-1">
            <span className="font-bold text-purple-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Đang vận chuyển
            </span>
            <p className="text-stone-600 text-[11px]">
              Đơn hàng đã được bàn giao cho đối tác vận chuyển hỏa tốc hoặc giao hàng tiêu chuẩn.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 space-y-1">
            <span className="font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Giao thành công
            </span>
            <p className="text-stone-600 text-[11px]">
              Khách hàng đã nhận kiện hàng, đồng kiểm và hoàn tất quá trình thanh toán.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 space-y-1">
            <span className="font-bold text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Đã hủy
            </span>
            <p className="text-stone-600 text-[11px]">
              Đơn hàng bị hủy do yêu cầu từ khách hàng hoặc quá thời gian xác nhận.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. SHOPPING GUIDE VIEW
// -------------------------------------------------------------
function ShoppingGuideTopicView() {
  const steps = [
    {
      num: '01',
      title: 'Tìm kiếm & Lựa chọn sản phẩm',
      desc: 'Tìm kiếm sản phẩm mong muốn qua thanh tìm kiếm thông minh hoặc danh mục: Laptop, PC Gaming, Màn hình, Bàn phím, Linh kiện. Sử dụng tính năng "So sánh cấu hình" hoặc "Sản phẩm yêu thích" để cân nhắc.',
    },
    {
      num: '02',
      title: 'Kiểm tra thông số & Thêm vào giỏ',
      desc: 'Xem kỹ thông số kỹ thuật, tình trạng còn hàng, quà tặng đi kèm và mức giá ưu đãi. Bấm "Thêm vào giỏ" hoặc bấm "Mua ngay" để đến thẳng màn hình thanh toán.',
    },
    {
      num: '03',
      title: 'Điền thông tin giao nhận & Thanh toán',
      desc: 'Cung cấp họ tên, số điện thoại, địa chỉ nhận hàng chính xác. Lựa chọn phương thức thanh toán thuận tiện: Quét mã VietQR 24/7, thẻ ngân hàng hoặc Ship COD nhận hàng thanh toán.',
    },
    {
      num: '04',
      title: 'Xác nhận đơn & Nhận hàng đồng kiểm',
      desc: 'Hệ thống gửi mã đơn hàng và tin nhắn xác nhận. Khi bưu tá giao tới, bạn được mở hộp đồng kiểm ngoại quan thiết bị trước khi ký nhận và thanh toán.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-xl font-black text-stone-900">Hướng dẫn mua hàng online tại TechZone</h2>
        <p className="mt-1 text-xs text-stone-500">
          Chỉ với 4 bước đơn giản, sở hữu ngay thiết bị công nghệ chính hãng với mức giá tốt nhất.
        </p>
      </div>

      {/* Step Grid */}
      <div className="grid gap-4">
        {steps.map((s) => (
          <div
            key={s.num}
            className="flex items-start gap-4 p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-orange-200 transition"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c2410c] text-white font-black text-sm shadow-xs">
              {s.num}
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-900 text-sm">{s.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Useful tips */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          Mẹo mua sắm thông minh tại TechZone
        </h3>
        <ul className="space-y-2 text-xs text-emerald-900">
          <li className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>
              <strong>Dùng công cụ "Xây cấu hình PC":</strong> Tự động kiểm tra độ tương thích giữa CPU, Mainboard, RAM và nguồn máy tính.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>
              <strong>Lưu sản phẩm yêu thích:</strong> Dễ dàng theo dõi biến động giá và thêm vào giỏ bất cứ lúc nào bạn sẵn sàng.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>
              <strong>Tích lũy TechPoints:</strong> Đăng ký tài khoản để nhận điểm thưởng sau mỗi đơn hàng và đổi voucher giảm giá.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. WARRANTY POLICY VIEW
// -------------------------------------------------------------
function WarrantyPolicyTopicView() {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-xl font-black text-stone-900">Chính sách bảo hành & đổi trả chính hãng</h2>
        <p className="mt-1 text-xs text-stone-500">
          Cam kết 100% sản phẩm có nguồn gốc xuất xứ rõ ràng, bảo hành từ 12 đến 36 tháng theo tiêu chuẩn nhà sản xuất.
        </p>
      </div>

      {/* Key Guarantees */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 text-center space-y-1">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs text-stone-900">1 Đổi 1 Trong 30 Ngày</h3>
          <p className="text-[11px] text-stone-500">Đổi mới thiết bị nếu phát sinh lỗi phần cứng từ nhà sản xuất</p>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 text-center space-y-1">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs text-stone-900">Bảo Hành 12 - 36 Tháng</h3>
          <p className="text-[11px] text-stone-500">Bảo hành chính hãng tại tất cả trung tâm bảo hành ủy quyền</p>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 text-center space-y-1">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-[#c2410c] mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs text-stone-900">Xử Lý Nhanh 3 - 7 Ngày</h3>
          <p className="text-[11px] text-stone-500">Hỗ trợ cho mượn thiết bị thay thế trong thời gian bảo hành</p>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
          Điều kiện tiếp nhận bảo hành
        </h3>
        <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
          <p>✓ Sản phẩm còn trong thời hạn bảo hành tính từ ngày mua hàng trên hóa đơn điện tử hoặc tem bảo hành.</p>
          <p>✓ Tem niêm phong bảo hành, số serial number / IMEI trên thân máy và vỏ hộp phải còn nguyên vẹn, không có dấu hiệu tẩy xóa, chắp vá.</p>
          <p>✓ Lỗi hư hỏng được xác định do linh kiện phần cứng hoặc lỗi kỹ thuật từ phía nhà sản xuất.</p>
          <p className="text-stone-500">
            ✕ <em>Từ chối bảo hành đối với các trường hợp:</em> Máy bị rơi vỡ, va đập, biến dạng, ngấm nước/chất lỏng, chập cháy do nguồn điện không ổn định hoặc tự ý tháo dỡ can thiệp phần cứng.
          </p>
        </div>
      </div>

      {/* Warranty Centers */}
      <div className="pt-4 border-t border-stone-200 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
          Hệ thống trung tâm tiếp nhận bảo hành TechZone
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
            <p className="font-bold text-stone-900">Khu vực Hà Nội:</p>
            <p className="text-stone-600">Số 125 Thái Hà, Phường Trung Liệt, Quận Đống Đa</p>
            <p className="text-[11px] text-stone-400">Giờ làm việc: 8h30 - 20h30 (T2 - CN)</p>
          </div>
          <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1">
            <p className="font-bold text-stone-900">Khu vực TP. Hồ Chí Minh:</p>
            <p className="text-stone-600">Số 280 Bùi Thị Xuân, Phường Phạm Ngũ Lão, Quận 1</p>
            <p className="text-[11px] text-stone-400">Giờ làm việc: 8h30 - 20h30 (T2 - CN)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. PAYMENT GUIDE VIEW
// -------------------------------------------------------------
function PaymentGuideTopicView() {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-xl font-black text-stone-900">Hướng dẫn thanh toán & đặt hàng</h2>
        <p className="mt-1 text-xs text-stone-500">
          TechZone hỗ trợ nhiều hình thức thanh toán an toàn, bảo mật tuyệt đối cho mọi khách hàng.
        </p>
      </div>

      {/* Payment methods */}
      <div className="grid gap-4">
        {/* Method 1: VietQR */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-[#c2410c] font-bold text-xs">
              QR
            </div>
            <h3 className="font-bold text-stone-900 text-sm">1. Chuyển khoản VietQR tự động 24/7 (Khuyên dùng)</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Hệ thống tự động hiển thị mã QR có sẵn số tiền và nội dung chuyển khoản tương ứng với mã đơn của bạn. Mở bất kỳ ứng dụng ngân hàng nào (Vietcombank, MB, Techcombank, BIDV, v.v.) và quét mã để thanh toán tức thì mà không cần nhập số tài khoản thủ công.
          </p>
          <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Xác nhận thanh toán tự động trong 5 giây
          </span>
        </div>

        {/* Method 2: Credit/Debit Card */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">2. Thẻ thanh toán quốc tế & Nội địa (ATM / Visa / Mastercard / JCB)</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Chấp nhận thanh toán trực tuyến qua cổng bảo mật tiêu chuẩn quốc tế PCI-DSS. Hỗ trợ thẻ ATM nội địa phát hành bởi hơn 40 ngân hàng Việt Nam và thẻ tín dụng/ghi nợ quốc tế.
          </p>
        </div>

        {/* Method 3: COD */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">3. Thanh toán khi nhận hàng (Ship COD)</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Quý khách thanh toán tiền mặt trực tiếp cho nhân viên giao hàng sau khi đã mở hộp đồng kiểm ngoại quan sản phẩm và hóa đơn bàn giao. Áp dụng cho mọi đơn hàng trên toàn quốc.
          </p>
        </div>
      </div>

      {/* VAT Invoice */}
      <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
        <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-stone-600" />
          Xuất hóa đơn giá trị gia tăng (VAT 10%)
        </h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Tất cả đơn hàng tại TechZone đều được xuất hóa đơn VAT điện tử hợp lệ phục vụ cá nhân hoặc công ty/doanh nghiệp. Bạn chỉ cần tích chọn "Yêu cầu xuất hóa đơn công ty" tại bước thanh toán và nhập mã số thuế.
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. SHIPPING & INSPECTION POLICY VIEW
// -------------------------------------------------------------
function ShippingPolicyTopicView() {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-xl font-black text-stone-900">Chính sách vận chuyển & kiểm hàng (Đồng kiểm)</h2>
        <p className="mt-1 text-xs text-stone-500">
          Quy chuẩn đóng gói chống sốc chuyên dụng và giao hàng an toàn đến tận tay quý khách.
        </p>
      </div>

      {/* Delivery times */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#c2410c]" />
            <h3 className="font-bold text-stone-900 text-xs">Giao hỏa tốc 2 giờ</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Áp dụng tại các quận nội thành Hà Nội và TP. Hồ Chí Minh đối với các sản phẩm có sẵn tại kho. Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-stone-900 text-xs">Giao hàng toàn quốc (1 - 3 ngày)</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Hợp tác cùng các đối tác vận chuyển uy tín: Viettel Post, Giao Hàng Tiết Kiệm, VNPost. Kiện hàng được bọc xốp bóng khí và dán băng keo niêm phong thương hiệu.
          </p>
        </div>
      </div>

      {/* Co-inspection policy (Đồng kiểm) */}
      <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#c2410c] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#c2410c]" />
          Chính sách đồng kiểm mở hộp khi nhận hàng
        </h3>
        <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
          <p>
            Nhằm đảm bảo quyền lợi tối đa cho khách hàng, <strong>TechZone luôn áp dụng chính sách đồng kiểm</strong> khi bưu tá giao hàng:
          </p>
          <ul className="space-y-1.5 pl-4 list-disc text-stone-600">
            <li>Khách hàng được quyền mở kiện hàng bên ngoài để kiểm tra số lượng, mẫu mã sản phẩm và phụ kiện đi kèm theo đúng hóa đơn đặt hàng.</li>
            <li>Kiểm tra ngoại quan thiết bị: màn hình không vỡ nứt, linh kiện không trầy xước, tem niêm phong còn nguyên vẹn.</li>
            <li>Nếu sản phẩm có dấu hiệu cấn móp hoặc không đúng mã hàng, khách hàng có quyền từ chối nhận và bưu tá sẽ hoàn đơn về lại kho mà không mất phí.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
