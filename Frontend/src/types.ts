export type Product = {
  id: number;
  sku: string;
  name: string;
  brand: string;
  cat: string;
  price: number;
  old: number;
  rate: number;
  reviews: number;
  sold: number;
  stock: number;
  art: string;
  tint: string;
  imageUrl?: string;
  createdAt?: string;
  tags: string[];
  hot?: boolean;
  description?: string;
  brandId?: number;
  categoryId?: number;
  manufacturerId?: number;
  specifications?: string;
  warrantyMonths?: number;
  active?: boolean;
  publishedAt?: string;
};

export type CartItem = Product & { qty: number };
