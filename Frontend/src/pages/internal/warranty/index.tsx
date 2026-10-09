import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Wrench,
  Plus,
  X,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pencil,
} from 'lucide-react';
import {
  fetchAdminWarranties,
  registerSerial,
  updateClaimStatus,
  addRepairEvent,
  type AdminWarrantyRow,
} from '../../../services/warrantyService';
import { fetchProducts } from '../../../services/productService';
import type { Product } from '../../../types';
import { useToast } from '../../../stores/toastStore';

const CLAIM_STATUSES = ['RECEIVED', 'DIAGNOSED', 'REPAIRING', 'TESTING', 'RESOLVED'] as const;

export function AdminWarrantyPage() {
  const toast = useToast();
  const [rows, setRows] = useState<AdminWarrantyRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  // Register serial modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [savingSerial, setSavingSerial] = useState(false);
  const [newSerial, setNewSerial] = useState({
    productId: '',
    serialNumber: '',
    warrantyMonths: 12,
    customerEmail: '',
  });

  // Repair event modal
  const [selectedRow, setSelectedRow] = useState<AdminWarrantyRow | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    completed: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [warrantyData, productData] = await Promise.all([
        fetchAdminWarranties(),
        fetchProducts(),
      ]);
      setRows(warrantyData || []);
      setProducts(productData || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải dữ liệu bảo hành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegisterSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial.productId || !newSerial.serialNumber.trim()) {
      toast.error('Vui lòng chọn sản phẩm và nhập số serial.');
      return;
    }
    setSavingSerial(true);
    try {
      await registerSerial({
        productId: Number(newSerial.productId),
        serialNumber: newSerial.serialNumber.trim(),
        warrantyMonths: Number(newSerial.warrantyMonths) || undefined,
        customerEmail: newSerial.customerEmail.trim() || undefined,
      });
      toast.success('Đã đăng ký serial & kích hoạt bảo hành.');
      setShowRegisterModal(false);
      setNewSerial({ productId: '', serialNumber: '', warrantyMonths: 12, customerEmail: '' });
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đăng ký serial');
    } finally {
      setSavingSerial(false);
    }
  };

  const handleClaimStatusChange = async (row: AdminWarrantyRow, status: string) => {
    if (!row.claimId) return;
    try {
      const updated = await updateClaimStatus(row.claimId, status);
      setRows((prev) => prev.map((r) => (r.serialId === updated.serialId ? updated : r)));
      toast.success(`Đã cập nhật claim ${updated.rmaCode} → ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái claim');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRow?.claimId) return;
    if (!newEvent.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bước xử lý.');
      return;
    }
    setSavingEvent(true);
    try {
      const updated = await addRepairEvent(selectedRow.claimId, {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        completed: newEvent.completed,
      });
      setRows((prev) => prev.map((r) => (r.serialId === updated.serialId ? updated : r)));
      toast.success('Đã thêm bước xử lý vào timeline.');
      setSelectedRow(null);
      setNewEvent({ title: '', description: '', completed: false });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể thêm bước xử lý');
    } finally {
      setSavingEvent(false);
    }
  };

  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE
          </span>
        );
      case 'IN_REPAIR':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
            <Wrench className="h-3.5 w-3.5" /> IN_REPAIR
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
            <Package className="h-3.5 w-3.5" /> READY_FOR_PICKUP
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
            <AlertCircle className="h-3.5 w-3.5" /> EXPIRED
          </span>
        );
      default:
        return <span className="rounded bg-stone-100 px-2 py-0.5 text-xs">{status || '—'}</span>;
    }
  };

  const getClaimBadge = (status?: string | null) => {
    const styles: Record<string, string> = {
      RECEIVED: 'bg-stone-100 text-stone-700 border-stone-200',
      DIAGNOSED: 'bg-sky-100 text-sky-800 border-sky-200',
      REPAIRING: 'bg-amber-100 text-amber-800 border-amber-200',
      TESTING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    return (
      <span
        className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${styles[status || ''] || 'bg-stone-100 text-stone-700 border-stone-200'}`}
      >
        {status || '—'}
      </span>
    );
  };

  const filteredRows =
    filter === 'ALL' ? rows : rows.filter((r) => r.status === filter);

  const withClaims = rows.filter((r) => r.claimId);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Warranty & RMA</h1>
          <p className="text-xs text-stone-500">
            Quản lý serial, bảo hành điện tử, yêu cầu bảo hành và quy trình sửa chữa
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] transition"
        >
          + Đăng ký serial / bảo hành
        </button>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng serial đang quản lý', value: rows.length, icon: ShieldCheck, tint: 'bg-stone-900 text-white' },
          { label: 'Còn hạn bảo hành', value: rows.filter((r) => r.status === 'ACTIVE').length, icon: CheckCircle2, tint: 'bg-emerald-100 text-emerald-800' },
          { label: 'Đang sửa chữa (RMA)', value: rows.filter((r) => r.status === 'IN_REPAIR').length, icon: Wrench, tint: 'bg-amber-100 text-amber-800' },
          { label: 'Sẵn sàng trả khách', value: rows.filter((r) => r.status === 'READY_FOR_PICKUP').length, icon: Package, tint: 'bg-blue-100 text-blue-800' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">{card.label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.tint}`}>
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <strong className="mt-2 block text-2xl font-black text-stone-900">{card.value}</strong>
          </div>
        ))}
      </div>

      {/* Claims needing action */}
      {withClaims.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
          <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
            <Clock className="h-4 w-4 text-amber-700" />
            <h2 className="text-sm font-bold text-stone-900">
              Claims đang xử lý ({withClaims.length})
            </h2>
          </div>
          <div className="mt-3 space-y-2">
            {withClaims.map((r) => (
              <div
                key={r.serialId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-amber-200/60 bg-white p-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-mono font-bold text-stone-900">{r.rmaCode}</span>
                  <span className="mx-2 text-stone-300">|</span>
                  <span className="font-medium text-stone-800">{r.productName}</span>
                  <div className="mt-0.5 text-stone-500">
                    {r.customerName} · {r.customerPhone} · Serial {r.serialNumber}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getClaimBadge(r.claimStatus)}
                  <select
                    value={r.claimStatus || 'RECEIVED'}
                    onChange={(e) => handleClaimStatusChange(r, e.target.value)}
                    className="rounded-lg border bg-white px-2 py-1 text-xs text-stone-700 shadow-2xs"
                  >
                    {CLAIM_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setSelectedRow(r);
                      setNewEvent({ title: '', description: '', completed: false });
                    }}
                    className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 font-semibold text-stone-700 hover:border-[#c2410c] hover:text-[#c2410c] transition"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Thêm bước</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main warranty table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-bold text-stone-900">Toàn bộ serial & bảo hành</h2>
          <div className="flex gap-1.5 text-xs">
            {['ALL', 'ACTIVE', 'IN_REPAIR', 'READY_FOR_PICKUP', 'EXPIRED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  filter === f
                    ? 'bg-[#c2410c] text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {f === 'ALL' ? 'Tất cả' : f}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-stone-500">Đang tải dữ liệu...</div>
        ) : filteredRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-500">
            Không có serial nào ở trạng thái này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">Serial</th>
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Bảo hành</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Claim / RMA</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {filteredRows.map((r) => (
                  <tr key={r.serialId} className="hover:bg-stone-50">
                    <td className="p-3 font-mono text-xs font-bold text-stone-900">{r.serialNumber}</td>
                    <td className="p-3 max-w-xs">
                      <div className="truncate font-medium text-stone-900">{r.productName}</div>
                      <span className="text-[11px] text-stone-400">{r.productBrand}</span>
                    </td>
                    <td className="p-3">
                      {r.customerName ? (
                        <div>
                          <div className="font-medium text-stone-800">{r.customerName}</div>
                          <span className="text-[11px] text-stone-400">{r.customerPhone || r.customerEmail}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400">Chưa gán</span>
                      )}
                    </td>
                    <td className="p-3 text-xs">
                      <div className="font-semibold text-stone-800">{r.warrantyMonths} tháng</div>
                      <span className="text-stone-400">
                        Đến {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </td>
                    <td className="p-3">{getStatusBadge(r.status)}</td>
                    <td className="p-3 text-xs">
                      {r.claimId ? (
                        <div>
                          <div className="font-mono font-bold text-stone-900">{r.rmaCode}</div>
                          <div className="mt-0.5">{getClaimBadge(r.claimStatus)}</div>
                        </div>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register serial modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 sm:p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">Đăng ký serial & kích hoạt bảo hành</h2>
              <button type="button" onClick={() => setShowRegisterModal(false)} className="text-stone-400 hover:text-stone-700" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterSerial} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-600">Sản phẩm *</label>
                <select
                  required
                  value={newSerial.productId}
                  onChange={(e) => setNewSerial({ ...newSerial, productId: e.target.value })}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="">— Chọn sản phẩm —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku ? `${p.sku} · ` : ''}{p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Số serial *</label>
                  <input
                    required
                    value={newSerial.serialNumber}
                    onChange={(e) => setNewSerial({ ...newSerial, serialNumber: e.target.value })}
                    placeholder="SN-TZLT-98741"
                    className="w-full rounded border px-3 py-2 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Bảo hành (tháng)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={newSerial.warrantyMonths}
                    onChange={(e) => setNewSerial({ ...newSerial, warrantyMonths: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-600">
                  Email khách hàng (tùy chọn — gán serial cho khách)
                </label>
                <input
                  type="email"
                  value={newSerial.customerEmail}
                  onChange={(e) => setNewSerial({ ...newSerial, customerEmail: e.target.value })}
                  placeholder="customer@techzone.vn"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="rounded border px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingSerial}
                  className="rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] disabled:opacity-60"
                >
                  {savingSerial ? 'Đang lưu...' : 'Kích hoạt bảo hành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add repair event modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 sm:p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                Thêm bước xử lý · RMA {selectedRow.rmaCode}
              </h2>
              <button type="button" onClick={() => setSelectedRow(null)} className="text-stone-400 hover:text-stone-700" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current timeline */}
            {selectedRow.repairTimeline && selectedRow.repairTimeline.length > 0 && (
              <div className="mb-4 space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs">
                <p className="font-semibold text-stone-600">Timeline hiện tại:</p>
                {selectedRow.repairTimeline.map((s) => (
                  <div key={s.step} className="flex items-start gap-2">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        s.completed ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {s.completed ? '✓' : s.step}
                    </span>
                    <div>
                      <span className="font-medium text-stone-800">{s.title}</span>
                      {s.description && <p className="text-stone-500">{s.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-600">Tiêu đề bước *</label>
                <input
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Ví dụ: Chạy stress test kiểm chuẩn 24H"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-600">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Kết quả kiểm tra, linh kiện thay thế, ghi chú cho khách hàng..."
                  className="w-full resize-y rounded border px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={newEvent.completed}
                  onChange={(e) => setNewEvent({ ...newEvent, completed: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 accent-[#c2410c]"
                />
                Bước này đã hoàn tất
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRow(null)}
                  className="rounded border px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] disabled:opacity-60"
                >
                  {savingEvent ? 'Đang lưu...' : 'Thêm bước xử lý'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminWarrantyPage;
