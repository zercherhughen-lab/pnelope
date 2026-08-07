import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const demoLogin = async () => {
    try {
      const res = await api.post('/auth/demo');
      localStorage.setItem('vauth_token', res.data.token);
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed demo login:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('vauth_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setLoading(false);
          return;
        } catch (err) {
          console.error('Failed to authenticate token:', err);
          localStorage.removeItem('vauth_token');
        }
      }
      
      // Auto-login as demo user if no valid token present
      await demoLogin();
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('vauth_token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (email: string, password: string) => {
    const res = await api.post('/auth/register', { email, password });
    localStorage.setItem('vauth_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('vauth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
