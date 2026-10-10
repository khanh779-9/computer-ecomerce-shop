import { ENV } from '../config/env';

const TOKEN_KEY_INTERNAL = 'techzone_jwt_token_internal';
const TOKEN_KEY_EXTERNAL = 'techzone_jwt_token_external';
const ACTIVE_SCOPE_KEY = 'techzone_active_scope';

export type AuthScope = 'internal' | 'external';

function storageKeyFor(scope?: AuthScope): string {
  const resolved = scope ?? getActiveScope();
  return resolved === 'internal' ? TOKEN_KEY_INTERNAL : TOKEN_KEY_EXTERNAL;
}

/** Phiên đang hoạt động (lần đăng nhập cuối cùng) */
export function getActiveScope(): AuthScope {
  try {
    return localStorage.getItem(ACTIVE_SCOPE_KEY) === 'internal' ? 'internal' : 'external';
  } catch {
    return 'external';
  }
}

/** Đổi phiên hoạt động (gọi sau khi đăng nhập/đăng xuất thành công) */
export function setActiveScope(scope: AuthScope): void {
  try {
    localStorage.setItem(ACTIVE_SCOPE_KEY, scope);
  } catch (e) {
    console.error('Error saving active scope', e);
  }
}

export const tokenStorage = {
  get: (scope?: AuthScope): string | null => {
    try {
      return localStorage.getItem(storageKeyFor(scope));
    } catch {
      return null;
    }
  },
  /** Lưu token vào key của scope (KHÔNG đổi phiên active — caller tự quyết định qua setActiveScope) */
  set: (token: string, scope: AuthScope): void => {
    try {
      localStorage.setItem(storageKeyFor(scope), token);
    } catch (e) {
      console.error('Error saving token to localStorage', e);
    }
  },
  setActiveScope,
  remove: (scope?: AuthScope): void => {
    try {
      localStorage.removeItem(storageKeyFor(scope));
    } catch (e) {
      console.error('Error removing token from localStorage', e);
    }
  },
  /** Xóa token của scope đối nghịch (dùng khi kích hoạt phiên loại kia) */
  clearOther: (keep: AuthScope): void => {
    try {
      localStorage.removeItem(keep === 'internal' ? TOKEN_KEY_EXTERNAL : TOKEN_KEY_INTERNAL);
    } catch (e) {
      console.error('Error clearing other scope token', e);
    }
  },
  clearAll: (): void => {
    try {
      // Dọn cả khóa legacy dùng chung trước đây
      localStorage.removeItem('techzone_jwt_token');
      localStorage.removeItem(TOKEN_KEY_INTERNAL);
      localStorage.removeItem(TOKEN_KEY_EXTERNAL);
    } catch (e) {
      console.error('Error clearing all tokens', e);
    }
  },
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${ENV.API_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const token = tokenStorage.get();
  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  if (!(customConfig.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `Yêu cầu thất bại (${response.status})`;
    let errorData: any = null;
    try {
      errorData = await response.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Non-json error
    }

    if (response.status === 401) {
      // Auto logout on 401 if token was invalid
      tokenStorage.remove();
      window.dispatchEvent(new CustomEvent('techzone:unauthorized'));
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}

export const apiClient = {
  get: <T>(url: string, params?: Record<string, any>, options?: RequestOptions) =>
    request<T>(url, { method: 'GET', params, ...options }),
  post: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  put: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  patch: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: <T>(url: string, params?: Record<string, any>, options?: RequestOptions) =>
    request<T>(url, { method: 'DELETE', params, ...options }),
};
