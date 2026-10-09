import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../stores/authStore';
import { useCart } from '../../../stores/cartStore';
import { useWishlist } from '../../../stores/wishlistStore';
import { useToast } from '../../../stores/toastStore';
import { fetchOrders, type OrderResponse } from '../../../services/orderService';
import { createReview, fetchMyReviews } from '../../../services/reviewService';
import {
  fetchMyAddresses,
  createAddress,
  deleteAddress as deleteAddressApi,
  setDefaultAddress as setDefaultAddressApi,
  type AddressResponse,
} from '../../../services/addressService';
import { fetchMyWarranties, createWarrantyClaim } from '../../../services/warrantyService';
import { formatVnd } from '../../../lib/cart';
import { Button } from '../../../components/ui/Button';
import { Star, CheckCircle, Search, Plus, X, Crown, Award, Gift, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

interface UserReview {
  id: string;
  orderId: number;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface SavedAddress {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
  label: string;
}

interface WarrantyItem {
  serial: string;
  productName: string;
  brand: string;
  purchaseDate: string;
  warrantyMonths: number;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'IN_REPAIR' | 'READY_FOR_PICKUP';
}

const STORAGE_REVIEWS_KEY = 'techzone_user_reviews';

export function MePage() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { add: addToCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const toast = useToast();
  const nav = useNavigate();

  // Navigation tab: orders | reviews | warranty | addresses | vouchers | profile | membership
  const [activeTab, setActiveTab] = useState<'orders' | 'reviews' | 'warranty' | 'addresses' | 'vouchers' | 'profile' | 'membership'>('orders');

  // Orders state
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('ALL');

  // Reviews state
  const [reviews, setReviews] = useState<UserReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REVIEWS_KEY);
      return saved ? JSON.parse(saved) : [
        {
          id: 'rev_1',
          orderId: 101,
          productId: 1,
          productName: 'Card Màn Hình ASUS ROG Strix GeForce RTX 4070 Ti SUPER 16GB',
          rating: 5,
          comment: 'Card chạy mát rượi, full load 4K max setting chỉ tầm 62 độ. Đóng gói rất cẩn thận, hàng fullbox trùng serial.',
          createdAt: '25/09/2026',
        }
      ];
    } catch {
      return [];
    }
  });

  // Modal review state
  const [reviewModalItem, setReviewModalItem] = useState<{
    orderId: number;
    productId: number;
    productName: string;
  } | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Warranty search (dữ liệu thật từ API /api/warranty/my-warranties)
  const [serialQuery, setSerialQuery] = useState('');
  const [warrantyList, setWarrantyList] = useState<WarrantyItem[]>([]);
  const [loadingWarranties, setLoadingWarranties] = useState(false);

  // Claim modal state
  const [claimModalSerial, setClaimModalSerial] = useState<WarrantyItem | null>(null);
  const [claimIssue, setClaimIssue] = useState('');
  const [savingClaim, setSavingClaim] = useState(false);

  // Saved Addresses (đồng bộ từ DB qua API, không còn dùng localStorage)
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', address: '', label: 'Nhà riêng' });

  useEffect(() => {
    localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingOrders(true);
      fetchOrders()
        .then((res) => {
          setOrders(res || []);
        })
        .catch(() => {
          setOrders([]);
        })
        .finally(() => {
          setLoadingOrders(false);
        });

      fetchMyReviews()
        .then((res) => {
          if (res && res.length > 0) {
            const mapped: UserReview[] = res.map((r) => ({
              id: `rev_${r.id}`,
              orderId: r.orderId || 101,
              productId: r.productId,
              productName: r.title || `Sản phẩm #${r.productId}`,
              rating: r.rating,
              comment: r.content,
              createdAt: new Date(r.createdAt).toLocaleDateString('vi-VN'),
            }));
            setReviews(mapped);
          }
        })
        .catch((err) => {
          console.error('Error loading my reviews:', err);
        });

      loadAddresses();
      loadWarranties();
    }
  }, [isAuthenticated]);

  // Submit review
  const mapAddress = (a: AddressResponse): SavedAddress => ({
    id: a.id,
    name: a.recipientName,
    phone: a.phone,
    address: [a.addressLine, a.ward, a.district, a.province].filter(Boolean).join(', '),
    isDefault: a.isDefault,
    label: a.label,
  });

  const loadAddresses = () => {
    setLoadingAddresses(true);
    fetchMyAddresses()
      .then((res) => setAddresses((res || []).map(mapAddress)))
      .catch((err) => {
        console.error('Error loading addresses:', err);
        setAddresses([]);
      })
      .finally(() => setLoadingAddresses(false));
  };

  const loadWarranties = () => {
    setLoadingWarranties(true);
    fetchMyWarranties()
      .then((res) => {
        setWarrantyList(
          (res || []).map((w) => ({
            serial: w.serialNumber,
            productName: w.productName,
            brand: w.productBrand,
            purchaseDate: w.purchaseDate
              ? new Date(w.purchaseDate).toLocaleDateString('vi-VN')
              : '—',
            warrantyMonths: w.warrantyPeriodMonths,
            expiresAt: w.warrantyExpiryDate
              ? new Date(w.warrantyExpiryDate).toLocaleDateString('vi-VN')
              : '—',
            status: w.status as WarrantyItem['status'],
          }))
        );
      })
      .catch((err) => {
        console.error('Error loading my warranties:', err);
        setWarrantyList([]);
      })
      .finally(() => setLoadingWarranties(false));
  };

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalItem) return;
    if (reviewComment.trim().length < 5) {
      toast.error('Vui lòng nhập tối thiểu 5 ký tự để chia sẻ cảm nhận thực tế.');
      return;
    }

    try {
      const res = await createReview({
        productId: reviewModalItem.productId,
        orderId: reviewModalItem.orderId,
        rating: ratingScore,
        title: reviewModalItem.productName,
        content: reviewComment.trim(),
      });

      const newRev: UserReview = {
        id: `rev_${res.id}`,
        orderId: reviewModalItem.orderId,
        productId: reviewModalItem.productId,
        productName: reviewModalItem.productName,
        rating: res.rating,
        comment: res.content,
        createdAt: new Date(res.createdAt).toLocaleDateString('vi-VN'),
      };

      setReviews([newRev, ...reviews]);
      setReviewModalItem(null);
      setReviewComment('');
      setRatingScore(5);
      toast.success('Đã gửi đánh giá thành công! Bạn nhận được +50 điểm TechPoints.');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi đánh giá, vui lòng thử lại.');
    }
  };

  // Tạo yêu cầu bảo hành (claim) cho serial còn hiệu lực
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimModalSerial) return;
    if (claimIssue.trim().length < 10) {
      toast.error('Vui lòng mô tả chi tiết lỗi (tối thiểu 10 ký tự) để kỹ thuật viên hỗ trợ nhanh hơn.');
      return;
    }
    setSavingClaim(true);
    try {
      const claim = await createWarrantyClaim({
        serialNumber: claimModalSerial.serial,
        issue: claimIssue.trim(),
      });
      toast.success(`Đã tạo yêu cầu bảo hành thành công! Mã RMA của bạn: ${claim.rmaCode}`);
      setClaimModalSerial(null);
      setClaimIssue('');
      loadWarranties();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo yêu cầu bảo hành, vui lòng thử lại.');
    } finally {
      setSavingClaim(false);
    }
  };

  // Handle re-order
  const handleReorder = (order: OrderResponse) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item) => {
      addToCart({
        id: item.productId,
        sku: `SKU-${item.productId}`,
        name: item.productName,
        price: item.unitPrice,
        old: item.unitPrice,
        brand: 'TechZone',
        cat: 'Linh kiện',
        art: 'gpu',
        tint: 'emerald',
        tags: [],
        stock: 10,
        rate: 5,
        reviews: 1,
        sold: 100,
        description: item.productName,
      });
    });
    toast.success('Đã thêm các sản phẩm trong đơn vào giỏ hàng!');
    nav('/cart');
  };

  // Add new address (POST /api/users/me/addresses)
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.name || !newAddr.phone || !newAddr.address) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ.');
      return;
    }
    try {
      const created = await createAddress({
        recipientName: newAddr.name,
        phone: newAddr.phone,
        addressLine: newAddr.address,
        label: newAddr.label,
      });
      setAddresses((prev) => {
        const mapped = mapAddress(created);
        // Backend tự set mặc định cho địa chỉ đầu tiên / khi isDefault=true
        if (mapped.isDefault) {
          return [mapped, ...prev.map((a) => ({ ...a, isDefault: false }))];
        }
        return [...prev, mapped];
      });
      setShowAddAddressModal(false);
      setNewAddr({ name: '', phone: '', address: '', label: 'Nhà riêng' });
      toast.success('Đã thêm địa chỉ mới.');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể thêm địa chỉ, vui lòng thử lại.');
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      await setDefaultAddressApi(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      toast.success('Đã đặt làm địa chỉ nhận hàng mặc định.');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đặt địa chỉ mặc định.');
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      await deleteAddressApi(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.info('Đã xóa địa chỉ.');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa địa chỉ.');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-stone-900">Tài khoản khách hàng</h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Vui lòng đăng nhập để tra cứu lịch sử mua hàng, bảo hành điện tử và đánh giá sản phẩm đã mua.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => openAuthModal('login')}
              className="bg-[#c2410c] hover:bg-[#9a3412] text-white font-semibold text-xs px-6 py-2.5 rounded-lg"
            >
              Đăng nhập
            </Button>
            <Button
              variant="outline"
              onClick={() => openAuthModal('register')}
              className="border-stone-300 text-stone-700 text-xs px-6 py-2.5 rounded-lg"
            >
              Đăng ký tài khoản
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  const searchedWarranties = warrantyList.filter(
    (w) =>
      w.serial.toLowerCase().includes(serialQuery.trim().toLowerCase()) ||
      w.productName.toLowerCase().includes(serialQuery.trim().toLowerCase())
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Trung tâm tài khoản & Đơn hàng</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Quản lý đơn mua, bảo hành linh kiện, đánh giá sản phẩm và sổ địa chỉ giao hàng
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-stone-500">Khách hàng: <strong className="text-stone-800">{user.name}</strong></span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-500">Hạng: <strong className="text-stone-800">{user.membershipTier || 'Thành viên'}</strong></span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-500">Điểm: <strong className="text-[#c2410c]">{user.points || 0} pts</strong></span>
        </div>
      </div>

      {/* Main 2-Column Retail Layout */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 rounded-xl border border-stone-200 bg-white p-2 shadow-sm space-y-1">
          {[
            { id: 'orders', label: 'Đơn hàng của tôi', count: orders.length },
            { id: 'reviews', label: 'Đánh giá sản phẩm', count: reviews.length },
            { id: 'warranty', label: 'Tra cứu bảo hành (Serial)', count: warrantyList.length },
            { id: 'addresses', label: 'Sổ địa chỉ nhận hàng', count: addresses.length },
            { id: 'vouchers', label: 'Kho Voucher & Ưu đãi', count: 3 },
            { id: 'membership', label: 'Hạng thành viên & Điểm thưởng' },
            { id: 'profile', label: 'Thông tin tài khoản' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                activeTab === item.id
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[11px] px-2 py-0.2 rounded-full ${
                    activeTab === item.id ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}

          <Link
            to="/wishlist"
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-between text-stone-700 hover:bg-stone-100 hover:text-rose-600"
          >
            <span>Sản phẩm yêu thích</span>
            {wishlistCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          <div className="border-t border-stone-100 my-1 pt-1">
            <button
              onClick={() => {
                logout();
                nav('/');
              }}
              className="w-full text-left px-3.5 py-2 rounded-lg text-xs text-stone-500 hover:text-rose-600 hover:bg-stone-50 transition"
            >
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Right Content Area (9 cols) */}
        <section className="lg:col-span-9 space-y-6">
          {/* 1. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Status Filters */}
              <div className="flex gap-1.5 overflow-x-auto border-b border-stone-200 pb-2 text-xs">
                {[
                  { id: 'ALL', label: 'Tất cả đơn' },
                  { id: 'PENDING', label: 'Chờ xác nhận' },
                  { id: 'PROCESSING', label: 'Đang xử lý' },
                  { id: 'SHIPPING', label: 'Đang giao' },
                  { id: 'COMPLETED', label: 'Đã hoàn tất' },
                  { id: 'CANCELLED', label: 'Đã hủy' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                      orderFilter === f.id
                        ? 'border border-[#c2410c] text-[#c2410c] bg-orange-50/50'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-stone-400">Đang tải danh sách đơn hàng...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-xl border border-stone-200 bg-white p-12 text-center space-y-3">
                  <p className="text-sm font-semibold text-stone-800">Không có đơn hàng nào trong mục này</p>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Bạn chưa có đơn đặt hàng nào tương ứng. Hãy dạo quanh cửa hàng để khám phá các linh kiện chất lượng.
                  </p>
                  <Button
                    onClick={() => nav('/products')}
                    className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs px-4 py-2 rounded-lg font-semibold"
                  >
                    Mua sắm ngay
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-4"
                    >
                      {/* Order top info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-stone-900">#ORD-{order.id}</span>
                          <span className="text-stone-400">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Mới đặt'}
                          </span>
                        </div>
                        <div>
                          {order.status === 'COMPLETED' && (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                              Đã giao thành công
                            </span>
                          )}
                          {order.status === 'SHIPPING' && (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold text-stone-800 bg-stone-100 border border-stone-200">
                              Đang vận chuyển
                            </span>
                          )}
                          {order.status === 'PROCESSING' && (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold text-stone-800 bg-stone-100 border border-stone-200">
                              Đang chuẩn bị hàng
                            </span>
                          )}
                          {order.status === 'CANCELLED' && (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200">
                              Đã hủy
                            </span>
                          )}
                          {order.status === 'PENDING' && (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold text-stone-800 bg-stone-100 border border-stone-200">
                              Chờ xác nhận
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3 divide-y divide-stone-50">
                        {order.items?.map((item) => (
                          <div key={item.id} className="pt-2 flex items-center justify-between gap-4 text-xs">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-stone-900 truncate">{item.productName}</p>
                              <p className="text-stone-400 text-[11px]">
                                Số lượng: {item.quantity} × {formatVnd(item.unitPrice)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-semibold text-stone-900">
                                {formatVnd(item.total || item.unitPrice * item.quantity)}
                              </span>

                              {/* Button to review product if order completed */}
                              {order.status === 'COMPLETED' && (
                                <button
                                  onClick={() =>
                                    setReviewModalItem({
                                      orderId: order.id,
                                      productId: item.productId,
                                      productName: item.productName,
                                    })
                                  }
                                  className="text-[11px] font-semibold text-[#c2410c] hover:underline border border-orange-200 bg-orange-50 px-2 py-1 rounded"
                                >
                                  Viết đánh giá
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs">
                        <div className="text-stone-500">
                          Thanh toán: <strong className="text-stone-700">{order.paymentMethod}</strong>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-stone-500 mr-2">Tổng tiền:</span>
                            <span className="text-base font-bold text-[#c2410c]">{formatVnd(order.total)}</span>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleReorder(order)}
                            className="text-xs px-3 py-1.5 border-stone-300 text-stone-700 font-medium"
                          >
                            Mua lại
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900">Đánh giá sản phẩm của bạn ({reviews.length})</h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Đóng góp ý kiến và trải nghiệm dùng thực tế để giúp cộng đồng build PC lựa chọn chuẩn xác hơn.
                    </p>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
                    +50 TechPoints / lượt đánh giá
                  </span>
                </div>

                {reviews.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-400">
                    <p className="font-medium text-stone-700">Chưa có bài đánh giá nào</p>
                    <p className="mt-1">Khi bạn nhận hàng thành công, hãy bấm vào nút &quot;Viết đánh giá&quot; tại từng sản phẩm nhé.</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4 divide-y divide-stone-100">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-stone-900">{rev.productName}</p>
                            <span className="text-[11px] text-stone-400">Đơn hàng #ORD-{rev.orderId} · Ngày {rev.createdAt}</span>
                          </div>
                          {/* Rating stars */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. WARRANTY TAB (SERIAL / IMEI) */}
          {activeTab === 'warranty' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Tra cứu bảo hành điện tử chính hãng</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Hệ thống lưu trữ thời hạn bảo hành theo số Serial/IMEI linh kiện xuất kho từ TechZone Computer.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nhập mã Serial thiết bị (Ví dụ: SN-RTX4070TI, SN-I7...)"
                    value={serialQuery}
                    onChange={(e) => setSerialQuery(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 pl-9 text-xs focus:border-[#c2410c] focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                </div>

                {/* Warranties Table */}
                <div className="overflow-x-auto rounded-lg border border-stone-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                      <tr>
                        <th className="p-3">Số Serial / IMEI</th>
                        <th className="p-3">Sản phẩm linh kiện</th>
                        <th className="p-3">Ngày kích hoạt</th>
                        <th className="p-3">Hạn bảo hành</th>
                        <th className="p-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {loadingWarranties ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-stone-400">
                            Đang tải dữ liệu bảo hành...
                          </td>
                        </tr>
                      ) : searchedWarranties.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-stone-400">
                            Chưa có sản phẩm nào được kích hoạt bảo hành theo tài khoản của bạn.
                          </td>
                        </tr>
                      ) : (
                        searchedWarranties.map((w) => (
                          <tr key={w.serial} className="hover:bg-stone-50/50">
                            <td className="p-3 font-mono font-bold text-stone-900">{w.serial}</td>
                            <td className="p-3 font-medium text-stone-800">
                              <div>{w.productName}</div>
                              <span className="text-[11px] text-stone-400">{w.brand}</span>
                            </td>
                            <td className="p-3 text-stone-600">{w.purchaseDate}</td>
                            <td className="p-3 font-semibold text-stone-800">
                              {w.expiresAt} ({w.warrantyMonths} tháng)
                            </td>
                            <td className="p-3">
                              {w.status === 'IN_REPAIR' ? (
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                                  Đang sửa chữa
                                </span>
                              ) : w.status === 'READY_FOR_PICKUP' ? (
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200">
                                  Sẵn sàng trả máy
                                </span>
                              ) : w.status === 'EXPIRED' ? (
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200">
                                  Hết hạn
                                </span>
                              ) : (
                                <div className="flex flex-col gap-1.5">
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 w-fit">
                                    Còn hiệu lực
                                  </span>
                                  <button
                                    onClick={() => {
                                      setClaimModalSerial(w);
                                      setClaimIssue('');
                                    }}
                                    className="text-[11px] font-semibold text-[#c2410c] hover:underline border border-orange-200 bg-orange-50 px-2 py-0.5 rounded w-fit"
                                  >
                                    Yêu cầu bảo hành
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900">Sổ địa chỉ nhận hàng ({addresses.length})</h2>
                    <p className="text-xs text-stone-500 mt-0.5">Địa chỉ mặc định sẽ tự động điền khi bạn tiến hành thanh toán giỏ hàng.</p>
                  </div>
                  <Button
                    onClick={() => setShowAddAddressModal(true)}
                    className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm địa chỉ mới</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {loadingAddresses ? (
                    <div className="py-8 text-center text-xs text-stone-400">Đang tải sổ địa chỉ...</div>
                  ) : addresses.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400">
                      Chưa có địa chỉ nào. Bấm "Thêm địa chỉ mới" để lưu địa chỉ nhận hàng đầu tiên.
                    </div>
                  ) : addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-lg border text-xs transition ${
                        addr.isDefault ? 'border-[#c2410c] bg-orange-50/20' : 'border-stone-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{addr.name}</span>
                          <span className="text-stone-400">· {addr.phone}</span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-100 text-stone-700">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded text-emerald-800 bg-emerald-50 border border-emerald-200">
                              Mặc định
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {!addr.isDefault && (
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-stone-500 hover:text-stone-900 text-[11px] underline"
                            >
                              Thiết lập mặc định
                            </button>
                          )}
                          {addresses.length > 1 && (
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="text-rose-600 hover:underline text-[11px]"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1.5 text-stone-600 leading-normal">{addr.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. VOUCHERS TAB */}
          {activeTab === 'vouchers' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Ví Voucher & Mã giảm giá</h2>
                  <p className="text-xs text-stone-500 mt-0.5">Sử dụng các mã này tại bước thanh toán để nhận chiết khấu trực tiếp.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      code: 'TECHZONE50',
                      title: 'Giảm 50.000đ',
                      desc: 'Áp dụng cho mọi đơn linh kiện từ 1.000.000đ',
                      exp: 'HSD: 31/12/2026',
                    },
                    {
                      code: 'FREESHIP',
                      title: 'Miễn phí giao hàng',
                      desc: 'Freeship tối đa 40k toàn quốc không giới hạn',
                      exp: 'HSD: 31/12/2026',
                    },
                    {
                      code: 'SINHVIEN',
                      title: 'Giảm 100.000đ Tân Sinh Viên',
                      desc: 'Áp dụng cho đơn build PC & Laptop từ 5.000.000đ',
                      exp: 'HSD: 31/12/2026',
                    },
                  ].map((v) => (
                    <div
                      key={v.code}
                      className="p-4 rounded-lg border border-stone-200 bg-white hover:border-[#c2410c] transition space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-stone-900">{v.title}</p>
                          <p className="text-stone-500 text-[11px] mt-0.5">{v.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                        <span className="text-stone-400">{v.exp}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(v.code);
                            toast.success(`Đã sao chép mã ${v.code}`);
                          }}
                          className="font-mono font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded transition"
                        >
                          {v.code} (Sao chép)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3">Hồ sơ khách hàng</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1">Họ và tên</label>
                  <p className="font-semibold text-stone-900">{user.name}</p>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Địa chỉ Email</label>
                  <p className="font-semibold text-stone-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Số điện thoại liên hệ</label>
                  <p className="font-semibold text-stone-900">{user.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Hạng thành viên</label>
                  <p className="font-semibold text-stone-900">{user.membershipTier || 'Thành viên Bạc'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 7. MEMBERSHIP & LOYALTY TIERS TAB */}
          {activeTab === 'membership' && (
            <div className="space-y-6">
              {/* VIP Digital Member Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-stone-950 via-stone-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl border border-amber-500/20">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-600 text-stone-950 font-black shadow-md">
                        <Crown className="w-4 h-4 fill-stone-950" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                        TechZone VIP Club
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {user.name}
                      </h2>
                      <p className="text-xs font-mono text-stone-400 mt-0.5">
                        MÃ THẺ: TZ-MEMBER-{(user.id || 9999).toString().padStart(6, '0')}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Hạng thẻ: {user.membershipTier || 'Thành viên Bạc (Silver)'}</span>
                    </div>
                  </div>

                  {/* Points Box */}
                  <div className="sm:text-right bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 sm:min-w-[200px]">
                    <span className="text-xs text-stone-300 block">Điểm thưởng khả dụng</span>
                    <strong className="text-3xl font-black text-amber-400 block mt-1">
                      {(user.points || 1250).toLocaleString('vi-VN')} <span className="text-sm font-normal text-amber-200">pts</span>
                    </strong>
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      Tương đương: <strong>{formatVnd((user.points || 1250) * 100)}</strong>
                    </span>
                  </div>
                </div>

                {/* Tier Progress Bar */}
                <div className="relative z-10 mt-6 pt-5 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-xs text-stone-300">
                    <span>Tiến độ thăng hạng <strong>Vàng (Gold VIP)</strong></span>
                    <span>Đã chi tiêu: <strong>14.500.000đ / 30.000.000đ</strong> (48%)</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500" style={{ width: '48%' }} />
                  </div>
                  <p className="text-[11px] text-stone-400">
                    💡 Còn thiếu <strong>15.500.000đ</strong> nữa để nâng hạng Vàng và hưởng đặc quyền miễn phí vệ sinh PC trọn đời!
                  </p>
                </div>

                {/* Decorative background logo */}
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
                  <Crown className="w-72 h-72 text-amber-400" />
                </div>
              </div>

              {/* Tiers Comparison Table */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <Award className="w-5 h-5 text-[#c2410c]" />
                  <h3 className="text-sm font-bold text-stone-900">Bảng đặc quyền các hạng thành viên</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {/* Đồng */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-700 font-bold text-sm">Hạng Đồng</strong>
                      <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded font-bold">Từ 0đ</span>
                    </div>
                    <ul className="space-y-1.5 text-stone-600 text-[11px]">
                      <li>✓ Tích lũy 1% giá trị mỗi đơn</li>
                      <li>✓ Quà sinh nhật 50.000đ</li>
                      <li>✓ Hỗ trợ kỹ thuật qua Hotline</li>
                    </ul>
                  </div>

                  {/* Bạc */}
                  <div className="p-4 rounded-xl border-2 border-stone-400 bg-stone-50/80 space-y-2.5 relative">
                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-stone-800 text-white text-[9px] font-bold">
                      Hạng hiện tại
                    </div>
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-900 font-black text-sm">Hạng Bạc</strong>
                      <span className="text-[10px] bg-stone-300 text-stone-800 px-2 py-0.5 rounded font-bold">Từ 10Tr</span>
                    </div>
                    <ul className="space-y-1.5 text-stone-700 text-[11px]">
                      <li>✓ Tích lũy 2% giá trị mỗi đơn</li>
                      <li>✓ Freeship đơn từ 200.000đ</li>
                      <li>✓ Giảm 10% công nâng cấp linh kiện</li>
                      <li>✓ Quà sinh nhật 100.000đ</li>
                    </ul>
                  </div>

                  {/* Vàng */}
                  <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-800 font-black text-sm">Hạng Vàng</strong>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">Từ 30Tr</span>
                    </div>
                    <ul className="space-y-1.5 text-stone-700 text-[11px]">
                      <li>✓ Tích lũy 3% giá trị mỗi đơn</li>
                      <li>✓ <strong>Miễn phí vệ sinh PC & tra keo trọn đời</strong></li>
                      <li>✓ Ưu tiên bảo hành 24H chuẩn hãng</li>
                      <li>✓ Quà sinh nhật 250.000đ</li>
                    </ul>
                  </div>

                  {/* Kim Cương */}
                  <div className="p-4 rounded-xl border-2 border-purple-400 bg-purple-50/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-purple-900 font-black text-sm">Kim Cương</strong>
                      <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">Từ 60Tr</span>
                    </div>
                    <ul className="space-y-1.5 text-stone-700 text-[11px]">
                      <li>✓ Tích lũy 5% giá trị mỗi đơn</li>
                      <li>✓ <strong>Hỗ trợ kỹ thuật tận nơi miễn phí</strong></li>
                      <li>✓ Mượn máy cao cấp khi bảo hành</li>
                      <li>✓ Quà sinh nhật 500.000đ</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Point History & Exchange */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-stone-900">Lịch sử tích & đổi điểm gần nhất</h3>
                  <button
                    onClick={() => {
                      toast.success('Đã quy đổi 500 điểm thành mã giảm giá TECHZONE50!');
                      setActiveTab('vouchers');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold transition shadow-2xs"
                  >
                    Đổi 500 pts lấy Voucher 50K
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {[
                    { action: 'Tích điểm đơn hàng #ORD-101', date: '25/09/2026', pts: '+250 pts', type: 'plus' },
                    { action: 'Đánh giá sản phẩm Card RTX 4070 Ti', date: '26/09/2026', pts: '+50 pts', type: 'plus' },
                    { action: 'Điểm thưởng chào mừng thành viên mới', date: '15/09/2026', pts: '+1.000 pts', type: 'plus' },
                  ].map((log, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-800">{log.action}</p>
                        <span className="text-[11px] text-stone-400">{log.date}</span>
                      </div>
                      <span className="font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {log.pts}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Review Modal Form */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900">Đánh giá sản phẩm đã mua</h3>
              <button
                onClick={() => setReviewModalItem(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs">
              <span className="text-stone-500">Sản phẩm:</span>
              <p className="font-bold text-stone-900 mt-0.5">{reviewModalItem.productName}</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mức độ hài lòng của bạn:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      type="button"
                      key={score}
                      onClick={() => setRatingScore(score)}
                      className="p-1 transition hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          score <= ratingScore ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-medium text-stone-600 ml-2">
                    {ratingScore === 5 && 'Tuyệt vời'}
                    {ratingScore === 4 && 'Hài lòng'}
                    {ratingScore === 3 && 'Bình thường'}
                    {ratingScore === 2 && 'Chưa hài lòng'}
                    {ratingScore === 1 && 'Rất tệ'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Chia sẻ trải nghiệm thực tế (Đóng gói, chất lượng, hiệu năng...):
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ví dụ: Sản phẩm chính hãng tem niêm phong đầy đủ, cắm vào nhận đủ bus RAM, nhiệt độ rất mát..."
                  className="w-full rounded-lg border border-stone-300 p-3 text-xs focus:border-[#c2410c] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewModalItem(null)}
                  className="text-xs px-4 py-2 border-stone-300 text-stone-700"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs px-5 py-2 font-bold rounded-lg"
                >
                  Gửi đánh giá (+50 xu)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal Form */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900">Thêm địa chỉ giao nhận mới</h3>
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Họ tên người nhận *</label>
                <input
                  required
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full rounded-lg border border-stone-300 p-2 text-xs focus:border-[#c2410c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Số điện thoại *</label>
                <input
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  placeholder="0912345678"
                  className="w-full rounded-lg border border-stone-300 p-2 text-xs focus:border-[#c2410c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Địa chỉ chi tiết (Số nhà, tên đường, Phường/Xã, Quận/Huyện) *</label>
                <textarea
                  required
                  rows={2}
                  value={newAddr.address}
                  onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                  placeholder="Số 45, Đường CMT8, Phường 5, Quận 3, TP.HCM"
                  className="w-full rounded-lg border border-stone-300 p-2 text-xs focus:border-[#c2410c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Loại địa chỉ</label>
                <div className="flex gap-2">
                  {['Nhà riêng', 'Công ty', 'Khác'].map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setNewAddr({ ...newAddr, label: lbl })}
                      className={`px-3 py-1.5 rounded-lg border font-medium ${
                        newAddr.label === lbl
                          ? 'border-[#c2410c] bg-orange-50 text-[#c2410c]'
                          : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddAddressModal(false)}
                  className="text-xs px-3 py-1.5 border-stone-300 text-stone-700"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs px-4 py-1.5 font-bold rounded-lg"
                >
                  Lưu địa chỉ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Claim Warranty Modal Form */}
      {claimModalSerial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900">Yêu cầu bảo hành sản phẩm</h3>
              <button
                onClick={() => setClaimModalSerial(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1 rounded-lg bg-stone-50 border border-stone-100 p-3">
              <div className="flex justify-between">
                <span className="text-stone-500">Sản phẩm:</span>
                <strong className="text-stone-900 text-right">{claimModalSerial.productName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Serial:</span>
                <strong className="font-mono text-stone-900">{claimModalSerial.serial}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Hạn bảo hành:</span>
                <strong className="text-emerald-700">{claimModalSerial.expiresAt}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mô tả lỗi gặp phải (tình trạng thiết bị, thời điểm phát sinh...):
                </label>
                <textarea
                  required
                  rows={4}
                  value={claimIssue}
                  onChange={(e) => setClaimIssue(e.target.value)}
                  placeholder="Ví dụ: Máy tự động tắt nguồn khi chạy game nặng khoảng 30 phút, quạt tản nhiệt phát tiếng ồn lớn..."
                  className="w-full rounded-lg border border-stone-300 p-3 text-xs focus:border-[#c2410c] focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200/60 p-3 text-[11px] text-blue-900">
                Sau khi gửi yêu cầu, hệ thống sẽ cấp <strong>mã RMA</strong> để bạn theo dõi tiến độ sửa chữa tại mục
                "Tra cứu bảo hành" hoặc trang <strong>/warranty</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setClaimModalSerial(null)}
                  className="text-xs px-4 py-2 border-stone-300 text-stone-700"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={savingClaim}
                  className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs px-5 py-2 font-bold rounded-lg disabled:opacity-60"
                >
                  {savingClaim ? 'Đang gửi...' : 'Gửi yêu cầu bảo hành'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
