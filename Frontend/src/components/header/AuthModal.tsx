import { useState } from 'react';
import { useAuth } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';
import { Button } from '../ui/Button';
import { X, User, Lock, Mail, Sparkles, ShieldCheck } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register, openAuthModal } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    if (authModalMode === 'login') {
      await login(email, password);
      toast.success('Đăng nhập thành công! Chào mừng quay trở lại.');
    } else {
      if (!name.trim()) {
        toast.error('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      await register(name, email, password);
      toast.success('Đăng ký tài khoản thành công! Tặng bạn 100 điểm thưởng.');
    }
  };

  const handleQuickDemoLogin = async () => {
    await login('quock@techzone.vn', '123456');
    toast.success('Đăng nhập tài khoản mẫu TechZone VIP thành công!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={closeAuthModal}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 bg-stone-50/80">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#c2410c] text-white flex items-center justify-center font-black text-xs">
                TZ
              </div>
              <h2 className="text-base font-bold text-stone-900">
                {authModalMode === 'login' ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản'}
              </h2>
            </div>
            <button
              onClick={closeAuthModal}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Quick Demo Login Pill */}
            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c2410c] shrink-0" />
                <span className="text-stone-700">Trải nghiệm nhanh quyền VIP & Admin</span>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="px-2.5 py-1 rounded-lg bg-[#c2410c] text-white font-bold hover:bg-[#9a3412] transition shadow-sm text-[11px] shrink-0"
              >
                Đăng nhập mẫu
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authModalMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Họ và tên *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      required
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl border-stone-300 focus:border-[#c2410c] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Địa chỉ Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    required
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl border-stone-300 focus:border-[#c2410c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mật khẩu *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    required
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl border-stone-300 focus:border-[#c2410c] focus:outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="solid"
                className="w-full py-2.5 mt-2 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-xs rounded-xl shadow-md"
              >
                {authModalMode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản mới'}
              </Button>
            </form>

            {/* Mode switch */}
            <div className="text-center pt-2 text-xs text-stone-500 border-t border-stone-100">
              {authModalMode === 'login' ? (
                <p>
                  Chưa có tài khoản TechZone?{' '}
                  <button
                    type="button"
                    onClick={() => openAuthModal('register')}
                    className="font-bold text-[#c2410c] hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <p>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="font-bold text-[#c2410c] hover:underline"
                  >
                    Đăng nhập
                  </button>
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo mật chuẩn mã hóa SSL 256-bit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
