import { NavLink, Outlet } from 'react-router-dom';

export function InternalLayout() {
  const links = [
    ['/internal', 'Dashboard'],
    ['/internal/products', 'Products'],
    ['/internal/orders', 'Orders'],
    ['/internal/customers', 'Customers'],
    ['/internal/reviews', 'Reviews'],
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
        {links.map(([to, t]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/internal'}
            className="mb-1 block rounded px-3 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-white"
          >
            {t}
          </NavLink>
        ))}
      </aside>
      <div className="md:pl-60">
        <header className="border-b bg-white px-4 sm:px-5 py-3">
          <div className="flex items-center justify-between">
            <b className="text-sm sm:text-base">TechZone Computer · Internal Management</b>
          </div>
          {/* Mobile Subnav for Admin */}
          <nav className="flex md:hidden gap-1.5 pt-2.5 overflow-x-auto no-scrollbar">
            {links.map(([to, t]) => (
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
                {t}
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
