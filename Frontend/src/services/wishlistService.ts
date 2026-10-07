import { apiClient } from './apiClient';
import { mapBackendProduct, type BackendProductResponse } from './productService';
import type { Product } from '../types';

export interface WishlistItemDto {
  id: number;
  productId: number;
  product: BackendProductResponse | null;
  createdAt: string;
}

export interface WishlistItem {
  id: number;
  productId: number;
  product: Product;
  createdAt: string;
}

function mapItem(dto: WishlistItemDto): WishlistItem | null {
  if (!dto.product) return null;
  return {
    id: dto.id,
    productId: dto.productId,
    product: mapBackendProduct(dto.product),
    createdAt: dto.createdAt,
  };
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const data = await apiClient.get<WishlistItemDto[]>('/api/wishlist');
  return data.map(mapItem).filter((i): i is WishlistItem => i !== null);
}

export async function addToWishlist(productId: number): Promise<WishlistItem | null> {
  const dto = await apiClient.post<WishlistItemDto>(`/api/wishlist/${productId}`);
  return mapItem(dto);
}

export async function removeFromWishlist(productId: number): Promise<void> {
  await apiClient.delete(`/api/wishlist/${productId}`);
}

export async function clearWishlist(): Promise<void> {
  await apiClient.delete('/api/wishlist');
}
