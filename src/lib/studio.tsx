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
  updateStudioInfo: (info: Partial<StudioInfo>) => void;
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

  // 初始化时从 localStorage 读取
  useEffect(() => {
    const stored = localStorage.getItem(STUDIO_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStudioInfo({ ...DEFAULT_STUDIO_INFO, ...parsed });
      } catch {
        // 解析失败使用默认值
      }
    }
  }, []);

  const updateStudioInfo = (info: Partial<StudioInfo>) => {
    setStudioInfo((prev) => {
      const updated = { ...prev, ...info };
      localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <StudioContext.Provider value={{ studioInfo, updateStudioInfo }}>
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
