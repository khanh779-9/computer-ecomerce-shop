import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X, Warehouse, Power, Globe, Mail, Phone } from 'lucide-react';
import {
  fetchManufacturers,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  type Manufacturer,
  type ManufacturerPayload,
} from '../../../services/manufacturerService';
import { useToast } from '../../../stores/toastStore';

interface FormState extends ManufacturerPayload {
  name: string;
}

export default function ManufacturersPage() {
  const toast = useToast();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ name: '', slug: '', website: '', contactEmail: '', phone: '', isActive: true });

  const loadData = async () => {
    setLoading(true);
    try {
      setManufacturers(await fetchManufacturers());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải danh sách nhà sản xuất');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (mfr?: Manufacturer) => {
    if (mfr) {
      setEditingId(mfr.id);
      setForm({
        name: mfr.name,
        slug: mfr.slug,
        website: mfr.website || '',
        contactEmail: mfr.contactEmail || '',
        phone: mfr.phone || '',
        isActive: mfr.isActive,
      });
    } else {
      setEditingId(null);
      setForm({ name: '', slug: '', website: '', contactEmail: '', phone: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên nhà sản xuất.');
      return;
    }
    setSaving(true);
    try {
      const wasEditing = editingId !== null;
      if (wasEditing) {
        await updateManufacturer(editingId!, form);
      } else {
        await createManufacturer(form);
      }
      toast.success(wasEditing ? 'Đã cập nhật nhà sản xuất.' : 'Đã thêm nhà sản xuất mới.');
      setShowModal(false);
      setEditingId(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu nhà sản xuất');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (mfr: Manufacturer) => {
    try {
      const updated = await updateManufacturer(mfr.id, {
        name: mfr.name,
        slug: mfr.slug,
        website: mfr.website || undefined,
        contactEmail: mfr.contactEmail || undefined,
        phone: mfr.phone || undefined,
        isActive: !mfr.isActive,
      });
      setManufacturers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      toast.success(updated.isActive ? `Đã bật nhà sản xuất ${updated.name}.` : `Đã tạm dừng nhà sản xuất ${updated.name}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái nhà sản xuất');
    }
  };

  const handleDelete = async (mfr: Manufacturer) => {
    const note = mfr.productCount > 0
      ? `Nhà sản xuất "${mfr.name}" đang có ${mfr.productCount} sản phẩm liên kết. Xóa sẽ bỏ liên kết (sản phẩm không bị mất). Tiếp tục?`
      : `Xóa nhà sản xuất "${mfr.name}"?`;
    if (!window.confirm(note)) return;
    try {
      await deleteManufacturer(mfr.id);
      setManufacturers((prev) => prev.filter((m) => m.id !== mfr.id));
      toast.info('Đã xóa nhà sản xuất.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa nhà sản xuất');
    }
  };

  const filtered = manufacturers.filter((m) =>
    m.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#c2410c]"><Warehouse className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Nhà sản xuất</h1>
            <p className="text-xs text-stone-500">Quản lý nhà sản xuất và thông tin nguồn hàng</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] transition"
        >
          <Plus className="h-4 w-4" /> Thêm nhà sản xuất
        </button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-bold text-stone-900">Danh sách nhà sản xuất ({manufacturers.length})</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nhà sản xuất..."
            className="w-48 rounded-lg border border-stone-300 px-3 py-1.5 text-xs focus:border-[#c2410c] focus:outline-none"
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-stone-500">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-500">Chưa có nhà sản xuất nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">Nhà sản xuất</th>
                  <th className="p-3">Liên hệ</th>
                  <th className="p-3">Website</th>
                  <th className="p-3 text-center">Sản phẩm</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50">
                    <td className="p-3 font-semibold text-stone-900">{m.name}</td>
                    <td className="p-3 text-xs text-stone-600">
                      {m.contactEmail && (
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-stone-400" />{m.contactEmail}</div>
                      )}
                      {m.phone && (
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-stone-400" />{m.phone}</div>
                      )}
                      {!m.contactEmail && !m.phone && <span className="text-stone-400">—</span>}
                    </td>
                    <td className="p-3 text-xs">
                      {m.website ? (
                        <a href={m.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-700 hover:underline">
                          <Globe className="h-3 w-3" />{m.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">{m.productCount}</td>
                    <td className="p-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${m.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                        {m.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(m)}
                          className={`rounded p-1.5 ${m.isActive ? 'text-stone-500 hover:bg-amber-50 hover:text-amber-700' : 'text-stone-400 hover:bg-emerald-50 hover:text-emerald-700'}`}
                          aria-label={m.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                          title={m.isActive ? 'Tạm dừng NSX' : 'Kích hoạt lại NSX'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(m)}
                          className="rounded p-1.5 text-stone-500 hover:bg-orange-50 hover:text-[#c2410c]"
                          aria-label={`Sửa ${m.name}`}
                          title="Sửa nhà sản xuất"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="rounded p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-700"
                          aria-label={`Xóa ${m.name}`}
                          title="Xóa nhà sản xuất"
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

      {/* Manufacturer modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 sm:p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">{editingId ? 'Chỉnh sửa nhà sản xuất' : 'Thêm nhà sản xuất mới'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Tên nhà sản xuất *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: ASUSTeK Computer"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Slug (tùy chọn)</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="asustek"
                    className="w-full rounded border px-3 py-2 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-600">Website</label>
                <input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://www.asus.com/vn/"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Email liên hệ</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="vn-support@asus.com"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="19001231"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 accent-[#c2410c]"
                />
                Nhà sản xuất đang hoạt động
              </label>
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
                  {saving ? 'Đang lưu...' : 'Lưu nhà sản xuất'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
