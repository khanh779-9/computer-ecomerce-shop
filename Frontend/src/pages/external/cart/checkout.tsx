import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../../stores/cartStore';
import { useAuth } from '../../../stores/authStore';
import { useToast } from '../../../stores/toastStore';
import { cartSubtotal, formatVnd, shippingFee } from '../../../lib/cart';
import { Button } from '../../../components/ui/Button';
import { createOrder, type OrderResponse } from '../../../services/orderService';
import { createVNPayPayment, verifyVNPayCallback, type VNPayCallbackResponse } from '../../../services/paymentService';
import {
  CheckCircle2,
  Truck,
  CreditCard,
  ShieldCheck,
  ChevronLeft,
  Copy,
  User,
  AlertCircle,
  XCircle,
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
  const [searchParams] = useSearchParams();
  const { items, clear } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [city, setCity] = useState(CITIES[0]);
  const [f, setF] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    note: '',
    pay: 'vnpay',
  });

  useEffect(() => {
    if (user) {
      setF((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);

  // VNPay callback verification state
  const [vnpayCallback, setVnpayCallback] = useState<VNPayCallbackResponse | null>(null);
  const [verifyingVnpay, setVerifyingVnpay] = useState(false);

  // Kiểm tra nếu trang được tải lại từ VNPay Return URL
  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    if (responseCode) {
      setVerifyingVnpay(true);
      verifyVNPayCallback(searchParams)
        .then((res) => {
          setVnpayCallback(res);
          if (res.status === 'SUCCESS') {
            toast.success('Giao dịch qua VNPay thành công!');
            clear();
          } else {
            toast.error(res.message || 'Thanh toán VNPay không thành công hoặc bị hủy.');
          }
        })
        .catch((err) => {
          setVnpayCallback({
            status: 'FAILED',
            message: err.message || 'Lỗi xác thực chữ ký giao dịch VNPay',
          });
        })
        .finally(() => {
          setVerifyingVnpay(false);
        });
    }
  }, [searchParams]);

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
    const paymentLabel = f.pay === 'cod' ? 'COD' : 'Cổng thanh toán VNPay';

    try {
      const order = await createOrder({
        recipientName: f.name.trim(),
        phone: f.phone.trim(),
        address: fullAddress,
        note: f.note.trim(),
        paymentMethod: paymentLabel,
        items: items.map((i) => ({ productId: i.id, quantity: i.qty })),
      });

      // Nếu chọn VNPay -> Khởi tạo link thanh toán và chuyển hướng ngay lập tức
      if (f.pay === 'vnpay') {
        try {
          const vnpayRes = await createVNPayPayment(order.id);
          if (vnpayRes.paymentUrl) {
            clear();
            toast.info('Đang chuyển hướng sang Cổng thanh toán VNPay...');
            window.location.href = vnpayRes.paymentUrl;
            return;
          }
        } catch (payErr: any) {
          setErrorMsg('Không thể kết nối cổng VNPay: ' + (payErr.message || 'Lỗi không xác định'));
          setSubmitting(false);
          return;
        }
      }

      clear();
      setOrderResult(order);
      toast.success('Đặt hàng thành công!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép: ${code}`);
  };

  // 1. MÀN HÌNH KẾT QUẢ KHI QUAY VỀ TỪ CỔNG VNPAY
  if (verifyingVnpay) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-[#c2410c] animate-spin">
            <CreditCard className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-stone-900">Đang đối soát giao dịch với VNPay...</h2>
          <p className="text-xs text-stone-500">Vui lòng chờ trong giây lát để hệ thống xác nhận thanh toán.</p>
        </div>
      </main>
    );
  }

  if (vnpayCallback) {
    const isSuccess = vnpayCallback.status === 'SUCCESS';
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl text-center space-y-5">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-inner ${
              isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {isSuccess ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>

          <div>
            <h1 className="text-2xl font-black text-stone-900">
              {isSuccess ? 'Thanh Toán VNPay Thành Công!' : 'Giao Dịch VNPay Không Thành Công'}
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              {isSuccess
                ? 'Đơn hàng của bạn đã được xác nhận thanh toán tự động qua Cổng VNPay.'
                : vnpayCallback.message || 'Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý.'}
            </p>
          </div>

          {/* Transaction details card */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 text-left text-xs space-y-2 text-stone-700">
            {vnpayCallback.orderId && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-stone-500">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-stone-900">#ORD-{vnpayCallback.orderId}</span>
              </div>
            )}
            {vnpayCallback.transactionNo && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-stone-500">Mã giao dịch VNPay:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-semibold text-stone-800">{vnpayCallback.transactionNo}</span>
                  <button onClick={() => copyCode(vnpayCallback.transactionNo!)} className="text-[#c2410c] p-0.5">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            {vnpayCallback.bankCode && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-stone-500">Ngân hàng thanh toán:</span>
                <span className="font-semibold text-stone-800">{vnpayCallback.bankCode}</span>
              </div>
            )}
            {vnpayCallback.amount && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-stone-500">Số tiền thanh toán:</span>
                <span className="font-black text-sm text-[#c2410c]">{formatVnd(vnpayCallback.amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-stone-500">Trạng thái:</span>
              <span className={`font-bold ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isSuccess ? '✓ ĐÃ THANH TOÁN (PAID)' : '✕ CHƯA THANH TOÁN'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs sm:text-sm py-2.5 font-bold"
              onClick={() => nav('/products')}
            >
              Tiếp tục mua sắm
            </Button>
            {!isSuccess && (
              <Button
                variant="outline"
                className="flex-1 border-stone-300 text-stone-700 text-xs sm:text-sm py-2.5"
                onClick={() => setVnpayCallback(null)}
              >
                Thử thanh toán lại
              </Button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // 2. MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG (DÀNH CHO COD)
  if (orderResult) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-black text-stone-900">Đặt Hàng Thành Công!</h1>
          <p className="text-xs text-stone-500">
            Cảm ơn bạn đã lựa chọn mua sắm thiết bị tại TechZone Computer.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-mono font-bold text-stone-800">
            <span>Mã đơn: #ORD-{orderResult.id}</span>
            <button
              onClick={() => copyCode(`ORD-${orderResult.id}`)}
              className="text-[#c2410c] hover:opacity-80 p-0.5"
              title="Sao chép mã"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* COD Notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-left text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-700" />
              <span>Phương thức thanh toán khi nhận hàng (COD)</span>
            </p>
            <p className="text-[11px] text-amber-800/80">
              Nhân viên tổng đài TechZone sẽ sớm liên hệ xác nhận đơn hàng và điều phối giao hàng trong vòng 2 giờ.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 text-left text-xs space-y-2 text-stone-700">
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

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs sm:text-sm py-2.5 font-bold"
              onClick={() => nav('/products')}
            >
              Tiếp tục mua sắm
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-stone-300 text-stone-700 text-xs sm:text-sm py-2.5"
              onClick={() => window.print()}
            >
              In đơn hàng
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 3. CHECKOUT FORM
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

          {/* Payment Method Card - VNPAY ONLY */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b pb-3">
              <CreditCard className="w-4 h-4 text-[#c2410c]" />
              <span>2. Phương thức thanh toán</span>
            </h2>

            <div className="space-y-3">
              {[
                {
                  id: 'vnpay',
                  title: 'Thanh toán trực tuyến qua Cổng VNPay (Khuyên dùng)',
                  desc: 'Hỗ trợ quét mã VNPAY-QR, thẻ ATM nội địa 40+ ngân hàng và thẻ quốc tế Visa / Mastercard / JCB.',
                  icon: (
                    <div className="flex items-center gap-1 text-[#005ba9] font-black text-sm tracking-tight">
                      <span>VNPAY</span>
                    </div>
                  ),
                  badge: 'Cổng thanh toán chính thức',
                },
                {
                  id: 'cod',
                  title: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                  desc: 'Kiểm tra máy móc, phụ kiện và tem niêm phong trước khi thanh toán cho nhân viên giao hàng.',
                  icon: <Truck className="w-5 h-5 text-emerald-600" />,
                },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition select-none ${
                    f.pay === m.id
                      ? 'border-[#c2410c] bg-orange-50/50 ring-1 ring-[#c2410c]/30 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    checked={f.pay === m.id}
                    onChange={() => setF({ ...f, pay: m.id })}
                    className="accent-[#c2410c] h-4 w-4 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                        {m.icon}
                        <span>{m.title}</span>
                      </div>
                      {m.badge && (
                        <span className="text-[10px] font-bold text-[#005ba9] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-stone-500 leading-normal">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* VNPay Trust info box */}
            {f.pay === 'vnpay' && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  Sau khi bấm <strong>&ldquo;Thanh toán qua VNPay&rdquo;</strong>, hệ thống sẽ chuyển hướng bạn sang giao diện thanh toán an toàn chuẩn PCI-DSS của VNPay Sandbox/Production.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Items Summary & Submit CTA (5 cols) */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b pb-3">
              Tóm tắt đơn hàng ({items.length} món)
            </h2>

            {/* Product list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-stone-100">
              {items.map((i) => (
                <div key={i.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-800 truncate">{i.name}</p>
                    <p className="text-[11px] text-stone-400">
                      SL: {i.qty} × {formatVnd(i.price)}
                    </p>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">{formatVnd(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            {/* Total calculation */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Tạm tính hàng hóa:</span>
                <span className="font-semibold text-stone-800">{formatVnd(sub)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-stone-800">
                  {ship === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : formatVnd(ship)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 border-t pt-2">
                <span>Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#c2410c]">{formatVnd(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Đang xử lý đơn hàng...</span>
              ) : f.pay === 'vnpay' ? (
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Thanh toán qua VNPay ({formatVnd(total)})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>Xác nhận đặt hàng COD ({formatVnd(total)})</span>
                </span>
              )}
            </Button>
          </div>
        </aside>
      </form>
    </main>
  );
}
