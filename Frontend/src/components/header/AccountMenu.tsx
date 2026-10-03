import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';
import { User } from 'lucide-react';

interface AccountMenuProps {
  onOpenLookup?: () => void;
}

export function AccountMenu({ onOpenLookup }: AccountMenuProps) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    toast.info('Bạn đã đăng xuất.');
  };

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => openAuthModal('login')}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:border-[#c2410c] hover:text-[#c2410c] transition"
        aria-label="Tài khoản"
        title="Tài khoản"
      >
        <User className="w-4 h-4 text-stone-700" />
      </button>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div ref={containerRef} className="relative">
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white hover:border-[#c2410c] transition text-stone-800"
        aria-label="Tài khoản"
        title={user.name}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded bg-[#c2410c] text-white text-xs font-bold">
          {initials}
        </div>
      </button>

      {/* Account Dropdown Panel - Clean Retail Typography Without Icon Clutter */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden z-50 animate-in fade-in duration-100">
          {/* User Info Header */}
          <div className="border-b border-stone-100 bg-stone-50 px-4 py-3">
            <p className="font-bold text-stone-900 text-xs truncate">{user.name}</p>
            <p className="text-stone-400 text-[11px] truncate">{user.email}</p>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-stone-500 font-medium">Hạng {user.membershipTier || 'Thành viên'}</span>
              <span className="font-semibold text-stone-800">{user.points || 0} điểm</span>
            </div>
          </div>

          {/* Menu Items - Clean typography, no unnecessary icons */}
          <div className="py-1 text-xs">
            <Link
              to="/me"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-stone-700 hover:bg-stone-50 hover:text-[#c2410c] transition"
            >
              Tài khoản & Đơn hàng
            </Link>

            <Link
              to="/me"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-stone-700 hover:bg-stone-50 hover:text-[#c2410c] transition"
            >
              Đánh giá của tôi
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-stone-700 hover:bg-stone-50 hover:text-rose-600 transition"
            >
              Sản phẩm yêu thích
            </Link>

            <Link
              to="/me"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-stone-700 hover:bg-stone-50 hover:text-[#c2410c] transition"
            >
              Tra cứu bảo hành thiết bị
            </Link>

            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-stone-700 hover:bg-stone-50 hover:text-[#c2410c] transition"
            >
              Giỏ hàng & Khuyến mãi
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                to="/internal"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 font-semibold text-stone-900 hover:bg-stone-50 hover:text-[#c2410c] transition"
              >
                Trang quản trị (Admin)
              </Link>
            )}

            <div className="border-t border-stone-100 my-1" />

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-stone-500 hover:bg-stone-50 hover:text-rose-600 transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
