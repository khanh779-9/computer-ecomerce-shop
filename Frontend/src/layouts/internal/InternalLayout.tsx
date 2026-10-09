import { NavLink, Outlet } from 'react-router-dom';
import { NotificationDropdown } from '../../components/header/NotificationDropdown';
import { BarChart3, Building2, LayoutDashboard, Package, ReceiptText, Settings, ShieldCheck, Tag, Users, Warehouse, type LucideIcon } from 'lucide-react';

export function InternalLayout() {
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

  return (
    <div className="min-h-screen bg-stone-100">
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-stone-900 p-4 text-white md:block">
        <div className="mb-8 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-[#c2410c] text-xs font-bold text-white">
            TZ
          </span>
          <b className="text-lg">TechZone Admin</b>
        </div>
        {links.map(([to, t, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/internal'}
            className="mb-1 block rounded px-3 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-white"
          >
            <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{t}</span>
          </NavLink>
        ))}
      </aside>
      <div className="md:pl-60">
        <header className="border-b bg-white px-4 sm:px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <b className="truncate text-sm sm:text-base">TechZone Computer · Internal Management</b>
            <NotificationDropdown audience="internal" />
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
