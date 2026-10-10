import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { NotificationDropdown } from '../../components/header/NotificationDropdown';
import { BarChart3, LayoutDashboard, LogIn, LogOut, Package, ReceiptText, Settings, ShieldCheck, Tag, Users, Warehouse, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../stores/authStore';

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function InternalLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();

  const links: Array<[string, string, LucideIcon]> = [
    ['/internal', 'Dashboard', LayoutDashboard],
    ['/internal/trends', 'Xu hướng', BarChart3],
    ['/internal/products', 'Products', Package],
    ['/internal/manufacturers', 'Nhà sản xuất', Warehouse],
    ['/internal/brands', 'Hãng / thương hiệu', Tag],
    ['/internal/orders', 'Orders', ReceiptText],
    ['/internal/warranty', 'Warranty & RMA', ShieldCheck],
    ['/internal/vouchers', 'Vouchers', Tag],
    ['/internal/customers', 'Customers', Users],
    ['/internal/reviews', 'Reviews', ShieldCheck],
    ['/internal/employees', 'Employee', Users],
    ['/internal/settings', 'Settings', Settings],
  ];

  const handleLogout = () => {
    logout();
    nav('/internal/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-stone-900 p-4 text-white md:flex">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-[#c2410c] text-xs font-bold text-white">
            TZ
          </span>
          <b className="text-lg">TechZone Admin</b>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {links.map(([to, t, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/internal'}
              className="block rounded px-3 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-white"
            >
              <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{t}</span>
            </NavLink>
          ))}
        </nav>

        {/* Profile & logout — dưới cùng sidebar */}
        <div className="mt-4 border-t border-stone-800 pt-4">
          {isAuthenticated && user ? (
            <>
              <div className="mb-3 flex items-center gap-2.5 rounded-lg bg-stone-800/60 p-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c2410c] text-xs font-bold text-white">
                    {initialsOf(user.name) || 'TZ'}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="truncate text-[11px] text-stone-400">{user.email}</p>
                </div>
              </div>
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="inline-flex items-center gap-1 rounded bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                  <ShieldCheck className="h-3 w-3" /> {user.role}
                </span>
                {user.membershipTier && (
                  <span className="truncate text-[10px] text-stone-500">{user.membershipTier}</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-stone-400 transition hover:bg-rose-500/10 hover:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/internal/login"
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
            >
              <LogIn className="h-4 w-4" />
              <span>Đăng nhập nội bộ</span>
            </NavLink>
          )}
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="border-b bg-white px-4 sm:px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <b className="truncate text-sm sm:text-base">TechZone Computer · Internal Management</b>
            <div className="flex items-center gap-2">
              {/* Mobile-only profile & logout (sidebar bị ẩn trên mobile) */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-2 md:hidden">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c2410c] text-[10px] font-bold text-white">
                    {initialsOf(user.name) || 'TZ'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Đăng xuất"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <NotificationDropdown audience="internal" />
            </div>
          </div>
          {/* Mobile Subnav for Admin */}
          <nav className="flex md:hidden gap-1.5 pt-2.5 overflow-x-auto no-scrollbar">
            {links.map(([to, t, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/internal'}
                className={({ isActive }) =>
                  `px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                    isActive
                      ? 'bg-[#c2410c] text-white shadow-sm'
                      : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
                  }`
                }
              >
                <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{t}</span>
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="p-3 sm:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
