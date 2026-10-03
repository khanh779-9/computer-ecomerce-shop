import React, { useState, useEffect, useMemo } from 'react';
import { Star, X } from 'lucide-react';
import { useAuth } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';
import {
  ReviewResponse,
  ReviewSummaryDto,
  fetchProductReviews,
  fetchProductReviewSummary,
  createReview,
  likeReview,
} from '../../services/reviewService';
import { Button } from '../ui/Button';

interface ProductReviewSectionProps {
  productId: number;
  productName: string;
  productBrand?: string;
  initialRating?: number;
  initialReviewCount?: number;
  onReviewAdded?: (newAvgRating: number, newCount: number) => void;
}

const STAR_LABELS: Record<number, string> = {
  1: '1 sao - Rất tệ',
  2: '2 sao - Tệ',
  3: '3 sao - Bình thường',
  4: '4 sao - Hài lòng',
  5: '5 sao - Rất hài lòng',
};

export const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({
  productId,
  productName,
  initialRating = 5.0,
  initialReviewCount = 0,
  onReviewAdded,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [summary, setSummary] = useState<ReviewSummaryDto>({
    averageRating: initialRating,
    totalReviews: initialReviewCount,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'ALL' | 'VERIFIED'>('ALL');
  const [likedReviewIds, setLikedReviewIds] = useState<Set<number>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRating, setModalRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<string>('');
  const [modalGuestName, setModalGuestName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [revList, revSummary] = await Promise.all([
          fetchProductReviews(productId),
          fetchProductReviewSummary(productId),
        ]);
        if (isMounted) {
          setReviews(revList);
          if (revSummary && revSummary.totalReviews > 0) {
            setSummary(revSummary);
          } else if (revList.length > 0) {
            const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            let sum = 0;
            revList.forEach((r) => {
              counts[r.rating] = (counts[r.rating] || 0) + 1;
              sum += r.rating;
            });
            const avg = Math.round((sum / revList.length) * 10) / 10;
            setSummary({
              averageRating: avg,
              totalReviews: revList.length,
              ratingCounts: counts,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleLike = async (revId: number) => {
    if (likedReviewIds.has(revId)) return;
    try {
      setLikedReviewIds((prev) => new Set(prev).add(revId));
      setReviews((prev) =>
        prev.map((r) => (r.id === revId ? { ...r, likesCount: r.likesCount + 1 } : r))
      );
      await likeReview(revId);
    } catch {
      setLikedReviewIds((prev) => {
        const next = new Set(prev);
        next.delete(revId);
        return next;
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalContent.trim().length < 5) {
      toast.error('Vui lòng nhập tối thiểu 5 ký tự chia sẻ trải nghiệm của bạn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const authorName = isAuthenticated ? user?.name : modalGuestName.trim() || 'Khách hàng TechZone';

      const newRev = await createReview({
        productId,
        rating: modalRating,
        title: modalTitle.trim() || undefined,
        content: modalContent.trim(),
        userName: authorName,
      });

      const updatedList = [newRev, ...reviews];
      setReviews(updatedList);

      const newCounts = { ...summary.ratingCounts };
      newCounts[modalRating] = (newCounts[modalRating] || 0) + 1;
      const newTotal = (summary.totalReviews || 0) + 1;
      const sumStars = updatedList.reduce((acc, cur) => acc + cur.rating, 0);
      const newAvg = Math.round((sumStars / updatedList.length) * 10) / 10;

      const newSummary: ReviewSummaryDto = {
        averageRating: newAvg,
        totalReviews: newTotal,
        ratingCounts: newCounts,
      };
      setSummary(newSummary);

      if (onReviewAdded) {
        onReviewAdded(newAvg, newTotal);
      }

      toast.success('Gửi đánh giá thành công! Cảm ơn bạn đã đóng góp.');
      setIsModalOpen(false);
      setModalTitle('');
      setModalContent('');
      setModalRating(5);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi đánh giá, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = useMemo(() => {
    if (selectedStarFilter === 'ALL') return reviews;
    if (selectedStarFilter === 'VERIFIED') return reviews.filter((r) => r.isVerifiedPurchase);
    return reviews.filter((r) => r.rating === selectedStarFilter);
  }, [reviews, selectedStarFilter]);

  const totalReviewsCount = summary.totalReviews || reviews.length;
  const avgRatingFormatted = summary.averageRating ? summary.averageRating.toFixed(1) : '5.0';

  return (
    <section className="mt-14 pt-8 border-t border-stone-200" id="product-reviews-section">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            Đánh giá sản phẩm
          </h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Nhận xét thực tế từ khách hàng cho {productName}
          </p>
        </div>

        <Button
          variant="solid"
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-4 text-xs font-semibold rounded-lg bg-[#c2410c] hover:bg-[#ea580c] text-white"
        >
          Viết đánh giá
        </Button>
      </div>

      {/* 2. Simple Rating Summary */}
      <div className="mt-5 p-5 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col md:flex-row items-center gap-6">
        {/* Score Column */}
        <div className="flex flex-col items-center justify-center text-center md:w-48 shrink-0">
          <div className="text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            {avgRatingFormatted}
            <span className="text-lg text-stone-400 font-normal"> / 5</span>
          </div>

          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(summary.averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>

          <span className="mt-1 text-xs text-stone-500">
            {totalReviewsCount} đánh giá
          </span>
        </div>

        {/* Breakdown Bars */}
        <div className="flex-1 w-full space-y-1.5 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.ratingCounts?.[star] || 0;
            const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
            return (
              <button
                key={star}
                onClick={() => setSelectedStarFilter(selectedStarFilter === star ? 'ALL' : star)}
                className="flex items-center gap-3 text-xs w-full text-stone-600 hover:text-stone-900 transition"
              >
                <span className="w-10 text-left font-medium">{star} sao</span>
                <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-stone-400">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Simple Text Filter Pills */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedStarFilter('ALL')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
            selectedStarFilter === 'ALL'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Tất cả ({totalReviewsCount})
        </button>

        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStarFilter(s)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              selectedStarFilter === s
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {s} sao ({summary.ratingCounts?.[s] || 0})
          </button>
        ))}

        <button
          onClick={() => setSelectedStarFilter('VERIFIED')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
            selectedStarFilter === 'VERIFIED'
              ? 'bg-emerald-700 text-white'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          Đã mua hàng
        </button>
      </div>

      {/* 4. Reviews List */}
      <div className="mt-5 divide-y divide-stone-100 border-t border-stone-100">
        {loading ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            Đang tải đánh giá...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-10 text-center text-xs text-stone-500">
            <p>Chưa có đánh giá nào cho mục này.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-[#c2410c] font-semibold hover:underline"
            >
              Viết đánh giá đầu tiên
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="py-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-stone-800">
                    {rev.userName}
                  </span>
                  {rev.isVerifiedPurchase && (
                    <span className="text-[11px] text-emerald-600 font-medium">
                      ✓ Đã mua hàng
                    </span>
                  )}
                  <span className="text-stone-300 text-xs">·</span>
                  <span className="text-[11px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <button
                  onClick={() => handleLike(rev.id)}
                  disabled={likedReviewIds.has(rev.id)}
                  className={`text-xs transition ${
                    likedReviewIds.has(rev.id)
                      ? 'text-[#c2410c] font-medium'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Hữu ích ({rev.likesCount})
                </button>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((st) => (
                  <Star
                    key={st}
                    className={`w-3.5 h-3.5 ${
                      st <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              {rev.title && (
                <div className="font-medium text-xs text-stone-900 pt-0.5">
                  {rev.title}
                </div>
              )}
              <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                {rev.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 5. Minimalist Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Viết đánh giá sản phẩm</h3>
                <p className="text-xs text-stone-400 truncate max-w-xs mt-0.5">{productName}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReview} className="p-5 space-y-3.5 text-xs">
              {/* Star Picker */}
              <div className="flex flex-col items-center justify-center py-2 bg-stone-50 rounded-lg border border-stone-100">
                <span className="text-stone-500 mb-1">Mức độ hài lòng:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setModalRating(star)}
                      className="p-1 transition"
                      aria-label={`${star} sao`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || modalRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="mt-1 text-[11px] font-medium text-stone-700">
                  {STAR_LABELS[hoverRating || modalRating]}
                </span>
              </div>

              {/* Reviewer Name */}
              {isAuthenticated ? (
                <div className="text-stone-500">
                  Đánh giá với tên: <strong className="text-stone-800">{user?.name || user?.email}</strong>
                </div>
              ) : (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Tên của bạn (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={modalGuestName}
                    onChange={(e) => setModalGuestName(e.target.value)}
                    placeholder="VD: Anh Tuấn"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-[#c2410c]"
                  />
                  <p className="mt-1 text-[11px] text-stone-400">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="text-[#c2410c] hover:underline"
                    >
                      Đăng nhập
                    </button>{' '}
                    để tự động liên kết tài khoản.
                  </p>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Tiêu đề (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn"
                  maxLength={200}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-[#c2410c]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nhận xét chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  placeholder="Chia sẻ cảm nhận về chất lượng, tốc độ, đóng gói..."
                  minLength={5}
                  maxLength={2000}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-[#c2410c] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 font-medium text-stone-500 hover:text-stone-800"
                >
                  Hủy
                </button>
                <Button
                  type="submit"
                  variant="solid"
                  disabled={isSubmitting || modalContent.trim().length < 5}
                  className="px-4 py-2 font-medium rounded-lg bg-[#c2410c] hover:bg-[#ea580c] text-white"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
export default ProductReviewSection;
