'use client';

import { Sidebar } from './sidebar';
import { StoreProvider } from '@/lib/store';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </StoreProvider>
  );
}
