/**
 * Supabase 客户端
 * 支持服务端和客户端环境
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';

let envLoaded = false;

/**
 * 加载环境变量（仅服务端）
 */
function loadEnvVariables() {
  if (envLoaded || typeof window !== 'undefined') {
    return;
  }

  try {
    if (typeof process !== 'undefined' && process.env) {
      // 服务端环境变量已通过 process.env 自动注入
      envLoaded = true;
    }
  } catch (error) {
    console.warn('加载环境变量失败:', error);
  }
}

let clientInstance: SupabaseClient | null = null;

/**
 * 获取 Supabase 客户端实例
 * 
 * @param token - 可选的用户认证 token
 * @returns Supabase 客户端实例
 */
export function getSupabaseClient(token?: string): SupabaseClient {
  if (clientInstance) {
    return clientInstance;
  }

  // 服务端加载环境变量
  if (typeof window === 'undefined') {
    loadEnvVariables();
  }

  // 验证必要的环境变量
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase 环境变量未配置。请在 Coze 平台开通 Supabase 服务，或设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量。'
    );
  }

  // 选择合适的密钥
  const key = token ? supabaseAnonKey : (supabaseServiceRoleKey || supabaseAnonKey);

  // 创建客户端实例
  clientInstance = createClient(supabaseUrl, key, {
    auth: token ? { persistSession: false } : undefined,
  });

  return clientInstance;
}

/**
 * 重置客户端实例（用于测试或环境切换）
 */
export function resetSupabaseClient() {
  clientInstance = null;
}
