'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, Loader2, Check, X } from 'lucide-react';

type SyncStatus = 'unknown' | 'syncing' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  message: string;
  lastSyncTime: string | null;
}

let globalSyncState: SyncState = {
  status: 'unknown',
  message: '',
  lastSyncTime: null,
};

const listeners: Set<(state: SyncState) => void> = new Set();

export function setSyncStatus(status: SyncStatus, message: string = '') {
  globalSyncState = {
    status,
    message,
    lastSyncTime: status === 'success' || status === 'error' ? new Date().toLocaleTimeString() : globalSyncState.lastSyncTime,
  };
  listeners.forEach(listener => listener(globalSyncState));
}

export function getSyncStatus() {
  return globalSyncState;
}

export function useSyncStatus() {
  const [state, setState] = useState<SyncState>(globalSyncState);

  useEffect(() => {
    const listener = (newState: SyncState) => setState(newState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}

export default function SyncStatusIndicator() {
  const { status, message, lastSyncTime } = useSyncStatus();

  const getIcon = () => {
    switch (status) {
      case 'syncing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'unknown':
      default:
        return <Cloud className="h-4 w-4 text-gray-400" />;
    }
  };

  const getText = () => {
    switch (status) {
      case 'syncing':
        return '正在同步...';
      case 'success':
        return '已同步';
      case 'error':
        return '同步失败';
      case 'unknown':
      default:
        return '未同步';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {getIcon()}
      <span className="text-gray-600 dark:text-gray-400">{getText()}</span>
      {lastSyncTime && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          ({lastSyncTime})
        </span>
      )}
      {message && status === 'error' && (
        <span className="text-xs text-red-500 ml-2">{message}</span>
      )}
    </div>
  );
}
