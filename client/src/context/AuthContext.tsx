import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

export type UserPersona = 'CUSTOMER' | 'MERCHANT_INDEPENDENT' | 'MERCHANT_CHAIN' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  persona: UserPersona;
  setPersona: (p: UserPersona) => void;
  activeOrgId: string;
  activeCity: string;
  setActiveCity: (c: string) => void;
  personaLabel: string;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (data: { name: string; email: string; password: string; role?: 'CUSTOMER' | 'ADMIN' }) => Promise<void>;
  signOut: () => void;
  wishlistCount: number;
  refreshWishlistCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('evalipie_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('evalipie_token') || null;
  });

  const [persona, setPersona] = useState<UserPersona>('CUSTOMER');
  const [activeCity, setActiveCity] = useState<string>('Bengaluru');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  // Sync token and user in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('evalipie_token', token);
    } else {
      localStorage.removeItem('evalipie_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('evalipie_user', JSON.stringify(user));
      if (user.role === 'ADMIN') {
        setPersona('ADMIN');
      }
    } else {
      localStorage.removeItem('evalipie_user');
    }
  }, [user]);

  // Check current session on mount
  useEffect(() => {
    if (token && !user) {
      api.getMe()
        .then(res => {
          if (res?.user) {
            setUser(res.user);
          }
        })
        .catch(() => {
          // Token expired or invalid
          setToken(null);
          setUser(null);
        });
    }
    refreshWishlistCount();
  }, [token]);

  const refreshWishlistCount = async () => {
    try {
      const userId = user?.id || 'usr-default-customer';
      const list = await api.getWishlist(userId);
      setWishlistCount(Array.isArray(list) ? list.length : 0);
    } catch {
      setWishlistCount(0);
    }
  };

  const signIn = async (credentials: { email: string; password: string }) => {
    const res = await api.signIn(credentials);
    setUser(res.user);
    setToken(res.token);
    setIsAuthModalOpen(false);
    refreshWishlistCount();
  };

  const signUp = async (data: { name: string; email: string; password: string; role?: 'CUSTOMER' | 'ADMIN' }) => {
    const res = await api.signUp(data);
    setUser(res.user);
    setToken(res.token);
    setIsAuthModalOpen(false);
    refreshWishlistCount();
  };

  const signOut = () => {
    api.logout().catch(() => {});
    setUser(null);
    setToken(null);
    setPersona('CUSTOMER');
    setWishlistCount(0);
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const activeOrgId = persona === 'MERCHANT_INDEPENDENT' 
    ? 'org-sharma' 
    : persona === 'MERCHANT_CHAIN' 
    ? 'org-citysuper' 
    : 'org-sharma';

  const personaLabel = persona === 'CUSTOMER'
    ? user ? `${user.fullName} (${activeCity})` : `Shopper (${activeCity})`
    : persona === 'MERCHANT_INDEPENDENT'
    ? 'Sharma Electronics (Shopkeeper)'
    : persona === 'MERCHANT_CHAIN'
    ? 'City Supermarket (Chain Manager)'
    : 'Platform Administrator';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        persona,
        setPersona,
        activeOrgId,
        activeCity,
        setActiveCity,
        personaLabel,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        wishlistCount,
        refreshWishlistCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
