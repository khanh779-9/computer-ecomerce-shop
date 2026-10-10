import { apiClient } from './apiClient';

export interface Manufacturer {
  id: number;
  name: string;
  slug: string;
  website?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  isActive: boolean;
  productCount: number;
}

export interface ManufacturerPayload {
  name: string;
  slug?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  isActive?: boolean;
}

export async function fetchManufacturers(): Promise<Manufacturer[]> {
  return apiClient.get<Manufacturer[]>('/api/manufacturers');
}

export async function createManufacturer(payload: ManufacturerPayload): Promise<Manufacturer> {
  return apiClient.post<Manufacturer>('/api/manufacturers', payload);
}

export async function updateManufacturer(id: number, payload: ManufacturerPayload): Promise<Manufacturer> {
  return apiClient.put<Manufacturer>(`/api/manufacturers/${id}`, payload);
}

export async function deleteManufacturer(id: number): Promise<void> {
  await apiClient.delete(`/api/manufacturers/${id}`);
}
