/**
 * 数据库同步工具
 * 用于将 localStorage 中的数据同步到 Supabase
 */

// localStorage 键
const STORAGE_KEYS = {
  projects: 'studio_projects',
  clients: 'studio_clients',
  designers: 'studio_designers',
  cases: 'studio_cases',
  followUps: 'studio_followups',
};

/**
 * 检查是否需要同步
 */
export function needsSync(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lastSyncTime = localStorage.getItem('studio_last_sync');
  if (!lastSyncTime) return true;
  
  const lastSync = new Date(lastSyncTime);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);
  
  // 如果超过 5 分钟未同步，则认为需要同步
  return diffMinutes > 5;
}

/**
 * 从 localStorage 读取数据
 */
function readFromStorage(key: string) {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * 将所有数据同步到 Supabase
 */
export async function syncAllDataToSupabase() {
  console.log('🔄 [SyncTool] 开始全量数据同步...');
  
  try {
    const services = await import('@/storage/database/services');
    
    // 同步客户
    const clients = readFromStorage(STORAGE_KEYS.clients);
    if (clients && Array.isArray(clients)) {
      console.log(`📝 [SyncTool] 同步 ${clients.length} 个客户...`);
      for (const client of clients) {
        try {
          await services.clientService.create(client);
          console.log(`✅ [SyncTool] 客户同步成功: ${client.name}`);
        } catch (error: any) {
          // 如果是重复错误，忽略
          if (error.message && !error.message.includes('duplicate')) {
            console.warn(`⚠️ [SyncTool] 客户同步失败: ${client.name}`, error);
          }
        }
      }
    }
    
    // 同步设计师
    const designers = readFromStorage(STORAGE_KEYS.designers);
    if (designers && Array.isArray(designers)) {
      console.log(`📝 [SyncTool] 同步 ${designers.length} 个设计师...`);
      for (const designer of designers) {
        try {
          await services.designerService.create(designer);
          console.log(`✅ [SyncTool] 设计师同步成功: ${designer.name}`);
        } catch (error: any) {
          if (error.message && !error.message.includes('duplicate')) {
            console.warn(`⚠️ [SyncTool] 设计师同步失败: ${designer.name}`, error);
          }
        }
      }
    }
    
    // 同步项目
    const projects = readFromStorage(STORAGE_KEYS.projects);
    if (projects && Array.isArray(projects)) {
      console.log(`📝 [SyncTool] 同步 ${projects.length} 个项目...`);
      for (const project of projects) {
        try {
          await services.projectService.create(project);
          console.log(`✅ [SyncTool] 项目同步成功: ${project.name}`);
        } catch (error: any) {
          if (error.message && !error.message.includes('duplicate')) {
            console.warn(`⚠️ [SyncTool] 项目同步失败: ${project.name}`, error);
          }
        }
      }
    }
    
    // 同步案例
    const cases = readFromStorage(STORAGE_KEYS.cases);
    if (cases && Array.isArray(cases)) {
      console.log(`📝 [SyncTool] 同步 ${cases.length} 个案例...`);
      for (const caseItem of cases) {
        try {
          await services.caseService.create(caseItem);
          console.log(`✅ [SyncTool] 案例同步成功: ${caseItem.name}`);
        } catch (error: any) {
          if (error.message && !error.message.includes('duplicate')) {
            console.warn(`⚠️ [SyncTool] 案例同步失败: ${caseItem.name}`, error);
          }
        }
      }
    }
    
    // 同步跟进记录
    const followUps = readFromStorage(STORAGE_KEYS.followUps);
    if (followUps && Array.isArray(followUps)) {
      console.log(`📝 [SyncTool] 同步 ${followUps.length} 个跟进记录...`);
      for (const followUp of followUps) {
        try {
          await services.followUpService.create(followUp);
          console.log(`✅ [SyncTool] 跟进记录同步成功`);
        } catch (error: any) {
          if (error.message && !error.message.includes('duplicate')) {
            console.warn(`⚠️ [SyncTool] 跟进记录同步失败`, error);
          }
        }
      }
    }
    
    // 更新最后同步时间
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio_last_sync', new Date().toISOString());
    }
    
    console.log('🎉 [SyncTool] 全量数据同步完成！');
    return { success: true, message: '数据同步完成' };
    
  } catch (error) {
    console.error('❌ [SyncTool] 数据同步失败:', error);
    return { success: false, message: `同步失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}

/**
 * 清除同步标记
 */
export function clearSyncMarker() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('studio_last_sync');
  }
}
