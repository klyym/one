/**
 * 数据库初始化脚本
 * 在应用启动时执行，确保数据库中有初始数据
 */

import { initializeDatabase } from './services';

export async function initAppDatabase() {
  try {
    await initializeDatabase();
    return { success: true };
  } catch (error) {
    console.error('应用数据库初始化失败:', error);
    return { success: false, error };
  }
}
