'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { setSyncStatus } from '@/components/sync-status';
import { useStore } from '@/lib/store';
import { syncAllDataToSupabase } from '@/lib/sync-tool';

export default function SyncTestButton() {
  const [isTesting, setIsTesting] = useState(false);
  const [isFullSyncing, setIsFullSyncing] = useState(false);
  const { addClient } = useStore();

  const testSync = async () => {
    setIsTesting(true);
    setSyncStatus('syncing', '正在测试数据库同步...');

    try {
      // 创建一个测试客户
      console.log('🧪 [Sync Test] 开始测试同步...');
      
      const testClient = {
        name: `测试客户_${Date.now()}`,
        phone: '138-0000-0000',
        email: 'test@example.com',
        address: '测试地址',
        company: '测试公司',
      };

      console.log('🧪 [Sync Test] 创建测试客户:', testClient);
      addClient(testClient);

      // 等待 3 秒让同步完成
      await new Promise(resolve => setTimeout(resolve, 3000));

      setSyncStatus('success', '测试同步成功！请查看 Supabase 数据库');
      console.log('✅ [Sync Test] 测试完成');
      
      // 3 秒后重置状态
      setTimeout(() => {
        setSyncStatus('unknown', '');
      }, 3000);

    } catch (error) {
      console.error('❌ [Sync Test] 测试失败:', error);
      setSyncStatus('error', `测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const fullSync = async () => {
    if (!confirm('确定要将所有 localStorage 中的数据同步到 Supabase 吗？\n这可能需要一些时间。')) {
      return;
    }

    setIsFullSyncing(true);
    setSyncStatus('syncing', '正在全量同步数据...');

    try {
      const result = await syncAllDataToSupabase();
      
      if (result.success) {
        setSyncStatus('success', result.message);
      } else {
        setSyncStatus('error', result.message);
      }

      // 5 秒后重置状态
      setTimeout(() => {
        setSyncStatus('unknown', '');
      }, 5000);

    } catch (error) {
      console.error('❌ [Full Sync] 同步失败:', error);
      setSyncStatus('error', `同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsFullSyncing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={testSync}
        disabled={isTesting || isFullSyncing}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {isTesting ? '测试中...' : '🧪 测试单个数据同步'}
      </Button>
      <Button
        onClick={fullSync}
        disabled={isTesting || isFullSyncing}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {isFullSyncing ? '同步中...' : '🔄 全量同步数据'}
      </Button>
    </div>
  );
}
