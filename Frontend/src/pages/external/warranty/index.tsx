import { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { lookupWarranty, type WarrantyRecord } from '../../../services/warrantyService';
import { Button } from '../../../components/ui/Button';

export function WarrantyPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<WarrantyRecord[]>([]);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery !== undefined ? customQuery : query;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await lookupWarranty(q);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickSample = (sample: string) => {
    setQuery(sample);
    handleSearch(undefined, sample);
  };

  const getStatusBadge = (status: WarrantyRecord['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Bảo hành chính hãng còn hiệu lực
          </span>
        );
      case 'IN_REPAIR':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            Đang trong quy trình sửa chữa / RMA
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            Đã xong - Sẵn sàng bàn giao khách
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
            <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
            Hết hạn bảo hành
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-4">
      {/* 1. HERO & SEARCH BOX */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-orange-400 backdrop-blur-md border border-white/10">
            <ShieldCheck className="w-4 h-4" />
            <span>Cổng Dịch Vụ Hậu Mãi & Bảo Hành TechZone</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Tra cứu Thời Hạn Bảo Hành & Tiến Độ Sửa Chữa (RMA)
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Nhập <strong>Số Serial (S/N)</strong> trên vỏ hộp/máy tính, <strong>Số điện thoại</strong> mua hàng hoặc <strong>Mã biên nhận sửa chữa</strong> để kiểm tra trực tuyến 24/7.
          </p>

          {/* Search Form */}
          <form onSubmit={(e) => handleSearch(e)} className="pt-2">
            <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-white p-2 shadow-2xl">
              <div className="flex flex-1 items-center gap-2 px-3 text-stone-700">
                <Search className="w-5 h-5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ví dụ: SN-ASUS-98741 hoặc 0901234567..."
                  className="w-full text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="py-3 px-6 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-sm transition shrink-0"
              >
                {loading ? 'Đang tra cứu...' : 'Tra cứu ngay'}
              </Button>
            </div>
          </form>

          {/* Quick sample chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-stone-400">
            <span>Mẫu thử nhanh:</span>
            <button
              type="button"
              onClick={() => fillQuickSample('SN-ASUS-98741')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-orange-300 font-mono transition"
            >
              SN-ASUS-98741 (Đang sửa)
            </button>
            <button
              type="button"
              onClick={() => fillQuickSample('SN-DELL-55219')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 font-mono transition"
            >
              SN-DELL-55219 (Còn hạn)
            </button>
            <button
              type="button"
              onClick={() => fillQuickSample('0901234567')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-300 font-mono transition"
            >
              0901234567 (SĐT)
            </button>
          </div>
        </div>

        {/* Decorative graphic background */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <ShieldCheck className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* 2. SEARCH RESULTS */}
      {searched && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-stone-900">
              Kết quả tra cứu ({results.length})
            </h2>
            <span className="text-xs text-stone-500 font-mono">
              Từ khóa: &quot;{query}&quot;
            </span>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-800">Không tìm thấy thông tin bảo hành</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Quý khách vui lòng kiểm tra lại mã Serial (S/N) in trên tem phụ của sản phẩm hoặc liên hệ hotline <strong>1900.8888</strong> để được kỹ thuật viên hỗ trợ tra cứu trực tiếp.
              </p>
            </div>
          ) : (
            results.map((rec) => (
              <div
                key={rec.serialNumber}
                className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Result Item Header */}
                <div className="border-b border-stone-100 bg-stone-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#c2410c] uppercase tracking-wider">
                      {rec.productBrand} · {rec.productCategory}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">
                      {rec.productName}
                    </h3>
                  </div>
                  <div>{getStatusBadge(rec.status)}</div>
                </div>

                {/* Info Grid */}
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                    <span className="text-stone-400 block mb-1">Mã Serial / S/N:</span>
                    <strong className="font-mono text-sm text-stone-900">{rec.serialNumber}</strong>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                    <span className="text-stone-400 block mb-1">Ngày mua hàng:</span>
                    <strong className="text-sm text-stone-800">{new Date(rec.purchaseDate).toLocaleDateString('vi-VN')}</strong>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                    <span className="text-stone-400 block mb-1">Thời hạn bảo hành:</span>
                    <strong className="text-sm text-emerald-700">{rec.warrantyPeriodMonths} tháng chính hãng</strong>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                    <span className="text-stone-400 block mb-1">Hạn bảo hành đến:</span>
                    <strong className="text-sm text-stone-900">{new Date(rec.warrantyExpiryDate).toLocaleDateString('vi-VN')}</strong>
                  </div>
                </div>

                {/* REPAIR TIMELINE IF AVAILABLE */}
                {rec.repairTimeline && (
                  <div className="border-t border-stone-100 bg-gradient-to-b from-stone-50/40 to-white p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#c2410c]" />
                        <h4 className="text-sm font-bold text-stone-900">
                          Tiến Độ Sửa Chữa & Bảo Hành (RMA: {rec.rmaCode})
                        </h4>
                      </div>
                      <span className="text-xs text-stone-500">
                        Khách hàng: <strong>{rec.customerName}</strong> ({rec.customerPhone})
                      </span>
                    </div>

                    {rec.repairIssue && (
                      <div className="rounded-xl bg-orange-50 border border-orange-200/60 p-3 text-xs text-orange-950">
                        <strong>Tình trạng báo lỗi khi tiếp nhận:</strong> {rec.repairIssue}
                      </div>
                    )}

                    {/* Stepper Timeline */}
                    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                      {rec.repairTimeline.map((step) => (
                        <div key={step.step} className="relative">
                          <div
                            className={`absolute -left-6 sm:-left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                              step.completed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {step.completed ? '✓' : step.step}
                          </div>
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h5 className={`text-xs sm:text-sm font-bold ${step.completed ? 'text-stone-900' : 'text-stone-500'}`}>
                                {step.title}
                              </h5>
                              <span className="text-[11px] font-mono text-stone-400">{step.date}</span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}

      {/* 3. POLICIES & CENTERS STRIP */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#c2410c] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">1 Đổi 1 Trong 30 Ngày</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Nếu sản phẩm phần cứng phát sinh lỗi do nhà sản xuất trong 30 ngày đầu tiên, TechZone đổi mới sản phẩm ngay tại quầy.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">Bảo Hành Nhanh Chuẩn Hãng</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Thời gian xử lý thông thường từ 3 - 7 ngày làm việc. Quý khách được mượn máy tính/laptop tương đương để phục vụ công việc.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">Trạm Tiếp Nhận Toàn Quốc</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Tiếp nhận tại 2 Showroom Hà Nội & TP.HCM hoặc hỗ trợ chuyển phát nhanh miễn phí 2 chiều qua Viettel Post.
          </p>
        </div>
      </section>
    </div>
  );
}
export default WarrantyPage;
