import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipTier: 'Bạc' | 'Vàng' | 'Kim Cương';
  points: number;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
}

const DEFAULT_USER: User = {
  id: 'usr_1',
  name: 'Quốc Khánh',
  email: 'quock@techzone.vn',
  phone: '0912345678',
  membershipTier: 'Vàng',
  points: 850,
  role: 'ADMIN',
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('techzone_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER; // Default to demo user for instant rich preview
    } catch {
      return DEFAULT_USER;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem('techzone_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('techzone_user');
    }
  }, [user]);

  const login = async (email: string) => {
    // Simulated authentication
    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      membershipTier: 'Vàng',
      points: 500,
      role: email.includes('admin') ? 'ADMIN' : 'USER',
    };
    setUser(loggedUser);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name,
      email: email,
      membershipTier: 'Bạc',
      points: 100, // Welcome gift points
      role: 'USER',
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
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
