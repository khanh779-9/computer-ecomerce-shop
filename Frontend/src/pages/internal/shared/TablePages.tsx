import { useEffect, useState } from 'react';
import { createProduct, deleteProduct, fetchProducts, updateProduct, uploadProductImage, type ProductUpsertPayload } from '../../../services/productService';
import { fetchOrders, updateOrderStatus, deleteOrder, type OrderResponse } from '../../../services/orderService';
import { fetchActiveVouchers, type Voucher } from '../../../services/voucherService';
import { formatVnd } from '../../../lib/cart';
import type { Product } from '../../../types';
import { Printer, X, Pencil, Trash2, Ban, Image as ImageIcon } from 'lucide-react';
import { InvoiceModal } from '../../../components/admin/InvoiceModal';
import { useToast } from '../../../stores/toastStore';

export function InternalTablePage({ title }: { title: string }) {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice modal state
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<OrderResponse | null>(null);

  // Vouchers state
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Form thêm sản phẩm mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const emptyProduct: ProductUpsertPayload = {
    sku: '',
    name: '',
    brand: 'Asus',
    category: 'Laptop',
    price: 15000000,
    stock: 10,
    oldPrice: 0,
    imageUrl: '',
    art: 'laptop',
    tint: '#c7d2fe',
    description: '',
    specifications: '{}',
    warrantyMonths: 12,
    active: true,
  };
  const [newProd, setNewProd] = useState<ProductUpsertPayload>(emptyProduct);

  const loadData = async () => {
    setLoading(true);
    try {
      if (title === 'Products') {
        const data = await fetchProducts();
        setProducts(data);
      } else if (title === 'Orders') {
        const data = await fetchOrders();
        setOrders(data);
      } else if (title === 'Vouchers') {
        const data = await fetchActiveVouchers();
        setVouchers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [title]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const handleCancelOrder = async (order: OrderResponse) => {
    if (!window.confirm(`Hủy đơn hàng #${order.id} của "${order.recipientName}"?`)) return;
    await handleStatusChange(order.id, 'CANCELLED');
  };

  const handleDeleteOrder = async (order: OrderResponse) => {
    if (!window.confirm(`Xóa vĩnh viễn đơn hàng #${order.id} đã hủy? Tồn kho sẽ được hoàn lại.`)) return;
    try {
      await deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast.info(`Đã xóa đơn hàng #${order.id} và hoàn lại tồn kho.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa đơn hàng');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const wasEditing = editingProductId !== null;
    setSavingProduct(true);
    try {
      let imageUrl = newProd.imageUrl;
      if (selectedImage) {
        toast.info('Đang tải ảnh sản phẩm lên MinIO...');
        imageUrl = await uploadProductImage(selectedImage);
      }
      const payload = {
        ...newProd,
        sku: newProd.sku?.trim() || undefined,
        price: Number(newProd.price),
        oldPrice: Number(newProd.oldPrice) || undefined,
        stock: Number(newProd.stock),
        imageUrl,
      };
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct(payload);
      }
      await loadData();
      setShowAddModal(false);
      setEditingProductId(null);
      setNewProd(emptyProduct);
      setSelectedImage(null);
      setImagePreviewUrl(null);
      toast.success(wasEditing ? 'Đã cập nhật sản phẩm và hình ảnh.' : 'Đã lưu sản phẩm và hình ảnh.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu sản phẩm trên hệ thống');
    } finally {
      setSavingProduct(false);
    }
  };

  const openProductEditor = (product?: Product) => {
    if (product) {
      setEditingProductId(product.id);
      setNewProd({
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        category: product.cat,
        price: product.price,
        oldPrice: product.old,
        stock: product.stock,
        art: product.art,
        tint: product.tint,
        imageUrl: product.imageUrl || '',
        description: product.description || '',
        brandId: product.brandId,
        categoryId: product.categoryId,
        manufacturerId: product.manufacturerId,
        specifications: product.specifications || '{}',
        warrantyMonths: product.warrantyMonths || 12,
        active: product.active ?? true,
      });
      setSelectedImage(null);
      setImagePreviewUrl(product.imageUrl || null);
    } else {
      setEditingProductId(null);
      setNewProd(emptyProduct);
      setSelectedImage(null);
      setImagePreviewUrl(null);
    }
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa sản phẩm');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
          <p className="text-xs text-stone-500">Quản lý và theo dõi {title.toLowerCase()} của hệ thống</p>
        </div>
        {title === 'Products' && (
          <button
            onClick={() => openProductEditor()}
            className="rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c] transition"
          >
            + Thêm sản phẩm mới
          </button>
        )}
      </div>

      {/* Modal thêm sản phẩm */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 sm:p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">{editingProductId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Tên sản phẩm *</label>
                <input
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="Laptop Lenovo Legion 5..."
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">SKU</label>
                  <input
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    placeholder="TZ-LT-001"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Thương hiệu</label>
                  <input
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Danh mục</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="PC Gaming">PC Gaming</option>
                    <option value="Màn hình">Màn hình</option>
                    <option value="Bàn phím">Bàn phím</option>
                    <option value="Chuột">Chuột</option>
                    <option value="Linh kiện PC">Linh kiện PC</option>
                    <option value="Tai nghe & Loa">Tai nghe & Loa</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Số lượng kho *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Giá niêm yết</label>
                  <input
                    type="number"
                    min={0}
                    value={newProd.oldPrice}
                    onChange={(e) => setNewProd({ ...newProd, oldPrice: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Hình ảnh sản phẩm</label>
                  <div className="rounded border border-dashed border-stone-300 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
                        <ImageIcon className="h-4 w-4" />
                        Duyệt ảnh
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (!file) return;
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('Ảnh không được vượt quá 10 MB.');
                              e.target.value = '';
                              return;
                            }
                            if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
                            setSelectedImage(file);
                            setImagePreviewUrl(URL.createObjectURL(file));
                          }}
                        />
                      </label>
                      <span className="text-xs text-stone-500">
                        Chưa upload khi duyệt. Ảnh chỉ được gửi lên MinIO sau khi bấm lưu.
                      </span>
                    </div>
                    {imagePreviewUrl && (
                      <div className="mt-3 flex items-center gap-3">
                        <img src={imagePreviewUrl} alt="Xem trước sản phẩm" className="h-20 w-20 rounded border border-stone-200 object-cover" />
                        <div className="min-w-0 text-xs text-stone-600">
                          <p className="font-medium text-stone-800">{selectedImage?.name || 'Ảnh hiện tại'}</p>
                          <p>{selectedImage ? `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB · Chưa lưu` : 'Ảnh đã lưu'}</p>
                        </div>
                        {selectedImage && (
                          <button
                            type="button"
                            onClick={() => {
                              if (imagePreviewUrl.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
                              setSelectedImage(null);
                              setImagePreviewUrl(newProd.imageUrl || null);
                            }}
                            className="ml-auto rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-700"
                            aria-label="Bỏ ảnh đang chọn"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Mã hình minh họa</label>
                  <input
                    value={newProd.art}
                    onChange={(e) => setNewProd({ ...newProd, art: e.target.value })}
                    placeholder="laptop, pc, component..."
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">ID nhà sản xuất</label>
                  <input
                    type="number"
                    min={1}
                    value={newProd.manufacturerId || ''}
                    onChange={(e) => setNewProd({ ...newProd, manufacturerId: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Để trống nếu chưa gán"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Bảo hành (tháng)</label>
                  <input
                    type="number"
                    min={0}
                    value={newProd.warrantyMonths ?? 12}
                    onChange={(e) => setNewProd({ ...newProd, warrantyMonths: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Thông số kỹ thuật (JSON)</label>
                  <textarea
                    rows={2}
                    value={newProd.specifications || '{}'}
                    onChange={(e) => setNewProd({ ...newProd, specifications: e.target.value })}
                    placeholder='{"cpu":"Core i7","ram":"16GB"}'
                    className="w-full resize-y rounded border px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={4}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  placeholder="Mô tả ngắn, điểm nổi bật và thông số chính..."
                  className="w-full resize-y rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded border px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#c2410c] px-4 py-2 text-sm font-medium text-white hover:bg-[#ea580c]"
                >
                  {savingProduct ? 'Đang lưu...' : editingProductId ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table view */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-sm text-stone-500">Đang tải dữ liệu...</div>
        ) : title === 'Products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Tên sản phẩm</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3 text-right">Giá bán</th>
                  <th className="p-3 text-center">Tồn kho</th>
                  <th className="p-3 text-center">Đã bán</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono text-xs text-stone-500">{p.sku}</td>
                    <td className="p-3 font-medium text-stone-900 max-w-md truncate">{p.name}</td>
                    <td className="p-3"><span className="rounded bg-stone-100 px-2 py-0.5 text-xs">{p.cat}</span></td>
                    <td className="p-3 text-right font-semibold text-[#c2410c]">{formatVnd(p.price)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${p.stock < 5 ? 'bg-rose-100 text-rose-700 font-semibold' : 'bg-emerald-50 text-emerald-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3 text-center text-stone-500">{p.sold}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openProductEditor(p)}
                          className="rounded p-1.5 text-stone-500 hover:bg-orange-50 hover:text-[#c2410c]"
                          aria-label={`Sửa ${p.name}`}
                          title="Sửa sản phẩm"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="rounded p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-700"
                          aria-label={`Xóa ${p.name}`}
                          title="Xóa sản phẩm"
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
        ) : title === 'Orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">Mã đơn</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3">Phương thức</th>
                  <th className="p-3 text-right">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-center">Thao tác & In phiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50">
                    <td className="p-3 font-semibold text-stone-900">#{o.id}</td>
                    <td className="p-3 font-medium">{o.recipientName}</td>
                    <td className="p-3 text-stone-500">{o.phone}</td>
                    <td className="p-3"><span className="text-xs text-stone-600">{o.paymentMethod}</span></td>
                    <td className="p-3 text-right font-bold text-[#c2410c]">{formatVnd(o.total)}</td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2.5 py-1 text-xs font-semibold ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : o.status === 'SHIPPING'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : o.status === 'CONFIRMED'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : o.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : o.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="rounded-lg border bg-white px-2 py-1 text-xs text-stone-700 shadow-2xs"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPING">SHIPPING</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <button
                          onClick={() => setSelectedOrderForInvoice(o)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-[#c2410c] hover:text-[#c2410c] text-xs font-semibold transition"
                          title="In phiếu giao hàng & Hóa đơn"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">In hóa đơn</span>
                        </button>
                        {o.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelOrder(o)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition"
                            title="Hủy đơn hàng"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Hủy đơn</span>
                          </button>
                        )}
                        {o.status === 'CANCELLED' && (
                          <button
                            onClick={() => handleDeleteOrder(o)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition"
                            title="Xóa đơn đã hủy khỏi hệ thống"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Xóa</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : title === 'Vouchers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b text-xs font-semibold text-stone-600 uppercase">
                <tr>
                  <th className="p-3">Mã Voucher</th>
                  <th className="p-3">Mô tả</th>
                  <th className="p-3">Mức giảm</th>
                  <th className="p-3">Đơn tối thiểu</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y text-stone-700">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">
                      <span className="bg-orange-50 text-[#c2410c] px-2 py-1 rounded border border-orange-200">
                        {v.code}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{v.description}</td>
                    <td className="p-3 font-bold text-[#c2410c]">
                      {v.discountPercent > 0 ? `${v.discountPercent}%` : formatVnd(v.discountAmount)}
                    </td>
                    <td className="p-3 text-stone-600">{formatVnd(v.minOrderAmount)}</td>
                    <td className="p-3 text-center">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        {v.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-stone-500">
            Chưa có API dữ liệu thật cho mục {title.toLowerCase()}.
          </div>
        )}
      </div>

      {/* Invoice Modal Preview */}
      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          isOpen={!!selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
    </>
  );
}
