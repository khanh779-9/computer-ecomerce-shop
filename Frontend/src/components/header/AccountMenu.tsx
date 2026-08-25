import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';
import {
  User,
  Package,
  Tag,
  Shield,
  LogOut,
  Coins,
  Crown,
} from 'lucide-react';

interface AccountMenuProps {
  onOpenLookup: () => void;
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
    toast.info('Bạn đã đăng xuất khỏi hệ thống.');
  };

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => openAuthModal('login')}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-stone-50/80 text-stone-700 hover:border-[#c2410c] hover:bg-white hover:text-[#c2410c] transition shadow-sm"
        aria-label="Tài khoản"
        title="Tài khoản"
      >
        <User className="w-4 h-4 text-[#c2410c]" />
      </button>
    );
  }

  // Get user initials for avatar
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-stone-50/80 hover:border-[#c2410c] hover:bg-white transition shadow-sm text-stone-800"
        aria-label="Tài khoản"
        title={user.name}
      >
        {/* Avatar circle */}
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c2410c] text-white text-[11px] font-black shadow-sm">
          {initials}
        </div>
      </button>

      {/* Account Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Profile Card Header */}
          <div className="border-b border-stone-100 bg-gradient-to-br from-stone-50 to-orange-50/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c2410c] text-white font-black text-sm shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-stone-900 text-sm truncate">{user.name}</p>
                <p className="text-stone-400 text-[11px] truncate">{user.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    <Crown className="w-2.5 h-2.5 fill-amber-500" />
                    <span>Hạng {user.membershipTier}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <Coins className="w-3 h-3 text-amber-500" />
                    <span>{user.points} Xu</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1 text-xs">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLookup();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-50 hover:text-[#c2410c] transition font-medium"
            >
              <Package className="w-4 h-4 text-blue-600" />
              <span>Đơn hàng của tôi</span>
            </button>

            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-50 hover:text-[#c2410c] transition font-medium"
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-[#c2410c]" />
                <span>Ví Voucher của tôi</span>
              </div>
              <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-[#c2410c]">
                3 mã
              </span>
            </Link>

            {/* Admin link for managers */}
            {user.role === 'ADMIN' && (
              <Link
                to="/internal"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-700 hover:bg-purple-50 transition font-bold"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Trang quản trị (Admin Dashboard)</span>
              </Link>
            )}

            <div className="border-t border-stone-100 my-1" />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
