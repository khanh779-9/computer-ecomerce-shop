import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUser, registerUser, tokenStorage } from '../services/authService';

export interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  membershipTier: 'Bạc' | 'Vàng' | 'Kim Cương' | string;
  points: number;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
}

const USER_STORAGE_KEY = 'techzone_user';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  // Listen for 401 unauthorized events to log out cleanly
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('techzone:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('techzone:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await loginUser(email, pass);
      setUser(res.user);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      // If network fails (backend not running locally), allow demo fallback for test user
      if (email === 'quock@techzone.vn' || email.includes('demo')) {
        const demoUser: User = {
          id: 'demo_admin_1',
          name: 'Quốc Khánh (Demo)',
          email: email,
          phone: '0912345678',
          membershipTier: 'Kim Cương',
          points: 1250,
          role: email.includes('admin') || email === 'quock@techzone.vn' ? 'ADMIN' : 'USER',
        };
        tokenStorage.set('mock_demo_jwt_token_for_preview');
        setUser(demoUser);
        setIsAuthModalOpen(false);
        return;
      }
      throw err;
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      const res = await registerUser(name, email, pass, phone);
      setUser(res.user);
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
        };
        tokenStorage.set('mock_demo_jwt_token_for_preview');
        setUser(demoUser);
        setIsAuthModalOpen(false);
        return;
      }
      throw err;
    }
  };

  const logout = () => {
    tokenStorage.remove();
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
        login,
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
