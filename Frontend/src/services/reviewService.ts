import { apiClient } from './apiClient';

export interface ReviewResponse {
  id: number;
  productId: number;
  userId?: number | null;
  orderId?: number | null;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  title?: string | null;
  content: string;
  isVerifiedPurchase: boolean;
  likesCount: number;
  status: string;
  createdAt: string;
}

export interface ReviewSummaryDto {
  averageRating: number;
  totalReviews: number;
  ratingCounts: Record<number, number>;
}

export interface ReviewCreateRequest {
  productId: number;
  orderId?: number | null;
  rating: number;
  title?: string;
  content: string;
  userName?: string;
}

export async function fetchProductReviews(productId: number): Promise<ReviewResponse[]> {
  try {
    return await apiClient.get<ReviewResponse[]>(`/api/products/${productId}/reviews`);
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
}

export async function fetchProductReviewSummary(productId: number): Promise<ReviewSummaryDto> {
  try {
    return await apiClient.get<ReviewSummaryDto>(`/api/products/${productId}/reviews/summary`);
  } catch (error) {
    console.error('Error fetching review summary:', error);
    return {
      averageRating: 5.0,
      totalReviews: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

export async function createReview(data: ReviewCreateRequest): Promise<ReviewResponse> {
  return await apiClient.post<ReviewResponse>('/api/reviews', data);
}

export async function fetchMyReviews(): Promise<ReviewResponse[]> {
  return await apiClient.get<ReviewResponse[]>('/api/reviews/my-reviews');
}

export async function likeReview(reviewId: number): Promise<ReviewResponse> {
  return await apiClient.post<ReviewResponse>(`/api/reviews/${reviewId}/like`, {});
}
