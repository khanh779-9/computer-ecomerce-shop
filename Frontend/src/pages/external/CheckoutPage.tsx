import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../stores/cartStore';
import { useToast } from '../../stores/toastStore';
import { cartSubtotal, formatVnd, shippingFee } from '../../lib/cart';
import { Button } from '../../components/ui/Button';
import { createOrder, type OrderResponse } from '../../services/orderService';
import {
  CheckCircle2,
  Truck,
  CreditCard,
  QrCode,
  ShieldCheck,
  ChevronLeft,
  Copy,
  User,
  AlertCircle,
} from 'lucide-react';

const CITIES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Khác',
];

export function CheckoutPage() {
  const { items, clear } = useCart();
  const toast = useToast();
  const nav = useNavigate();

  const [city, setCity] = useState(CITIES[0]);
  const [f, setF] = useState({ name: '', phone: '', street: '', note: '', pay: 'bank' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);

  const sub = cartSubtotal(items);
  const ship = shippingFee(sub);
  const total = sub + ship;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (f.name.trim().length < 2) {
      setErrorMsg('Vui lòng nhập họ tên người nhận.');
      return;
    }
    if (!/^0\d{9}$/.test(f.phone.trim())) {
      setErrorMsg('Số điện thoại không hợp lệ (cần 10 chữ số bắt đầu bằng 0).');
      return;
    }
    if (f.street.trim().length < 5) {
      setErrorMsg('Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường, phường/xã).');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Giỏ hàng đang trống!');
      return;
    }

    setSubmitting(true);
    const fullAddress = `${f.street.trim()}, ${city}`;
    const paymentLabel = f.pay === 'cod' ? 'COD' : f.pay === 'bank' ? 'Chuyển khoản VietQR' : 'Thẻ tín dụng';

    try {
      const order = await createOrder({
        recipientName: f.name.trim(),
        phone: f.phone.trim(),
        address: fullAddress,
        note: f.note.trim(),
        paymentMethod: paymentLabel,
        items: items.map((i) => ({ productId: i.id, quantity: i.qty })),
      });
      clear();
      setOrderResult(order);
      toast.success('Đặt hàng thành công!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyOrderCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã ${code}`);
  };

  // SUCCESS SCREEN
  if (orderResult) {
    const isBankTransfer = orderResult.paymentMethod.includes('Chuyển khoản') || orderResult.paymentMethod.includes('VietQR');
    const qrUrl = `https://api.vietqr.io/image/970422-0312345678-compact2.jpg?amount=${orderResult.total}&addInfo=ORD${orderResult.id}&accountName=TECHZONE%20COMPUTER`;

    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl text-center">
          {/* Animated check icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="mt-4 text-2xl font-black text-stone-900">Đặt Hàng Thành Công!</h1>
          <p className="mt-1 text-xs text-stone-500">
            Cảm ơn bạn đã lựa chọn mua sắm thiết bị tại TechZone Computer.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-mono font-bold text-stone-800">
            <span>Mã đơn: #ORD-{orderResult.id}</span>
            <button
              onClick={() => copyOrderCode(`ORD-${orderResult.id}`)}
              className="text-[#c2410c] hover:opacity-80 p-0.5"
              title="Sao chép mã"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dynamic VietQR code for Bank Transfer */}
          {isBankTransfer && (
            <div className="mt-6 rounded-xl border-2 border-dashed border-[#c2410c]/40 bg-orange-50/40 p-5 text-left space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#c2410c]">
                <QrCode className="w-5 h-5" />
                <span>Quét mã VietQR để thanh toán tức thì (Napas 24/7)</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-44 h-44 bg-white p-2 rounded-xl shadow-md border border-stone-200 shrink-0">
                  <img
                    src={qrUrl}
                    alt="VietQR Payment Code"
                    className="w-full h-full object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-1.5 text-xs text-stone-700 flex-1">
                  <p>Ngân hàng: <strong>MBBank (Quân Đội)</strong></p>
                  <p>Số tài khoản: <strong className="font-mono text-sm text-[#c2410c]">0312345678</strong></p>
                  <p>Chủ tài khoản: <strong>TECHZONE COMPUTER CO. LTD</strong></p>
                  <p>Số tiền: <strong className="text-sm font-bold text-emerald-700">{formatVnd(orderResult.total)}</strong></p>
                  <p>Nội dung chuyển khoản: <strong className="font-mono bg-stone-200 px-1.5 py-0.5 rounded text-stone-900">ORD{orderResult.id}</strong></p>
                  <p className="text-[11px] text-stone-500 pt-1">
                    * Đơn hàng sẽ tự động chuyển trạng thái &ldquo;ĐÃ THANH TOÁN&rdquo; sau khi hệ thống nhận được giao dịch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Details Card */}
          <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50/50 p-4 text-left text-xs space-y-2 text-stone-700">
            <div className="flex justify-between border-b pb-2">
              <span className="text-stone-500">Người nhận hàng:</span>
              <span className="font-semibold text-stone-800">{orderResult.recipientName} · {orderResult.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-stone-500">Địa chỉ giao:</span>
              <span className="font-medium text-stone-800 max-w-xs text-right">{orderResult.address}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-stone-500">Phương thức:</span>
              <span className="font-semibold text-stone-800">{orderResult.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold text-stone-900">
              <span>Tổng số tiền:</span>
              <span className="text-lg font-black text-[#c2410c]">{formatVnd(orderResult.total)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs sm:text-sm py-2.5 font-bold"
              onClick={() => nav('/')}
            >
              Tiếp tục mua sắm
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-stone-300 text-stone-700 text-xs sm:text-sm py-2.5"
              onClick={() => window.print()}
            >
              In hóa đơn đơn hàng
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // CHECKOUT FORM
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Navigation & Title */}
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại giỏ hàng</span>
      </Link>

      <h1 className="text-xl sm:text-2xl font-black text-stone-900 mb-6">Thanh toán đơn hàng</h1>

      {errorMsg && (
        <div className="mb-6 rounded-xl bg-rose-50 p-4 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Form: Customer & Shipping (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Information Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b pb-3">
              <User className="w-4 h-4 text-[#c2410c]" />
              <span>1. Thông tin giao nhận hàng</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Họ tên người nhận <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs focus:border-[#c2410c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={f.phone}
                  onChange={(e) => setF({ ...f, phone: e.target.value })}
                  placeholder="0912345678"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs focus:border-[#c2410c] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tỉnh / Thành phố</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs focus:border-[#c2410c] focus:outline-none bg-white cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Địa chỉ chi tiết (Số nhà, tên đường...) <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={f.street}
                  onChange={(e) => setF({ ...f, street: e.target.value })}
                  placeholder="Số 123, đường CMT8, Phường 5..."
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs focus:border-[#c2410c] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Ghi chú giao hàng (Tùy chọn)</label>
              <textarea
                value={f.note}
                onChange={(e) => setF({ ...f, note: e.target.value })}
                placeholder="Giao giờ hành chính, gọi điện trước khi đến 15 phút..."
                rows={2}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs focus:border-[#c2410c] focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b pb-3">
              <CreditCard className="w-4 h-4 text-[#c2410c]" />
              <span>2. Phương thức thanh toán</span>
            </h2>

            <div className="space-y-2.5">
              {[
                {
                  id: 'bank',
                  title: 'Chuyển khoản ngân hàng qua mã VietQR (Khuyên dùng)',
                  desc: 'Mã QR tự động sinh kèm số tiền và nội dung, quét nhanh trên mọi app ngân hàng & ví MoMo.',
                  icon: <QrCode className="w-5 h-5 text-[#c2410c]" />,
                },
                {
                  id: 'cod',
                  title: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                  desc: 'Kiểm tra máy móc và tem niêm phong trước khi thanh toán cho shipper.',
                  icon: <Truck className="w-5 h-5 text-emerald-600" />,
                },
                {
                  id: 'card',
                  title: 'Thẻ tín dụng / Ghi nợ quốc tế (Visa, Mastercard)',
                  desc: 'Hỗ trợ trả góp 0% lãi suất với các ngân hàng liên kết.',
                  icon: <CreditCard className="w-5 h-5 text-blue-600" />,
                },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition select-none ${
                    f.pay === m.id
                      ? 'border-[#c2410c] bg-orange-50/50 ring-1 ring-[#c2410c]/30'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    checked={f.pay === m.id}
                    onChange={() => setF({ ...f, pay: m.id })}
                    className="accent-[#c2410c] h-4 w-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                      {m.icon}
                      <span>{m.title}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-stone-500 leading-normal">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Items Summary & Submit CTA (5 cols) */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b pb-2">
              Đơn hàng của bạn ({items.reduce((s, i) => s + i.qty, 0)} món)
            </h2>

            {/* Items scroll */}
            <div className="max-h-64 overflow-y-auto space-y-2.5 divide-y divide-stone-100 pr-1">
              {items.map((i) => (
                <div key={i.id} className="pt-2 flex justify-between items-center text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-stone-800 truncate">{i.name}</p>
                    <p className="text-[11px] text-stone-400">
                      {formatVnd(i.price)} × <strong>{i.qty}</strong>
                    </p>
                  </div>
                  <span className="font-bold text-stone-800 shrink-0">{formatVnd(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-semibold text-stone-800">{formatVnd(sub)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển ({city}):</span>
                <span className="font-semibold">
                  {ship === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : formatVnd(ship)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 border-t border-stone-200 pt-3">
                <span>Tổng cần thanh toán:</span>
                <span className="text-[#c2410c] text-lg">{formatVnd(total)}</span>
              </div>
              <p className="text-[10px] text-stone-400 text-right">(Đã gồm thuế GTGT)</p>
            </div>

            {/* Confirm CTA */}
            <Button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full py-3.5 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-[1.02]"
            >
              {submitting ? 'Đang gửi đơn hàng...' : 'Xác nhận đặt hàng ngay'}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Cam kết hàng chính hãng, đổi mới 30 ngày nếu lỗi</span>
            </div>
          </div>
        </aside>
      </form>
    </main>
  );
}
