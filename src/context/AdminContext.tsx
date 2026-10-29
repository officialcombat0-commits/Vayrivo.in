import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AdminContextType {
  adminUser: User | null;
  adminToken: string | null;
  isAuthenticated: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  adminFetch: (url: string, options?: RequestInit) => Promise<Response>;
  switchDemoRole: (role: 'owner' | 'manager-ashkand' | 'manager-surya' | 'manager' | 'staff') => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('vayrivo_admin_token');
  });

  const [adminUser, setAdminUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('vayrivo_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const adminLogin = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Admin login failed' };
      }

      if (!['owner', 'manager', 'staff'].includes(data.user.role)) {
        return { success: false, error: 'Access denied. Account does not have administrative privileges.' };
      }

      setAdminToken(data.token);
      setAdminUser(data.user);
      localStorage.setItem('vayrivo_admin_token', data.token);
      localStorage.setItem('vayrivo_admin_user', JSON.stringify(data.user));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during login request' };
    }
  };

  const adminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('vayrivo_admin_token');
    localStorage.removeItem('vayrivo_admin_user');
  };

  const adminFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (adminToken) {
      headers.set('Authorization', `Bearer ${adminToken}`);
    }
    return fetch(url, { ...options, headers });
  };

  const switchDemoRole = async (role: 'owner' | 'manager-ashkand' | 'manager-surya' | 'manager' | 'staff') => {
    let email = 'vayrivo360@gmail.com';
    let pass = '12January2009@';
    if (role === 'manager' || role === 'manager-ashkand') {
      email = 'manager@vayrivo.com';
      pass = 'Manager@2026';
    } else if (role === 'manager-surya') {
      email = 'surya@vayrivo.com';
      pass = 'Manager@2026';
    } else if (role === 'staff') {
      email = 'staff@vayrivo.com';
      pass = 'Staff@2026';
    }
    await adminLogin(email, pass);
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        adminToken,
        isAuthenticated: !!adminToken && !!adminUser,
        activeTab,
        setActiveTab,
        adminLogin,
        adminLogout,
        adminFetch,
        switchDemoRole,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
