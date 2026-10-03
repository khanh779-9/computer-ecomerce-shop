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
  tags: string[];
  hot?: boolean;
  description?: string;
};

export type CartItem = Product & { qty: number };
