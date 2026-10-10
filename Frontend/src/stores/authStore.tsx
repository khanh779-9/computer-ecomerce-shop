import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUser, registerUser, tokenStorage, getActiveScope, setActiveScope } from '../services/authService';
import type { AuthScope } from '../services/apiClient';

export interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  membershipTier: 'Bạc' | 'Vàng' | 'Kim Cương' | string;
  points: number;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  /** 'internal' = tài khoản nội bộ (users), 'external' = tài khoản khách hàng (customers) */
  scope?: AuthScope;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  activeScope: AuthScope;
  login: (email: string, pass: string) => Promise<User>;
  loginInternal: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
}

const USER_KEY_INTERNAL = 'techzone_user_internal';
const USER_KEY_EXTERNAL = 'techzone_user_external';

const AuthContext = createContext<AuthContextType | null>(null);

function readUserForScope(scope: AuthScope): User | null {
  try {
    const key = scope === 'internal' ? USER_KEY_INTERNAL : USER_KEY_EXTERNAL;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveUserForScope(scope: AuthScope, user: User | null): void {
  try {
    const key = scope === 'internal' ? USER_KEY_INTERNAL : USER_KEY_EXTERNAL;
    if (user) {
      localStorage.setItem(key, JSON.stringify(user));
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error('Error saving user session', e);
  }
}

function clearSession(scope: AuthScope): void {
  tokenStorage.remove(scope);
  saveUserForScope(scope, null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Phiên hoạt động = scope đăng nhập gần nhất; khởi động lại vẫn giữ đúng phiên đó
  const [activeScope, setActiveScopeState] = useState<AuthScope>(() => {
    const scope = getActiveScope();
    return readUserForScope(scope) ? scope : (readUserForScope(scope === 'internal' ? 'external' : 'internal') ? (scope === 'internal' ? 'external' : 'internal') : scope);
  });
  const [user, setUser] = useState<User | null>(() => readUserForScope(getActiveScope()));

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      saveUserForScope(activeScope, user);
    } else {
      saveUserForScope(activeScope, null);
    }
  }, [user, activeScope]);

  const activateScope = (scope: AuthScope, nextUser: User) => {
    // Độc lập 2 phiên: kích hoạt loại này => xóa sạch token/user của loại kia
    tokenStorage.clearOther(scope);
    saveUserForScope(scope === 'internal' ? 'external' : 'internal', null);
    setActiveScope(scope);
    setActiveScopeState(scope);
    setUser(nextUser);
  };

  // Listen for 401 unauthorized events to log out cleanly
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      clearSession(activeScope);
    };
    window.addEventListener('techzone:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('techzone:unauthorized', handleUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScope]);

  /** Đăng nhập tài khoản KHÁCH HÀNG (external) — xóa phiên nội bộ đang còn */
  const login = async (email: string, pass: string) => {
    try {
      const res = await loginUser(email, pass, 'external');
      activateScope('external', { ...res.user, scope: 'external' });
      setIsAuthModalOpen(false);
      return res.user;
    } catch (err: any) {
      // Only use the preview account when the backend is unavailable.
      const isNetworkError = err instanceof TypeError ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError');
      if (isNetworkError && (email === 'quock@techzone.vn' || email.includes('demo'))) {
        const demoUser: User = {
          id: 'demo_admin_1',
          name: 'Quốc Khánh (Demo)',
          email: email,
          phone: '0912345678',
          membershipTier: 'Kim Cương',
          points: 1250,
          role: email.includes('admin') || email === 'quock@techzone.vn' ? 'ADMIN' : 'USER',
          scope: 'external',
        };
        tokenStorage.set('mock_demo_jwt_token_for_preview', 'external');
        activateScope('external', demoUser);
        setIsAuthModalOpen(false);
        return demoUser;
      }
      throw err;
    }
  };

  /** Đăng nhập TÀI KHOẢN NỘI BỘ (internal) — xóa phiên khách hàng đang còn */
  const loginInternal = async (email: string, pass: string) => {
    const res = await loginUser(email, pass, 'internal');
    const normalizedRole = res.user.role?.toUpperCase().includes('ADMIN') ? 'ADMIN' : 'USER';
    if (normalizedRole !== 'ADMIN') {
      // Không phải tài khoản nội bộ hợp lệ — chỉ hủy token internal vừa nhận,
      // phiên external đang hoạt động (token + marker) giữ nguyên không bị đụng đến
      tokenStorage.remove('internal');
      throw new Error('Tài khoản không có quyền truy cập trang nội bộ.');
    }
    activateScope('internal', { ...res.user, role: 'ADMIN', scope: 'internal' });
    return res.user;
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      const res = await registerUser(name, email, pass, phone);
      activateScope('external', { ...res.user, scope: 'external' });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        // Fallback for offline demo
        const demoUser: User = {
          id: `demo_${Date.now()}`,
          name: name,
          email: email,
          phone: phone,
          membershipTier: 'Bạc',
          points: 100,
          role: 'USER',
          scope: 'external',
        };
        tokenStorage.set('mock_demo_jwt_token_for_preview', 'external');
        activateScope('external', demoUser);
        return;
      }
      throw err;
    }
  };

  /** Đăng xuất CHỈ phiên đang hoạt động — phiên scope kia (nếu còn) không bị đụng đến */
  const logout = () => {
    tokenStorage.remove(activeScope);
    saveUserForScope(activeScope, null);
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        activeScope,
        login,
        loginInternal,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
