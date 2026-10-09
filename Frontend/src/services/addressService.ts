import { apiClient } from './apiClient';

export interface AddressResponse {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressPayload {
  recipientName: string;
  phone: string;
  addressLine: string;
  label?: string;
  province?: string;
  district?: string;
  ward?: string;
  isDefault?: boolean;
}

export async function fetchMyAddresses(): Promise<AddressResponse[]> {
  const res = await apiClient.get<AddressResponse[] | { content?: AddressResponse[] }>(
    '/api/users/me/addresses'
  );
  return Array.isArray(res) ? res : res.content ?? [];
}

export async function fetchDefaultAddress(): Promise<AddressResponse> {
  return apiClient.get<AddressResponse>('/api/users/me/addresses/default');
}

export async function createAddress(payload: AddressPayload): Promise<AddressResponse> {
  return apiClient.post<AddressResponse>('/api/users/me/addresses', payload);
}

export async function updateAddress(id: number, payload: AddressPayload): Promise<AddressResponse> {
  return apiClient.put<AddressResponse>(`/api/users/me/addresses/${id}`, payload);
}

export async function setDefaultAddress(id: number): Promise<AddressResponse> {
  return apiClient.patch<AddressResponse>(`/api/users/me/addresses/${id}/default`);
}

export async function deleteAddress(id: number): Promise<void> {
  await apiClient.delete(`/api/users/me/addresses/${id}`);
}
