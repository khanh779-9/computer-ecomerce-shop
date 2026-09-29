import type { Product } from '../types';

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
}

export function mapBackendProduct(dto: BackendProductResponse): Product {
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
    art: dto.art || 'laptop',
    tint: dto.tint || '#c7d2fe',
    tags: dto.sold && dto.sold > 1000 ? ['Bán chạy'] : [],
    hot: dto.rating ? dto.rating >= 4.7 : false,
  };
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

