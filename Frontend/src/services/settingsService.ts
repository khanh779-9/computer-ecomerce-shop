import { apiClient } from './apiClient';

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  valueType: string;
  description?: string | null;
  isPublic: boolean;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export async function fetchSettings(): Promise<SystemSetting[]> {
  return apiClient.get<SystemSetting[]>('/api/settings');
}

export async function updateSetting(key: string, payload: {
  value: string;
  description?: string;
  isPublic?: boolean;
}): Promise<SystemSetting> {
  return apiClient.put<SystemSetting>(`/api/settings/${key}`, payload);
}
