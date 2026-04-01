'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Palette,
  UserCog,
  Settings,
  Home,
} from 'lucide-react';

const navigation = [
  { name: '数据看板', href: '/', icon: LayoutDashboard },
  { name: '项目管理', href: '/projects', icon: FolderKanban },
  { name: '客户管理', href: '/clients', icon: Users },
  { name: '案例展示', href: '/cases', icon: Palette },
  { name: '设计师', href: '/designers', icon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Home className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-foreground">
            室内设计工作室
          </span>
          <span className="text-xs text-muted-foreground">管理系统</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
          系统设置
        </Link>
        <div className="mt-4 px-3 py-2 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">版本 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
