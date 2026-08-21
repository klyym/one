'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { StoreProvider } from '@/lib/store';
import { AuthProvider, useAuth } from '@/lib/auth';
import { StudioProvider } from '@/lib/studio';
import { AuthGuard } from '@/components/auth/auth-guard';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // 登录页面不显示侧边栏
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StudioProvider>
        <StoreProvider>
          <MainLayoutContent>{children}</MainLayoutContent>
        </StoreProvider>
      </StudioProvider>
    </AuthProvider>
  );
}
