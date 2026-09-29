import type { User } from '../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface AuthResponse {
  token: string;
  user: User;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let msg = 'Đăng nhập không thành công';
    try {
      const err = await res.json();
      if (err.message) msg = err.message;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

export async function registerUser(name: string, email: string, password: string, phone?: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ fullName: name, email, password, phone }),
  });

  if (!res.ok) {
    let msg = 'Đăng ký tài khoản không thành công';
    try {
      const err = await res.json();
      if (err.message) msg = err.message;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

export async function fetchUserProfile(email: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/by-email?email=${encodeURIComponent(email)}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error('Không thể tải thông tin tài khoản');
  return res.json();
}
