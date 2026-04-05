'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StudioInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface StudioContextType {
  studioInfo: StudioInfo;
  updateStudioInfo: (info: Partial<StudioInfo>) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
  error: string | null;
}

const STUDIO_STORAGE_KEY = 'studio_info';
const DEFAULT_STUDIO_INFO: StudioInfo = {
  name: '室内设计工作室',
  address: '',
  phone: '',
  email: '',
};

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [studioInfo, setStudioInfo] = useState<StudioInfo>(DEFAULT_STUDIO_INFO);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化：先从 localStorage 读取，然后尝试从数据库同步
  useEffect(() => {
    async function initStudio() {
      try {
        // 1. 先从 localStorage 读取（快速展示）
        const stored = localStorage.getItem(STUDIO_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setStudioInfo({ ...DEFAULT_STUDIO_INFO, ...parsed });
          } catch {
            // 解析失败使用默认值
          }
        }

        // 2. 尝试从数据库同步（仅在服务端）
        if (typeof window === 'undefined') {
          try {
            const { dbAdapter } = await import('@/storage/database/database-adapter');
            const dbStudioInfo = await dbAdapter.getStudioInfo();
            if (dbStudioInfo) {
              setStudioInfo({
                name: dbStudioInfo.name || DEFAULT_STUDIO_INFO.name,
                address: dbStudioInfo.address || '',
                phone: dbStudioInfo.phone || '',
                email: dbStudioInfo.email || '',
              });
              // 同步到 localStorage
              localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(dbStudioInfo));
            }
          } catch (dbError) {
            // 数据库不可用时不报错，继续使用 localStorage
            console.log('数据库不可用，使用本地存储:', dbError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    initStudio();
  }, []);

  const updateStudioInfo = async (info: Partial<StudioInfo>): Promise<{ success: boolean; message: string }> => {
    const updatedInfo = { ...studioInfo, ...info };

    try {
      // 1. 更新 localStorage
      localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(updatedInfo));
      setStudioInfo(updatedInfo);

      // 2. 尝试同步到数据库（仅在服务端）
      if (typeof window === 'undefined') {
        try {
          const { dbAdapter } = await import('@/storage/database/database-adapter');
          await dbAdapter.updateStudioInfo(updatedInfo);
        } catch (dbError) {
          console.warn('数据库同步失败，仅更新本地存储:', dbError);
          // 不影响操作，数据库不可用时仍能正常使用
        }
      }

      setError(null);
      return { success: true, message: '保存成功' };
    } catch (err) {
      const errorMessage = '保存失败，请稍后重试';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  return (
    <StudioContext.Provider value={{ studioInfo, updateStudioInfo, isLoading, error }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}
