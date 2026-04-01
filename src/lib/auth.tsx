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
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
}

// 模拟用户数据（包含密码，实际项目应存储在数据库中）
const USER_STORAGE_KEY = 'studio_user';
const PASSWORDS_STORAGE_KEY = 'studio_passwords';
const USER_PROFILES_KEY = 'studio_user_profiles';

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

// 用户配置管理（存储自定义用户名和邮箱）
interface UserProfile {
  name: string;
  email: string;
}

const getUserProfiles = (): Record<string, UserProfile> => {
  try {
    const stored = localStorage.getItem(USER_PROFILES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveUserProfiles = (profiles: Record<string, UserProfile>) => {
  localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
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

// 根据邮箱获取用户信息（优先使用自定义配置）
const getUserByEmail = (email: string, profiles: Record<string, UserProfile>) => {
  // 先检查是否有自定义配置
  const customProfile = profiles[email];
  if (customProfile) {
    // 查找原始用户ID和角色
    const originalUser = DEMO_USERS.find(u => u.email === email);
    if (originalUser) {
      return {
        id: originalUser.id,
        name: customProfile.name,
        email: customProfile.email,
        avatar: originalUser.avatar,
        role: originalUser.role,
      };
    }
  }
  
  // 使用默认配置
  return DEMO_USERS.find(u => u.email === email);
};

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

    // 获取存储的密码和用户配置
    const passwords = getPasswords();
    const profiles = getUserProfiles();

    // 查找用户（支持自定义邮箱）
    let foundUser = getUserByEmail(email, profiles);
    
    // 如果没找到，检查是否有用户修改了邮箱
    if (!foundUser) {
      for (const [originalEmail, profile] of Object.entries(profiles)) {
        if (profile.email === email) {
          foundUser = getUserByEmail(originalEmail, profiles);
          break;
        }
      }
    }

    if (!foundUser) {
      return false;
    }

    // 获取密码（使用原始邮箱查找）
    const originalEmail = DEMO_USERS.find(u => u.id === foundUser!.id)?.email || email;
    const storedPassword = passwords[originalEmail];
    const validPassword = storedPassword || (originalEmail === 'admin@studio.com' ? 'admin123' : '123456');

    if (password !== validPassword) {
      return false;
    }

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

    // 获取原始邮箱
    const originalEmail = DEMO_USERS.find(u => u.id === user.id)?.email || user.email;

    // 获取当前用户的密码
    const passwords = getPasswords();
    const storedPassword = passwords[originalEmail] || 
      (originalEmail === 'admin@studio.com' ? 'admin123' : '123456');

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
    passwords[originalEmail] = newPassword;
    savePasswords(passwords);

    return { success: true, message: '密码修改成功' };
  };

  const updateProfile = async (
    newName: string,
    newEmail: string
  ): Promise<{ success: boolean; message: string }> => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!user) {
      return { success: false, message: '用户未登录' };
    }

    // 验证用户名
    if (!newName.trim()) {
      return { success: false, message: '用户名不能为空' };
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return { success: false, message: '请输入有效的邮箱地址' };
    }

    // 获取原始邮箱
    const originalEmail = DEMO_USERS.find(u => u.id === user.id)?.email || user.email;

    // 检查邮箱是否已被其他用户使用
    const profiles = getUserProfiles();
    for (const [profileOriginalEmail, profile] of Object.entries(profiles)) {
      if (profileOriginalEmail !== originalEmail && profile.email === newEmail) {
        return { success: false, message: '该邮箱已被其他用户使用' };
      }
    }

    // 检查默认用户邮箱冲突
    const otherDefaultUsers = DEMO_USERS.filter(u => u.email !== originalEmail);
    if (otherDefaultUsers.some(u => u.email === newEmail)) {
      // 检查这个默认用户是否已被修改过邮箱
      if (!profiles[otherDefaultUsers.find(u => u.email === newEmail)!.email]) {
        return { success: false, message: '该邮箱已被其他用户使用' };
      }
    }

    // 更新用户配置
    profiles[originalEmail] = {
      name: newName.trim(),
      email: newEmail,
    };
    saveUserProfiles(profiles);

    // 更新当前用户状态
    const updatedUser: User = {
      ...user,
      name: newName.trim(),
      email: newEmail,
    };
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

    return { success: true, message: '个人信息修改成功' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        changePassword,
        updateProfile,
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
