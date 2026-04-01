'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
}

// 模拟用户数据（包含密码，实际项目应存储在数据库中）
const USER_STORAGE_KEY = 'studio_user';
const PASSWORDS_STORAGE_KEY = 'studio_passwords';

// 初始化默认用户密码
const initDefaultPasswords = () => {
  const stored = localStorage.getItem(PASSWORDS_STORAGE_KEY);
  if (!stored) {
    const defaultPasswords: Record<string, string> = {
      'admin@studio.com': 'admin123',
      'chen@studio.com': '123456',
    };
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(defaultPasswords));
  }
};

const getPasswords = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const savePasswords = (passwords: Record<string, string>) => {
  localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
};

// 用户基本信息
const DEMO_USERS = [
  {
    id: '1',
    name: '管理员',
    email: 'admin@studio.com',
    avatar: '',
    role: '管理员',
  },
  {
    id: '2',
    name: '陈设计师',
    email: 'chen@studio.com',
    avatar: '',
    role: '首席设计师',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查本地存储
  useEffect(() => {
    // 初始化默认密码
    initDefaultPasswords();

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // 模拟登录延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 获取存储的密码
    const passwords = getPasswords();
    const storedPassword = passwords[email];

    // 如果没有存储的密码，使用默认密码
    const validPassword = storedPassword || (email === 'admin@studio.com' ? 'admin123' : '123456');

    if (password !== validPassword) {
      return false;
    }

    const foundUser = DEMO_USERS.find(u => u.email === email);

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        avatar: foundUser.avatar,
        role: foundUser.role,
      };
      setUser(userData);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!user) {
      return { success: false, message: '用户未登录' };
    }

    // 获取当前用户的密码
    const passwords = getPasswords();
    const storedPassword = passwords[user.email] || 
      (user.email === 'admin@studio.com' ? 'admin123' : '123456');

    // 验证当前密码
    if (currentPassword !== storedPassword) {
      return { success: false, message: '当前密码错误' };
    }

    // 验证新密码
    if (newPassword.length < 6) {
      return { success: false, message: '新密码长度不能少于6位' };
    }

    if (currentPassword === newPassword) {
      return { success: false, message: '新密码不能与当前密码相同' };
    }

    // 更新密码
    passwords[user.email] = newPassword;
    savePasswords(passwords);

    return { success: true, message: '密码修改成功' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        changePassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
