import { apiClient } from './apiClient';

export interface Brand {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  productCount: number;
  totalStock: number;
  totalSold: number;
}

export interface BrandPayload {
  name: string;
  slug?: string;
  isActive?: boolean;
}

export async function fetchBrands(): Promise<Brand[]> {
  return apiClient.get<Brand[]>('/api/brands');
}

export async function createBrand(payload: BrandPayload): Promise<Brand> {
  return apiClient.post<Brand>('/api/brands', payload);
}

export async function updateBrand(id: number, payload: BrandPayload): Promise<Brand> {
  return apiClient.put<Brand>(`/api/brands/${id}`, payload);
}

export async function deleteBrand(id: number): Promise<void> {
  await apiClient.delete(`/api/brands/${id}`);
}
