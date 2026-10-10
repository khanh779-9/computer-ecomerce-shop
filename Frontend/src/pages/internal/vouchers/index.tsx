import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X, Tag, Power, Copy } from 'lucide-react';
import {
  fetchAllVouchers,
  createVoucher,
  updateVoucher,
  setVoucherActive,
  deleteVoucher,
  type Voucher,
} from '../../../services/voucherService';
import { formatVnd } from '../../../lib/cart';
import { useToast } from '../../../stores/toastStore';

interface VoucherFormState {
  code: string;
  description: string;
  discountAmount: number;
  discountPercent: number;
  minOrderAmount: number;
  isFreeShip: boolean;
  isActive: boolean;
}

const emptyVoucher: VoucherFormState = {
  code: '',
  description: '',
  discountAmount: 0,
  discountPercent: 0,
  minOrderAmount: 0,
  isFreeShip: false,
  isActive: true,
};

export default function VouchersPage() {
  const toast = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VoucherFormState>(emptyVoucher);

  const loadData = async () => {
    setLoading(true);
    try {
      setVouchers(await fetchAllVouchers());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (voucher?: Voucher) => {
    if (voucher) {
      setEditingId(voucher.id);
      setForm({
        code: voucher.code,
        description: voucher.description,
        discountAmount: voucher.discountAmount,
        discountPercent: voucher.discountPercent,
        minOrderAmount: voucher.minOrderAmount,
        isFreeShip: voucher.isFreeShip,
        isActive: voucher.isActive,
      });
    } else {
      setEditingId(null);
      setForm(emptyVoucher);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.description.trim()) {
      toast.error('Vui lòng nhập mã và mô tả voucher.');
      return;
    }
    setSaving(true);
    try {
      const wasEditing = editingId !== null;
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountAmount: Number(form.discountAmount) || 0,
        discountPercent: Number(form.discountPercent) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
      };
      if (wasEditing) {
        await updateVoucher(editingId!, payload);
      } else {
        await createVoucher(payload);
      }
      toast.success(wasEditing ? 'Đã cập nhật voucher.' : 'Đã tạo voucher mới.');
      setShowModal(false);
      setEditingId(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (voucher: Voucher) => {
    try {
      const updated = await setVoucherActive(voucher.id, !voucher.isActive);
      setVouchers((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      toast.success(updated.isActive ? `Đã bật voucher ${updated.code}.` : `Đã tạm dừng voucher ${updated.code}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái voucher');
    }
  };

  const handleDelete = async (voucher: Voucher) => {
    if (!window.confirm(`Xóa voucher "${voucher.code}"?`)) return;
    try {
      await deleteVoucher(voucher.id);
      setVouchers((prev) => prev.filter((v) => v.id !== voucher.id));
      toast.info('Đã xóa voucher.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa voucher');
    }
  };

  const filtered =
    filter === 'ALL' ? vouchers : vouchers.filter((v) => (filter === 'ACTIVE' ? v.isActive : !v.isActive));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#c2410c]"><Tag className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Vouchers</h1>
            <p className="text-xs text-stone-500">Quản lý mã giảm giá và chương trình khuyến mãi</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] transition"
        >
          <Plus className="h-4 w-4" /> Thêm voucher
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-bold text-stone-900">Danh sách voucher ({vouchers.length})</h2>
          <div className="flex gap-1.5 text-xs">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'ACTIVE', label: 'Đang chạy' },
              { id: 'PAUSED', label: 'Tạm dừng' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  filter === f.id ? 'bg-[#c2410c] text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-stone-500">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-500">Không có voucher nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">Mã Voucher</th>
                  <th className="p-3">Mô tả</th>
                  <th className="p-3">Mức giảm</th>
                  <th className="p-3">Đơn tối thiểu</th>
                  <th className="p-3 text-center">Freeship</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(v.code);
                          toast.success(`Đã sao chép mã ${v.code}`);
                        }}
                        className="flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-1 text-[#c2410c] hover:bg-orange-100 transition"
                        title="Sao chép mã"
                      >
                        {v.code} <Copy className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="p-3 font-medium">{v.description}</td>
                    <td className="p-3 font-bold text-[#c2410c]">
                      {v.discountPercent > 0 ? `${v.discountPercent}%` : formatVnd(v.discountAmount)}
                    </td>
                    <td className="p-3 text-stone-600">{formatVnd(v.minOrderAmount)}</td>
                    <td className="p-3 text-center">
                      {v.isFreeShip ? (
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Có</span>
                      ) : (
                        <span className="text-xs text-stone-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                        {v.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(v)}
                          className={`rounded p-1.5 ${v.isActive ? 'text-stone-500 hover:bg-amber-50 hover:text-amber-700' : 'text-stone-400 hover:bg-emerald-50 hover:text-emerald-700'}`}
                          aria-label={v.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                          title={v.isActive ? 'Tạm dừng voucher' : 'Kích hoạt voucher'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(v)}
                          className="rounded p-1.5 text-stone-500 hover:bg-orange-50 hover:text-[#c2410c]"
                          aria-label={`Sửa ${v.code}`}
                          title="Sửa voucher"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          className="rounded p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-700"
                          aria-label={`Xóa ${v.code}`}
                          title="Xóa voucher"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Voucher modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 sm:p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">{editingId ? 'Chỉnh sửa voucher' : 'Thêm voucher mới'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Mã voucher *</label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="TECHZONE50"
                    className="w-full rounded border px-3 py-2 font-mono text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Đơn tối thiểu (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-600">Mô tả *</label>
                <input
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Giảm 50.000đ cho đơn linh kiện từ 1.000.000đ"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Giảm tiền mặt (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.discountAmount}
                    onChange={(e) => setForm({ ...form, discountAmount: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Giảm theo %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={form.isFreeShip}
                    onChange={(e) => setForm({ ...form, isFreeShip: e.target.checked })}
                    className="h-4 w-4 rounded border-stone-300 accent-[#c2410c]"
                  />
                  Miễn phí giao hàng
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-stone-300 accent-[#c2410c]"
                  />
                  Đang hoạt động
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : 'Lưu voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
