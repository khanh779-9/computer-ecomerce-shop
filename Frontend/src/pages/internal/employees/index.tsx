import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X, Users, Lock, Unlock, ShieldCheck } from 'lucide-react';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  setEmployeeStatus,
  deleteEmployee,
  type Employee,
} from '../../../services/employeeService';
import { useAuth } from '../../../stores/authStore';
import { useToast } from '../../../stores/toastStore';

interface EmployeeFormState {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  role: string;
}

const ROLES = ['ADMIN', 'STAFF', 'SUPPORT'];

const emptyForm: EmployeeFormState = {
  email: '',
  fullName: '',
  phone: '',
  password: '',
  role: 'STAFF',
};

function formatDate(value?: string | null) {
  if (!value) return 'Chưa đăng nhập';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EmployeesPage() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);

  const loadData = async () => {
    setLoading(true);
    try {
      setEmployees(await fetchEmployees());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id);
      setForm({
        email: employee.email,
        fullName: employee.fullName,
        phone: employee.phone || '',
        password: '',
        role: employee.role,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.fullName.trim()) {
      toast.error('Vui lòng nhập email và họ tên nhân viên.');
      return;
    }
    setSaving(true);
    try {
      const wasEditing = editingId !== null;
      const payload = {
        email: form.email.trim().toLowerCase(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        password: form.password || undefined,
      };
      if (wasEditing) {
        await updateEmployee(editingId!, payload);
      } else {
        await createEmployee(payload);
      }
      toast.success(wasEditing ? 'Đã cập nhật nhân viên.' : 'Đã tạo tài khoản nhân viên mới.');
      setShowModal(false);
      setEditingId(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu nhân viên');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    const next = employee.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    if (next === 'LOCKED' && currentUser && employee.id === Number(currentUser.id)) {
      toast.error('Không thể tự khóa tài khoản đang đăng nhập.');
      return;
    }
    try {
      const updated = await setEmployeeStatus(employee.id, next);
      setEmployees((prev) => prev.map((e2) => (e2.id === updated.id ? updated : e2)));
      toast.success(updated.status === 'ACTIVE' ? `Đã mở khóa tài khoản ${updated.email}.` : `Đã khóa tài khoản ${updated.email}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái tài khoản');
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (currentUser && employee.id === Number(currentUser.id)) {
      toast.error('Không thể xóa tài khoản đang đăng nhập.');
      return;
    }
    if (!window.confirm(`Xóa tài khoản nhân viên "${employee.email}"?`)) return;
    try {
      await deleteEmployee(employee.id);
      setEmployees((prev) => prev.filter((e2) => e2.id !== employee.id));
      toast.info('Đã xóa tài khoản nhân viên.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa nhân viên');
    }
  };

  const filtered = employees.filter((e2) =>
    e2.fullName.toLowerCase().includes(search.trim().toLowerCase()) ||
    e2.email.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#c2410c]"><Users className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Employee</h1>
            <p className="text-xs text-stone-500">Tài khoản nhân viên và quyền truy cập trang nội bộ</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] transition"
        >
          <Plus className="h-4 w-4" /> Thêm nhân viên
        </button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-bold text-stone-900">Danh sách nhân viên ({employees.length})</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-56 rounded-lg border border-stone-300 px-3 py-1.5 text-xs focus:border-[#c2410c] focus:outline-none"
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-stone-500">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-500">Không có nhân viên nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">Nhân viên</th>
                  <th className="p-3">Vai trò</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3">Đăng nhập gần nhất</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {filtered.map((e2) => (
                  <tr key={e2.id} className="hover:bg-stone-50">
                    <td className="p-3">
                      <div className="font-semibold text-stone-900">{e2.fullName}</div>
                      <div className="text-xs text-stone-500">{e2.email}</div>
                      {e2.phone && <div className="text-[11px] text-stone-400">{e2.phone}</div>}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold ${e2.role === 'ADMIN' ? 'bg-stone-900 text-white' : 'bg-orange-50 text-[#c2410c] border border-orange-200'}`}>
                        {e2.role === 'ADMIN' && <ShieldCheck className="h-3 w-3" />}
                        {e2.role}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${e2.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                        {e2.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-stone-500">{formatDate(e2.lastLoginAt)}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(e2)}
                          className="rounded p-1.5 text-stone-500 hover:bg-amber-50 hover:text-amber-700"
                          aria-label={e2.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                          title={e2.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {e2.status === 'ACTIVE' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => openModal(e2)}
                          className="rounded p-1.5 text-stone-500 hover:bg-orange-50 hover:text-[#c2410c]"
                          aria-label={`Sửa ${e2.fullName}`}
                          title="Sửa nhân viên"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(e2)}
                          className="rounded p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-700"
                          aria-label={`Xóa ${e2.fullName}`}
                          title="Xóa nhân viên"
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

      {/* Employee modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 sm:p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">{editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="staff@techzone.vn"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Họ tên *</label>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Nguyễn Văn B"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0901234567"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600">Vai trò *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-600">
                  Mật khẩu {editingId ? '(để trống nếu không đổi)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  minLength={editingId ? undefined : 6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
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
                  {saving ? 'Đang lưu...' : 'Lưu nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
