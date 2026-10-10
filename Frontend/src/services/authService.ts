import { apiClient, tokenStorage } from './apiClient';
import type { User } from '../stores/authStore';

export { tokenStorage, getActiveScope, setActiveScope } from './apiClient';
export type { AuthScope } from './apiClient';

export interface BackendUserDto {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  membershipTier: string;
  points: number;
  avatar?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: BackendUserDto;
}

export function mapUserDtoToUser(dto: BackendUserDto): User {
  return {
    id: dto.id,
    name: dto.fullName || dto.email.split('@')[0],
    email: dto.email,
    phone: dto.phone,
    membershipTier: (dto.membershipTier as any) || 'Bạc',
    points: dto.points ?? 0,
    role: dto.role?.toUpperCase().includes('ADMIN') ? 'ADMIN' : 'USER',
    avatar: dto.avatar,
  };
}

export async function loginUser(
  email: string,
  password: string,
  scope: 'internal' | 'external' = 'external'
): Promise<{ token: string; user: User }> {
  const data = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  tokenStorage.set(data.token, scope);
  return {
    token: data.token,
    user: mapUserDtoToUser(data.user),
  };
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ token: string; user: User }> {
  const data = await apiClient.post<AuthResponse>('/api/auth/register', {
    fullName: name,
    email,
    password,
    phone,
  });
  tokenStorage.set(data.token, 'external');
  return {
    token: data.token,
    user: mapUserDtoToUser(data.user),
  };
}

export async function fetchCurrentProfile(): Promise<User> {
  const dto = await apiClient.get<BackendUserDto>('/api/users/me');
  return mapUserDtoToUser(dto);
}
