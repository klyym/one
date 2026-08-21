'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DbStatus {
  connected: boolean;
  supabaseUrl: string;
  hasCredentials: boolean;
  error?: string;
}

export default function DbStatusCheck() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDbStatus();
  }, []);

  const checkDbStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();

      setStatus({
        connected: data.success,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured',
        hasCredentials: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        error: !data.success ? data.message : undefined,
      });
    } catch (error: unknown) {
      setStatus({
        connected: false,
        supabaseUrl: 'Unknown',
        hasCredentials: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            数据库连接状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">检查中...</p>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const StatusIcon = status.connected ? CheckCircle : status.hasCredentials ? XCircle : AlertCircle;
  const statusColor = status.connected ? 'text-green-600' : status.hasCredentials ? 'text-red-600' : 'text-yellow-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          数据库连接状态
          <StatusIcon className={`h-4 w-4 ${statusColor}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">连接状态</span>
            <Badge variant={status.connected ? 'default' : 'destructive'}>
              {status.connected ? '已连接' : '未连接'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">环境变量</span>
            <Badge variant={status.hasCredentials ? 'default' : 'secondary'}>
              {status.hasCredentials ? '已配置' : '未配置'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Supabase URL</span>
            <span className="text-xs text-muted-foreground max-w-[200px] truncate">
              {status.supabaseUrl}
            </span>
          </div>
        </div>

        {!status.connected && (
          <div className="rounded-lg bg-yellow-50 p-3 text-sm">
            <p className="font-medium text-yellow-900 mb-1">⚠️ 数据库未连接</p>
            <p className="text-yellow-700 text-xs mb-2">
              {status.hasCredentials
                ? '已配置环境变量但连接失败，请检查 Supabase 项目状态'
                : '未配置 Supabase 环境变量，数据仅保存在本地浏览器中'}
            </p>
            {!status.hasCredentials && (
              <div className="space-y-1 mt-2 text-xs">
                <p className="font-medium text-yellow-900">配置步骤：</p>
                <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                  <li>访问 Vercel 项目设置</li>
                  <li>添加环境变量：</li>
                  <li className="ml-4">NEXT_PUBLIC_SUPABASE_URL</li>
                  <li className="ml-4">NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  <li className="ml-4">SUPABASE_SERVICE_ROLE_KEY</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {status.error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm">
            <p className="font-medium text-red-900">错误信息：</p>
            <p className="text-red-700 text-xs mt-1">{status.error}</p>
          </div>
        )}

        <Button onClick={checkDbStatus} size="sm" variant="outline">
          重新检查
        </Button>
      </CardContent>
    </Card>
  );
}
