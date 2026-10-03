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
  imageUrl?: string | null;
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

