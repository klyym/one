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
  console.log('🔍 [SyncTool] 当前环境:', typeof window !== 'undefined' ? '客户端' : '服务端');
  
  try {
    console.log('📦 [SyncTool] 正在加载数据库服务...');
    const services = await import('@/storage/database/services');
    console.log('✅ [SyncTool] 数据库服务已加载');
    console.log('📋 [SyncTool] 可用的服务:', Object.keys(services));
    
    let successCount = 0;
    let failCount = 0;
    
    // ID 映射表：旧 ID -> 新 UUID
    const clientIdMap = new Map<string, string>();
    const designerIdMap = new Map<string, string>();
    
    // 同步客户
    const clients = readFromStorage(STORAGE_KEYS.clients);
    console.log('📊 [SyncTool] 从 localStorage 读取到客户:', clients?.length || 0);
    if (clients && Array.isArray(clients) && clients.length > 0) {
      console.log(`📝 [SyncTool] 开始同步 ${clients.length} 个客户...`);
      for (const client of clients) {
        try {
          console.log(`📝 [SyncTool] 同步客户: ${client.name} (ID: ${client.id})`);
          const result = await services.clientService.create(client);
          console.log(`✅ [SyncTool] 客户同步成功: ${client.name}`, result);
          if (result?.id) {
            clientIdMap.set(client.id, result.id);
            console.log(`🗺️ [SyncTool] 映射 ID: ${client.id} -> ${result.id}`);
          }
          successCount++;
        } catch (error: any) {
          failCount++;
          // 如果是重复错误，忽略
          if (error.message) {
            console.warn(`⚠️ [SyncTool] 客户同步失败: ${client.name}`, error.message);
          } else {
            console.warn(`⚠️ [SyncTool] 客户同步失败: ${client.name}`, error);
          }
        }
      }
    } else {
      console.log('⚠️ [SyncTool] 没有客户数据需要同步');
    }
    
    console.log('🗺️ [SyncTool] 客户 ID 映射表:', Object.fromEntries(clientIdMap));
    
    // 同步设计师
    const designers = readFromStorage(STORAGE_KEYS.designers);
    console.log('📊 [SyncTool] 从 localStorage 读取到设计师:', designers?.length || 0);
    if (designers && Array.isArray(designers) && designers.length > 0) {
      console.log(`📝 [SyncTool] 开始同步 ${designers.length} 个设计师...`);
      for (const designer of designers) {
        try {
          console.log(`📝 [SyncTool] 同步设计师: ${designer.name} (ID: ${designer.id})`);
          const result = await services.designerService.create(designer);
          console.log(`✅ [SyncTool] 设计师同步成功: ${designer.name}`, result);
          if (result?.id) {
            designerIdMap.set(designer.id, result.id);
            console.log(`🗺️ [SyncTool] 映射 ID: ${designer.id} -> ${result.id}`);
          }
          successCount++;
        } catch (error: any) {
          failCount++;
          if (error.message) {
            console.warn(`⚠️ [SyncTool] 设计师同步失败: ${designer.name}`, error.message);
          } else {
            console.warn(`⚠️ [SyncTool] 设计师同步失败: ${designer.name}`, error);
          }
        }
      }
    } else {
      console.log('⚠️ [SyncTool] 没有设计师数据需要同步');
    }
    
    console.log('🗺️ [SyncTool] 设计师 ID 映射表:', Object.fromEntries(designerIdMap));
    
    // 同步项目（需要映射 client_id 和 designer_id）
    const projects = readFromStorage(STORAGE_KEYS.projects);
    console.log('📊 [SyncTool] 从 localStorage 读取到项目:', projects?.length || 0);
    if (projects && Array.isArray(projects) && projects.length > 0) {
      console.log(`📝 [SyncTool] 开始同步 ${projects.length} 个项目...`);
      for (const project of projects) {
        try {
          console.log(`📝 [SyncTool] 同步项目: ${project.name}`);
          console.log(`🗺️ [SyncTool] 项目关联 - client_id: ${project.clientId}, designer_id: ${project.designerId}`);
          
          // 映射 ID
          const mappedProject = {
            ...project,
            client_id: clientIdMap.get(project.clientId) || project.clientId,
            designer_id: designerIdMap.get(project.designerId) || project.designerId,
          };
          
          console.log(`🗺️ [SyncTool] 映射后 - client_id: ${mappedProject.client_id}, designer_id: ${mappedProject.designer_id}`);
          
          const result = await services.projectService.create(mappedProject);
          console.log(`✅ [SyncTool] 项目同步成功: ${project.name}`, result);
          successCount++;
        } catch (error: any) {
          failCount++;
          if (error.message) {
            console.warn(`⚠️ [SyncTool] 项目同步失败: ${project.name}`, error.message);
          } else {
            console.warn(`⚠️ [SyncTool] 项目同步失败: ${project.name}`, error);
          }
        }
      }
    } else {
      console.log('⚠️ [SyncTool] 没有项目数据需要同步');
    }
    
    // 同步案例
    const cases = readFromStorage(STORAGE_KEYS.cases);
    console.log('📊 [SyncTool] 从 localStorage 读取到案例:', cases?.length || 0);
    if (cases && Array.isArray(cases) && cases.length > 0) {
      console.log(`📝 [SyncTool] 开始同步 ${cases.length} 个案例...`);
      for (const caseItem of cases) {
        try {
          console.log(`📝 [SyncTool] 同步案例: ${caseItem.name}`);
          const result = await services.caseService.create(caseItem);
          console.log(`✅ [SyncTool] 案例同步成功: ${caseItem.name}`, result);
          successCount++;
        } catch (error: any) {
          failCount++;
          if (error.message) {
            console.warn(`⚠️ [SyncTool] 案例同步失败: ${caseItem.name}`, error.message);
          } else {
            console.warn(`⚠️ [SyncTool] 案例同步失败: ${caseItem.name}`, error);
          }
        }
      }
    } else {
      console.log('⚠️ [SyncTool] 没有案例数据需要同步');
    }
    
    // 同步跟进记录（需要映射 client_id）
    const followUps = readFromStorage(STORAGE_KEYS.followUps);
    console.log('📊 [SyncTool] 从 localStorage 读取到跟进记录:', followUps?.length || 0);
    if (followUps && Array.isArray(followUps) && followUps.length > 0) {
      console.log(`📝 [SyncTool] 开始同步 ${followUps.length} 个跟进记录...`);
      for (const followUp of followUps) {
        try {
          console.log(`📝 [SyncTool] 同步跟进记录`);
          
          // 映射 client_id
          const mappedFollowUp = {
            ...followUp,
            client_id: clientIdMap.get(followUp.clientId) || followUp.clientId,
          };
          
          const result = await services.followUpService.create(mappedFollowUp);
          console.log(`✅ [SyncTool] 跟进记录同步成功`, result);
          successCount++;
        } catch (error: any) {
          failCount++;
          if (error.message) {
            console.warn(`⚠️ [SyncTool] 跟进记录同步失败`, error.message);
          } else {
            console.warn(`⚠️ [SyncTool] 跟进记录同步失败`, error);
          }
        }
      }
    } else {
      console.log('⚠️ [SyncTool] 没有跟进记录数据需要同步');
    }
    
    // 更新最后同步时间
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio_last_sync', new Date().toISOString());
    }
    
    console.log(`🎉 [SyncTool] 全量数据同步完成！成功: ${successCount}, 失败: ${failCount}`);
    return { 
      success: successCount > 0, 
      message: `数据同步完成：成功 ${successCount} 条，失败 ${failCount} 条`,
      successCount,
      failCount
    };
    
  } catch (error) {
    console.error('❌ [SyncTool] 数据同步失败:', error);
    console.error('❌ [SyncTool] 错误堆栈:', error instanceof Error ? error.stack : error);
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
