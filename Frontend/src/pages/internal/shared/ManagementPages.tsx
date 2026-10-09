import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchProducts } from '../../../services/productService';
import type { Product } from '../../../types';
import { AlertTriangle, BarChart3, Building2, Clock3, PackageCheck, ShieldCheck, SlidersHorizontal, Users, type LucideIcon } from 'lucide-react';

type ManagementPage = 'Trends' | 'Manufacturers' | 'Brands' | 'Employees' | 'Settings';

function formatProductDate(value?: string) {
  if (!value) return 'Chưa có ngày tạo';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

export function InternalManagementPage({ title }: { title: ManagementPage }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchProducts()
      .then((productData) => {
        setProducts(productData);
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : 'Không thể tải dữ liệu quản trị.');
      })
      .finally(() => setLoading(false));
  }, []);

  const productGroups = useMemo(() => {
    const field = 'brand';
    const groups = new Map<string, { count: number; stock: number; sold: number }>();
    products.forEach((product) => {
      const key = product[field] || 'Chưa phân loại';
      const current = groups.get(key) || { count: 0, stock: 0, sold: 0 };
      groups.set(key, {
        count: current.count + 1,
        stock: current.stock + product.stock,
        sold: current.sold + product.sold,
      });
    });
    return [...groups.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [products, title]);

  if (title === 'Manufacturers') {
    return (
      <section className="space-y-5">
        <PageHeading title="Nhà sản xuất" description="Quản lý nhà sản xuất và thông tin nguồn hàng" icon={Building2} />
        <UnavailablePanel
          title="Chưa có dữ liệu nhà sản xuất"
          description="Schema sản phẩm hiện chưa có manufacturer_id hoặc API quản trị nhà sản xuất. Trang này sẽ không suy diễn nhà sản xuất từ trường hãng."
          items={['Danh sách nhà sản xuất', 'Thông tin liên hệ và nguồn hàng', 'Liên kết nhà sản xuất với sản phẩm', 'Theo dõi sản phẩm theo nhà sản xuất']}
        />
      </section>
    );
  }

  if (title === 'Brands') {
    return (
      <section className="space-y-5">
        <PageHeading title="Hãng / thương hiệu" description="Theo dõi các hãng đang có trong catalog sản phẩm" icon={SlidersHorizontal} />
        <div className="rounded-2xl border border-stone-200 bg-white shadow-2xs">
          {loadError ? <ErrorState message={loadError} /> : loading ? <LoadingState /> : productGroups.length === 0 ? <EmptyState text="Chưa có sản phẩm để tổng hợp." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="p-4">Hãng</th>
                    <th className="p-4 text-center">Sản phẩm</th>
                    <th className="p-4 text-center">Tồn kho</th>
                    <th className="p-4 text-center">Đã bán</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {productGroups.map(([name, summary]) => (
                    <tr key={name} className="hover:bg-stone-50">
                      <td className="p-4 font-semibold text-stone-900">{name}</td>
                      <td className="p-4 text-center">{summary.count}</td>
                      <td className="p-4 text-center">{summary.stock}</td>
                      <td className="p-4 text-center">{summary.sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (title === 'Trends') {
    const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 6);
    const newProducts = [...products]
      .filter((product) => product.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 6);
    const lowStockProducts = [...products]
      .filter((product) => product.stock > 0 && product.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
    const categoryGroups = [...products.reduce((groups, product) => {
      const category = product.cat || 'Chưa phân loại';
      groups.set(category, (groups.get(category) || 0) + product.sold);
      return groups;
    }, new Map<string, number>()).entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return (
      <section className="space-y-5">
        <PageHeading title="Xu hướng sản phẩm" description="Theo dõi những sản phẩm đang được quan tâm và cần bổ sung hàng" icon={BarChart3} />
        {loadError ? <ErrorState message={loadError} /> : loading ? <LoadingState /> : (
          <>
            <div className="grid gap-5 xl:grid-cols-2">
              <TrendPanel title="Sản phẩm bán chạy" description="Sắp xếp từ số lượng đã bán cao xuống thấp" icon={PackageCheck}>
                {bestSellers.length === 0 ? <EmptyState text="Chưa có dữ liệu sản phẩm." /> : <ProductRanking products={bestSellers} value={(product) => `${product.sold.toLocaleString('vi-VN')} đã bán`} />}
              </TrendPanel>
              <TrendPanel title="Sản phẩm mới cập nhật" description="Những sản phẩm được thêm gần đây" icon={Clock3}>
                {newProducts.length === 0 ? <EmptyState text="API chưa trả ngày tạo sản phẩm." /> : <ProductRanking products={newProducts} value={(product) => formatProductDate(product.createdAt)} />}
              </TrendPanel>
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <TrendPanel title="Danh mục đang bán tốt" description="Tổng số sản phẩm đã bán theo danh mục" icon={BarChart3}>
                {categoryGroups.length === 0 ? <EmptyState text="Chưa có dữ liệu danh mục." /> : (
                  <div className="space-y-3">
                    {categoryGroups.map(([category, sold]) => (
                      <div key={category} className="flex items-center justify-between gap-4 text-sm">
                        <span className="truncate font-medium text-stone-700">{category}</span>
                        <span className="shrink-0 font-bold tabular-nums text-stone-900">{sold.toLocaleString('vi-VN')} đã bán</span>
                      </div>
                    ))}
                  </div>
                )}
              </TrendPanel>
              <TrendPanel title="Cần chú ý tồn kho" description="Sản phẩm còn không quá 5 chiếc" icon={AlertTriangle}>
                {lowStockProducts.length === 0 ? <EmptyState text="Hiện chưa có sản phẩm sắp hết hàng." /> : <ProductRanking products={lowStockProducts} value={(product) => `Còn ${product.stock}`} warning />}
              </TrendPanel>
            </div>
          </>
        )}
      </section>
    );
  }

  if (title === 'Employees') {
    return (
      <section className="space-y-5">
        <PageHeading title="Employee" description="Tài khoản nhân viên và quyền truy cập trang nội bộ" icon={Users} />
        <UnavailablePanel
          title="API quản trị nhân viên chưa được bật"
          description="Backend hiện mới có đăng nhập và thông tin tài khoản hiện tại, chưa có endpoint danh sách, tạo, sửa, xóa hoặc phân quyền nhân viên."
          items={['Danh sách nhân viên', 'Vai trò và quyền theo chức năng', 'Khóa / mở khóa tài khoản', 'Nhật ký thao tác quản trị']}
        />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <PageHeading title="Settings" description="Chính sách vận hành và cấu hình hệ thống" icon={ShieldCheck} />
      <UnavailablePanel
        title="Cấu hình chính sách cần lưu ở backend"
        description="Các thiết lập dưới đây nên được lưu theo tài khoản và audit log. Chưa cho phép chỉnh giả lập ở frontend khi chưa có API tương ứng."
        items={['Chính sách đổi trả và bảo hành', 'Ngưỡng cảnh báo tồn kho', 'Quyền duyệt sản phẩm và hình ảnh', 'Phương thức thanh toán được bật', 'Thời gian phiên đăng nhập nội bộ']}
      />
    </section>
  );
}

function PageHeading({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#c2410c]"><Icon className="h-5 w-5" /></div>
      <div><h1 className="text-2xl font-bold text-stone-900">{title}</h1><p className="text-xs text-stone-500">{description}</p></div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p><p className="mt-2 text-2xl font-black text-stone-900">{value}</p></div>;
}

function TrendPanel({ title, description, icon: Icon, children }: { title: string; description: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
      <div className="mb-4 flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 text-[#c2410c]" />
        <div><h2 className="text-sm font-bold text-stone-900">{title}</h2><p className="text-xs text-stone-500">{description}</p></div>
      </div>
      {children}
    </div>
  );
}

function ProductRanking({ products, value, warning = false }: { products: Product[]; value: (product: Product) => string; warning?: boolean }) {
  return (
    <div className="divide-y divide-stone-100">
      {products.map((product, index) => (
        <div key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="w-5 shrink-0 text-center text-xs font-bold text-stone-400">{index + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-900">{product.name}</p>
            <p className="text-xs text-stone-500">{product.brand} · {product.cat || 'Chưa phân loại'}</p>
          </div>
          <span className={`shrink-0 text-xs font-bold ${warning ? 'text-amber-700' : 'text-[#c2410c]'}`}>{value(product)}</span>
        </div>
      ))}
    </div>
  );
}

function UnavailablePanel({ title, description, items }: { title: string; description: string; items: string[] }) {
  return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-bold text-amber-950">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900">{description}</p><ul className="mt-4 grid gap-2 text-sm text-amber-950 sm:grid-cols-2">{items.map((item) => <li key={item} className="rounded-lg border border-amber-200 bg-white/60 px-3 py-2">• {item}</li>)}</ul></div>;
}

function LoadingState() {
  return <div className="p-8 text-center text-sm text-stone-500">Đang tải dữ liệu...</div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="p-8 text-center text-sm text-stone-500">{text}</div>;
}

function ErrorState({ message }: { message: string }) {
  return <div className="p-8 text-center text-sm text-red-700">{message}</div>;
}
