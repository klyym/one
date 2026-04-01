import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';

export const metadata: Metadata = {
  title: {
    default: '室内设计工作室管理系统',
    template: '%s | 室内设计工作室',
  },
  description: '专业的室内设计工作室项目管理与客户管理平台',
  keywords: [
    '室内设计',
    '工作室管理',
    '项目管理',
    '客户管理',
    '设计案例',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {isDev && <Inspector />}
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
