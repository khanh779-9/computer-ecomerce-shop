import { apiClient } from './apiClient';

export interface Employee {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  membershipTier?: string | null;
  points?: number | null;
  role: string;
  status: string;
  lastLoginAt?: string | null;
  createdAt?: string | null;
}

export interface EmployeePayload {
  email: string;
  fullName: string;
  phone?: string;
  password?: string;
  role?: string;
}

export async function fetchEmployees(): Promise<Employee[]> {
  return apiClient.get<Employee[]>('/api/users');
}

export async function createEmployee(payload: EmployeePayload): Promise<Employee> {
  return apiClient.post<Employee>('/api/users', payload);
}

export async function updateEmployee(id: number, payload: EmployeePayload): Promise<Employee> {
  return apiClient.put<Employee>(`/api/users/${id}`, payload);
}

export async function setEmployeeStatus(id: number, status: 'ACTIVE' | 'LOCKED'): Promise<Employee> {
  return apiClient.patch<Employee>(`/api/users/${id}/status`, { status });
}

export async function deleteEmployee(id: number): Promise<void> {
  await apiClient.delete(`/api/users/${id}`);
}
