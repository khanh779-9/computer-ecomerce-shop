import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X, SlidersHorizontal, Power } from 'lucide-react';
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  type Brand,
  type BrandPayload,
} from '../../../services/brandService';
import { useToast } from '../../../stores/toastStore';

export default function BrandsPage() {
  const toast = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BrandPayload>({ name: '', slug: '', isActive: true });

  const loadData = async () => {
    setLoading(true);
    try {
      setBrands(await fetchBrands());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải danh sách hãng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingId(brand.id);
      setForm({ name: brand.name, slug: brand.slug, isActive: brand.isActive });
    } else {
      setEditingId(null);
      setForm({ name: '', slug: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên hãng.');
      return;
    }
    setSaving(true);
    try {
      const wasEditing = editingId !== null;
      if (wasEditing) {
        await updateBrand(editingId!, form);
      } else {
        await createBrand(form);
      }
      toast.success(wasEditing ? 'Đã cập nhật hãng.' : 'Đã thêm hãng mới.');
      setShowModal(false);
      setEditingId(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu hãng');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      const updated = await updateBrand(brand.id, { name: brand.name, slug: brand.slug, isActive: !brand.isActive });
      setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      toast.success(updated.isActive ? `Đã bật hãng ${updated.name}.` : `Đã tạm dừng hãng ${updated.name}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái hãng');
    }
  };

  const handleDelete = async (brand: Brand) => {
    const note = brand.productCount > 0
      ? `Hãng "${brand.name}" đang có ${brand.productCount} sản phẩm liên kết. Xóa hãng sẽ bỏ liên kết (sản phẩm không bị mất). Tiếp tục?`
      : `Xóa hãng "${brand.name}"?`;
    if (!window.confirm(note)) return;
    try {
      await deleteBrand(brand.id);
      setBrands((prev) => prev.filter((b) => b.id !== brand.id));
      toast.info('Đã xóa hãng.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa hãng');
    }
  };

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#c2410c]"><SlidersHorizontal className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Hãng / thương hiệu</h1>
            <p className="text-xs text-stone-500">Quản lý các hãng đang có trong catalog sản phẩm</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] transition"
        >
          <Plus className="h-4 w-4" /> Thêm hãng
        </button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-bold text-stone-900">Danh sách hãng ({brands.length})</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm hãng..."
            className="w-48 rounded-lg border border-stone-300 px-3 py-1.5 text-xs focus:border-[#c2410c] focus:outline-none"
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-stone-500">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-500">Không có hãng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">Hãng</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3 text-center">Sản phẩm</th>
                  <th className="p-3 text-center">Tồn kho</th>
                  <th className="p-3 text-center">Đã bán</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="p-3 font-semibold text-stone-900">{b.name}</td>
                    <td className="p-3 font-mono text-xs text-stone-500">{b.slug}</td>
                    <td className="p-3 text-center">{b.productCount}</td>
                    <td className="p-3 text-center">{b.totalStock}</td>
                    <td className="p-3 text-center text-stone-500">{b.totalSold}</td>
                    <td className="p-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                        {b.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(b)}
                          className={`rounded p-1.5 ${b.isActive ? 'text-stone-500 hover:bg-amber-50 hover:text-amber-700' : 'text-stone-400 hover:bg-emerald-50 hover:text-emerald-700'}`}
                          aria-label={b.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                          title={b.isActive ? 'Tạm dừng hãng' : 'Kích hoạt lại hãng'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(b)}
                          className="rounded p-1.5 text-stone-500 hover:bg-orange-50 hover:text-[#c2410c]"
                          aria-label={`Sửa ${b.name}`}
                          title="Sửa hãng"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          className="rounded p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-700"
                          aria-label={`Xóa ${b.name}`}
                          title="Xóa hãng"
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

      {/* Brand modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">{editingId ? 'Chỉnh sửa hãng' : 'Thêm hãng mới'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-600">Tên hãng *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Asus, Dell, MSI..."
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-600">Slug (tùy chọn — tự sinh từ tên)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="asus"
                  className="w-full rounded border px-3 py-2 font-mono text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 accent-[#c2410c]"
                />
                Hãng đang hoạt động
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
                  {saving ? 'Đang lưu...' : 'Lưu hãng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
