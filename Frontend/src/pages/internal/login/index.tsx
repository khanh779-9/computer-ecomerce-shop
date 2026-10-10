import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../stores/authStore';
import { useToast } from '../../../stores/toastStore';

export function InternalLoginPage() {
  const { isAuthenticated, user, loginInternal } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user?.role === 'ADMIN' && user?.scope === 'internal') {
    return <Navigate to="/internal" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Vui lòng nhập email công việc hợp lệ.');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      // loginInternal tự xóa phiên khách hàng (external) đang còn trước khi kích hoạt phiên nội bộ
      await loginInternal(email, password);
      toast.success('Đăng nhập khu vực nội bộ thành công.');
      navigate('/internal', { replace: true });
    } catch (error) {
      // loginInternal tự dọn token internal khi thất bại — không logout phiên khác đang chạy
      toast.error(error instanceof Error ? error.message : 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-sm font-semibold text-stone-500 hover:text-[#c2410c]">
            TechZone Computer
          </Link>
          <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-stone-900">Đăng nhập trang nội bộ</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
            Dành cho nhân viên và quản trị viên TechZone. Tài khoản mua hàng đăng nhập ở trang khách hàng.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-700">Email công việc</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ten@techzone.vn"
                  className="w-full rounded-lg border border-stone-300 py-2.5 pl-9 pr-3 text-sm focus:border-[#c2410c] focus:outline-none"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-700">Mật khẩu</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full rounded-lg border border-stone-300 py-2.5 pl-9 pr-3 text-sm focus:border-[#c2410c] focus:outline-none"
                />
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg bg-[#c2410c] py-2.5 text-sm font-bold text-white hover:bg-[#9a3412] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang kiểm tra...' : 'Đăng nhập nội bộ'}
          </Button>

          <div className="mt-5 border-t border-stone-100 pt-4 text-center">
            <Link to="/" className="text-xs font-semibold text-stone-500 hover:text-[#c2410c]">
              Quay lại trang mua hàng
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
