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
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
  error: string | null;
}

// 本地存储键
const USER_STORAGE_KEY = 'studio_user';
const PASSWORDS_STORAGE_KEY = 'studio_passwords';
const USER_PROFILES_KEY = 'studio_user_profiles';

// 默认用户配置（用于数据库初始化前的降级）
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

// 本地密码管理（降级方案）
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

// 本地用户配置管理
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 根据邮箱获取用户信息（支持自定义配置）
const getUserByEmail = (email: string, profiles: Record<string, UserProfile>, dbUsers?: User[]) => {
  // 先检查本地自定义配置
  const customProfile = profiles[email];
  if (customProfile) {
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
  
  // 检查数据库用户
  if (dbUsers) {
    const dbUser = dbUsers.find(u => u.email === email);
    if (dbUser) {
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        avatar: dbUser.avatar,
        role: dbUser.role,
      };
    }
  }
  
  // 使用默认配置
  return DEMO_USERS.find(u => u.email === email);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化时从 localStorage 和数据库读取
  useEffect(() => {
    async function initAuth() {
      try {
        // 1. 初始化本地降级数据
        initDefaultPasswords();

        // 2. 从 localStorage 读取
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }

        // 3. 尝试初始化数据库（如果可用）
        try {
          const { initAppDatabase } = await import('@/storage/database/init');
          await initAppDatabase();
        } catch (dbError) {
          console.log('数据库初始化失败，使用本地存储:', dbError);
        }
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // 模拟登录延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // 1. 先尝试数据库登录
      try {
        const { userService } = await import('@/storage/database/services');
        const dbUser = await userService.getByEmail(email);
        
        if (dbUser) {
          // 数据库用户登录（密码哈希验证需要在实际项目中使用 bcrypt）
          const isValidPassword = password === dbUser.password_hash; // 临时方案，实际应使用 bcrypt
          
          if (isValidPassword) {
            const userData: User = {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              avatar: dbUser.avatar,
              role: dbUser.role,
            };
            setUser(userData);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            setError(null);
            return { success: true, message: '登录成功' };
          }
        }
      } catch (dbError) {
        // 数据库不可用，继续使用本地登录
        console.log('数据库登录失败，尝试本地登录:', dbError);
      }

      // 2. 降级到本地登录
      const passwords = getPasswords();
      const profiles = getUserProfiles();
      
      let foundUser = getUserByEmail(email, profiles);

      if (!foundUser) {
        // 检查是否有用户修改了邮箱
        for (const [originalEmail, profile] of Object.entries(profiles)) {
          if (profile.email === email) {
            foundUser = getUserByEmail(originalEmail, profiles);
            break;
          }
        }
      }

      if (!foundUser) {
        setError('邮箱或密码错误');
        return { success: false, message: '邮箱或密码错误' };
      }

      const originalEmail = DEMO_USERS.find(u => u.id === foundUser!.id)?.email || email;
      const storedPassword = passwords[originalEmail];
      const validPassword = storedPassword || (originalEmail === 'admin@studio.com' ? 'admin123' : '123456');

      if (password !== validPassword) {
        setError('邮箱或密码错误');
        return { success: false, message: '邮箱或密码错误' };
      }

      setUser(foundUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser));
      setError(null);
      return { success: true, message: '登录成功' };

    } catch (err) {
      const errorMessage = '登录失败，请稍后重试';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    setError(null);
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

    // 尝试数据库修改
    try {
      const { userService } = await import('@/storage/database/services');
      const dbUser = await userService.getById(user.id);
      
      if (dbUser) {
        const isValidPassword = currentPassword === dbUser.password_hash;
        
        if (!isValidPassword) {
          return { success: false, message: '当前密码错误' };
        }

        if (newPassword.length < 6) {
          return { success: false, message: '新密码长度不能少于6位' };
        }

        if (currentPassword === newPassword) {
          return { success: false, message: '新密码不能与当前密码相同' };
        }

        // 更新数据库密码（实际应使用 bcrypt hash）
        await userService.update(user.id, { password_hash: newPassword });
        setError(null);
        return { success: true, message: '密码修改成功' };
      }
    } catch (dbError) {
      console.log('数据库修改失败，使用本地存储:', dbError);
    }

    // 降级到本地存储
    const passwords = getPasswords();
    const originalEmail = DEMO_USERS.find(u => u.id === user.id)?.email || user.email;
    const storedPassword = passwords[originalEmail] || 
      (originalEmail === 'admin@studio.com' ? 'admin123' : '123456');

    if (currentPassword !== storedPassword) {
      return { success: false, message: '当前密码错误' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: '新密码长度不能少于6位' };
    }

    if (currentPassword === newPassword) {
      return { success: false, message: '新密码不能与当前密码相同' };
    }

    passwords[originalEmail] = newPassword;
    savePasswords(passwords);
    setError(null);
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

    // 验证
    if (!newName.trim()) {
      return { success: false, message: '用户名不能为空' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return { success: false, message: '请输入有效的邮箱地址' };
    }

    // 尝试数据库更新
    try {
      const { userService } = await import('@/storage/database/services');
      
      // 检查邮箱是否已被使用
      const existingUser = await userService.getByEmail(newEmail);
      if (existingUser && existingUser.id !== user.id) {
        return { success: false, message: '该邮箱已被其他用户使用' };
      }

      await userService.update(user.id, { name: newName.trim(), email: newEmail });
      
      const updatedUser: User = { ...user, name: newName.trim(), email: newEmail };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setError(null);
      return { success: true, message: '个人信息修改成功' };
    } catch (dbError) {
      console.log('数据库更新失败，使用本地存储:', dbError);
    }

    // 降级到本地存储
    const profiles = getUserProfiles();
    const originalEmail = DEMO_USERS.find(u => u.id === user.id)?.email || user.email;

    for (const [profileOriginalEmail, profile] of Object.entries(profiles)) {
      if (profileOriginalEmail !== originalEmail && profile.email === newEmail) {
        return { success: false, message: '该邮箱已被其他用户使用' };
      }
    }

    const otherDefaultUsers = DEMO_USERS.filter(u => u.email !== originalEmail);
    if (otherDefaultUsers.some(u => u.email === newEmail)) {
      if (!profiles[otherDefaultUsers.find(u => u.email === newEmail)!.email]) {
        return { success: false, message: '该邮箱已被其他用户使用' };
      }
    }

    profiles[originalEmail] = {
      name: newName.trim(),
      email: newEmail,
    };
    saveUserProfiles(profiles);

    const updatedUser: User = { ...user, name: newName.trim(), email: newEmail };
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    setError(null);
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
        error,
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
