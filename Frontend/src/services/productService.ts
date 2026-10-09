import type { Product } from '../types';
import { apiClient } from './apiClient';

export interface BackendProductResponse {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  sold?: number | null;
  stock?: number | null;
  art?: string | null;
  tint?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  createdAt?: string | null;
  brandId?: number | null;
  categoryId?: number | null;
  manufacturerId?: number | null;
  specifications?: string | null;
  warrantyMonths?: number | null;
  active?: boolean | null;
  publishedAt?: string | null;
}

export function mapBackendProduct(dto: BackendProductResponse): Product {
  const defaultArt = dto.art || 'laptop';
  const imgUrl = dto.imageUrl || (defaultArt.startsWith('/') || defaultArt.startsWith('http') ? defaultArt : `/images/products/${defaultArt}.svg`);

  return {
    id: dto.id,
    sku: dto.sku,
    name: dto.name,
    brand: dto.brand || '',
    cat: dto.category || '',
    price: dto.price,
    old: dto.oldPrice || dto.price,
    rate: dto.rating ?? 5.0,
    reviews: dto.reviewCount ?? 0,
    sold: dto.sold ?? 0,
    stock: dto.stock ?? 10,
    art: defaultArt,
    tint: dto.tint || '#c7d2fe',
    imageUrl: imgUrl,
    description: dto.description || '',
    createdAt: dto.createdAt || undefined,
    brandId: dto.brandId ?? undefined,
    categoryId: dto.categoryId ?? undefined,
    manufacturerId: dto.manufacturerId ?? undefined,
    specifications: dto.specifications || '',
    warrantyMonths: dto.warrantyMonths ?? undefined,
    active: dto.active ?? true,
    publishedAt: dto.publishedAt || undefined,
    tags: dto.sold && dto.sold > 1000 ? ['Bán chạy'] : [],
    hot: dto.rating ? dto.rating >= 4.7 : false,
  };
}

export interface ProductUpsertPayload {
  sku?: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  art?: string;
  tint?: string;
  imageUrl?: string;
  description?: string;
  brandId?: number;
  categoryId?: number;
  manufacturerId?: number;
  specifications?: string;
  warrantyMonths?: number;
  active?: boolean;
  publishedAt?: string;
}

export async function createProduct(payload: ProductUpsertPayload): Promise<Product> {
  const data = await apiClient.post<BackendProductResponse>('/api/products', payload);
  return mapBackendProduct(data);
}

export async function updateProduct(id: number, payload: ProductUpsertPayload): Promise<Product> {
  const data = await apiClient.put<BackendProductResponse>(`/api/products/${id}`, payload);
  return mapBackendProduct(data);
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/api/products/${id}`);
}

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ url: string }>('/api/products/images', formData);
  return response.url;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchProducts(search?: string, category?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) params.append('search', search.trim());
  if (category && category !== 'Tất cả') params.append('category', category);

  const url = `${API_BASE}/api/products${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Lỗi tải dữ liệu sản phẩm từ máy chủ (${res.status})`);
  }
  const data: BackendProductResponse[] = await res.json();
  return data.map(mapBackendProduct);
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const url = `${API_BASE}/api/products/${id}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Lỗi tải thông tin sản phẩm #${id} (${res.status})`);
  }
  const data: BackendProductResponse = await res.json();
  return mapBackendProduct(data);
}

export async function fetchTrendingSearches(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products/trending-searches`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Trending API error');
    return await res.json();
  } catch {
    return [
      'Laptop Gaming',
      'RTX 4060',
      'Bàn phím cơ',
      'Màn hình 2K',
      'Logitech G304',
      'Tai nghe chụp tai',
      'Core i7 14700K',
      'RAM 16GB',
    ];
  }
}
