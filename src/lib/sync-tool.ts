/**
 * 数据库同步工具
 * 用于将 localStorage 中的数据同步到 Supabase
 * 说明：localStorage 无数据时回退到初始演示数据；云端已有数据的表自动跳过（避免重复）。
 */

import { initialClients, initialDesigners, initialProjects, initialFollowUps } from './store';

// localStorage 键
const STORAGE_KEYS = {
  projects: 'studio_projects',
  clients: 'studio_clients',
  designers: 'studio_designers',
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
 * 检查云端某张表是否已有数据（用于避免重复同步）
 */
async function hasCloudData(service: any): Promise<boolean> {
  try {
    const data = await service.getAll();
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

/**
 * 将所有数据同步到 Supabase
 */
export async function syncAllDataToSupabase() {
  console.log('🔄 [SyncTool] 开始全量数据同步...');

  try {
    console.log('📦 [SyncTool] 正在加载数据库服务...');
    const services = await import('@/storage/database/services');
    console.log('✅ [SyncTool] 数据库服务已加载');

    let successCount = 0;
    let failCount = 0;

    // ID 映射表：旧 ID -> 新 UUID
    const clientIdMap = new Map<string, string>();
    const designerIdMap = new Map<string, string>();

    // ---- 同步客户 ----
    const clients = readFromStorage(STORAGE_KEYS.clients) || initialClients;
    console.log('📊 [SyncTool] 待同步客户:', clients?.length || 0);
    if (clients && clients.length > 0) {
      if (await hasCloudData(services.clientService)) {
        console.log('⚠️ [SyncTool] 云端已有客户数据，跳过（避免重复）');
      } else {
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
            console.warn(`⚠️ [SyncTool] 客户同步失败: ${client.name}`, error.message || error);
          }
        }
      }
    } else {
      console.log('⚠️ [SyncTool] 没有客户数据需要同步');
    }

    // ---- 同步设计师 ----
    const designers = readFromStorage(STORAGE_KEYS.designers) || initialDesigners;
    console.log('📊 [SyncTool] 待同步设计师:', designers?.length || 0);
    if (designers && designers.length > 0) {
      if (await hasCloudData(services.designerService)) {
        console.log('⚠️ [SyncTool] 云端已有设计师数据，跳过（避免重复）');
      } else {
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
            console.warn(`⚠️ [SyncTool] 设计师同步失败: ${designer.name}`, error.message || error);
          }
        }
      }
    } else {
      console.log('⚠️ [SyncTool] 没有设计师数据需要同步');
    }

    // ---- 同步项目（需要映射 client_id 和 designer_id）----
    const projects = readFromStorage(STORAGE_KEYS.projects) || initialProjects;
    console.log('📊 [SyncTool] 待同步项目:', projects?.length || 0);
    if (projects && projects.length > 0) {
      if (await hasCloudData(services.projectService)) {
        console.log('⚠️ [SyncTool] 云端已有项目数据，跳过（避免重复）');
      } else {
        console.log(`📝 [SyncTool] 开始同步 ${projects.length} 个项目...`);
        for (const project of projects) {
          try {
            console.log(`📝 [SyncTool] 同步项目: ${project.name}`);
            console.log(`🗺️ [SyncTool] 项目关联 - client_id: ${project.clientId}, designer_id: ${project.designerId}`);

            const mappedClientId = clientIdMap.get(project.clientId);
            const mappedDesignerId = designerIdMap.get(project.designerId);

            const mappedProject = {
              name: project.name,
              client_id: mappedClientId || null,
              designer_id: mappedDesignerId || null,
              status: project.status,
              stage: project.stage || 'design',
              priority: project.priority,
              budget: project.budget,
              contract_amount: project.contractAmount,
              actual_cost: project.actualCost,
              area: project.area,
              address: project.location || project.address,
              style: project.style,
              overall_progress: project.overallProgress,
              updates: project.updates,
              start_date: project.startDate,
              end_date: project.endDate,
              notes: project.description || project.notes,
            };

            console.log(`🗺️ [SyncTool] 映射后 - client_id: ${mappedProject.client_id}, designer_id: ${mappedProject.designer_id}`);

            if (!mappedClientId || !mappedDesignerId) {
              console.warn(`⚠️ [SyncTool] 跳过项目（缺少 ID 映射）: ${project.name}`);
              continue;
            }

            const result = await services.projectService.create(mappedProject);
            console.log(`✅ [SyncTool] 项目同步成功: ${project.name}`, result);
            successCount++;
          } catch (error: any) {
            failCount++;
            console.warn(`⚠️ [SyncTool] 项目同步失败: ${project.name}`, error.message || error);
          }
        }
      }
    } else {
      console.log('⚠️ [SyncTool] 没有项目数据需要同步');
    }

    // ---- 同步跟进记录（需要映射 client_id）----
    const followUps = readFromStorage(STORAGE_KEYS.followUps) || initialFollowUps;
    console.log('📊 [SyncTool] 待同步跟进记录:', followUps?.length || 0);
    if (followUps && followUps.length > 0) {
      if (await hasCloudData(services.followUpService)) {
        console.log('⚠️ [SyncTool] 云端已有跟进记录，跳过（避免重复）');
      } else {
        console.log(`📝 [SyncTool] 开始同步 ${followUps.length} 条跟进记录...`);
        for (const followUp of followUps) {
          try {
            const mappedClientId = clientIdMap.get(followUp.clientId);
            const mappedDesignerId = followUp.designerId ? designerIdMap.get(followUp.designerId) : null;

            if (!mappedClientId) {
              console.warn('⚠️ [SyncTool] 跳过跟进记录（缺少客户 ID 映射）');
              continue;
            }

            const mappedFollowUp = {
              client_id: mappedClientId,
              type: followUp.type,
              content: followUp.content,
              next_plan: followUp.nextAction,
              next_date: followUp.nextDate,
              designer_id: mappedDesignerId,
            };

            const result = await services.followUpService.create(mappedFollowUp);
            console.log(`✅ [SyncTool] 跟进记录同步成功`, result);
            successCount++;
          } catch (error: any) {
            failCount++;
            console.warn(`⚠️ [SyncTool] 跟进记录同步失败`, error.message || error);
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
