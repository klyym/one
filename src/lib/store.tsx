'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Project, Client, Designer, DesignCase, PhaseProgress, DesignPhase, FollowUp } from '@/types';
import { setSyncStatus } from '@/components/sync-status';

// 设计阶段列表
const DESIGN_PHASES: DesignPhase[] = ['平面设计', 'SU模型推敲', '效果图', '施工图', '设计完成'];

// ID 映射表：localStorage ID -> Supabase UUID
const ID_MAP_KEY = 'studio_id_map';

// 加载 ID 映射表
const loadIdMap = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(ID_MAP_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// 保存 ID 映射表
const saveIdMap = (map: Record<string, string>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ID_MAP_KEY, JSON.stringify(map));
  }
};

// 获取映射后的 UUID
const getMappedId = (localId: string, idMap: Record<string, string>): string | null => {
  return idMap[localId] || null;
};

// 记录 ID 映射
const recordIdMapping = (localId: string, supabaseId: string, idMap: Record<string, string>): Record<string, string> => {
  if (localId && supabaseId && localId !== supabaseId) {
    const newMap = { ...idMap, [localId]: supabaseId };
    saveIdMap(newMap);
    return newMap;
  }
  return idMap;
};

// 创建默认的阶段进度
const createDefaultPhases = (): PhaseProgress[] => {
  return DESIGN_PHASES.map((phase, index) => ({
    phase,
    status: index === 0 ? 'pending' : 'pending',
    progress: 0,
  }));
};

// 计算总体进度
const calculateOverallProgress = (phases: PhaseProgress[]): number => {
  const totalPhases = phases.length;
  const completedPhases = phases.filter(p => p.status === 'completed').length;
  const currentPhase = phases.find(p => p.status === 'in_progress');

  if (currentPhase) {
    const currentPhaseIndex = phases.findIndex(p => p.phase === currentPhase.phase);
    return Math.round(((completedPhases + currentPhase.progress / 100) / totalPhases) * 100);
  }

  return Math.round((completedPhases / totalPhases) * 100);
};

// 获取当前阶段
const getCurrentPhase = (phases: PhaseProgress[]): DesignPhase => {
  const inProgressPhase = phases.find(p => p.status === 'in_progress');
  if (inProgressPhase) return inProgressPhase.phase;

  const pendingPhase = phases.find(p => p.status === 'pending');
  if (pendingPhase) return pendingPhase.phase;

  return '设计完成';
};

// localStorage 键
const STORAGE_KEYS = {
  projects: 'studio_projects',
  clients: 'studio_clients',
  designers: 'studio_designers',
  cases: 'studio_cases',
  followUps: 'studio_followups',
};

// Supabase 服务缓存
let dbServices: any = null;

// 异步加载 Supabase 服务
const loadDbServices = async () => {
  if (dbServices) return dbServices;
  try {
    const services = await import('@/storage/database/services');
    dbServices = services;
    return services;
  } catch (error) {
    console.error('Failed to load database services:', error);
    return null;
  }
};

// 同步数据到 Supabase（异步，不阻塞）
const syncToSupabase = async (
  action: string, 
  data: any, 
  idMap: Record<string, string>,
  setIdMap: (map: Record<string, string>) => void
) => {
  console.log('🔄 [Supabase Sync] 开始同步:', action, data);
  console.log('🔍 [Supabase Sync] 当前环境:', typeof window !== 'undefined' ? '客户端' : '服务端');
  setSyncStatus('syncing', `正在同步: ${action}`);

  try {
    console.log('📦 [Supabase Sync] 正在加载数据库服务...');
    const services = await loadDbServices();
    
    if (!services) {
      console.error('❌ [Supabase Sync] 数据库服务未加载');
      setSyncStatus('error', '数据库服务未加载，请检查配置');
      return;
    }
    
    console.log('✅ [Supabase Sync] 数据库服务已加载');
    console.log('📋 [Supabase Sync] 可用的服务:', Object.keys(services));

    let result;
    switch (action) {
      case 'addProject': {
        console.log('📝 [Supabase Sync] 正在创建项目...', data);
        // 映射 ID
        const mappedClientId = getMappedId(data.clientId, idMap);
        const mappedDesignerId = getMappedId(data.designerId, idMap);

        // 警告：如果找不到映射
        if (!mappedClientId) {
          console.warn('⚠️ [Supabase Sync] 找不到客户 ID 映射，将客户设为 null:', data.clientId);
        }
        if (!mappedDesignerId) {
          console.warn('⚠️ [Supabase Sync] 找不到设计师 ID 映射，将设计师设为 null:', data.designerId);
        }

        // 创建映射后的数据，排除 camelCase 的 ID 字段
        const mappedData = {
          name: data.name,
          location: data.location,
          area: data.area,
          style: data.style,
          budget: data.budget,
          status: data.status,
          priority: data.priority,
          start_date: data.startDate,
          end_date: data.endDate,
          current_phase: data.currentPhase,
          overall_progress: data.overallProgress,
          phases: data.phases,
          created_at: data.createdAt,
          updated_at: data.updatedAt,
          client_id: mappedClientId || null,
          designer_id: mappedDesignerId || null,
        };
        console.log('🗺️ [Supabase Sync] ID 映射后:', mappedData);
        result = await services.projectService.create(mappedData);
        console.log('✅ [Supabase Sync] 项目创建成功:', result);
        // 记录项目 ID 映射
        if (result?.id && data.id) {
          const newMap = recordIdMapping(data.id, result.id, idMap);
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 记录项目 ID 映射:', data.id, '->', result.id);
        }
        break;
      }
      case 'updateProject': {
        console.log('📝 [Supabase Sync] 正在更新项目...', data.id, data);
        // 映射 ID
        const mappedClientId = getMappedId(data.clientId, idMap);
        const mappedDesignerId = getMappedId(data.designerId, idMap);

        // 警告：如果找不到映射
        if (!mappedClientId && data.clientId) {
          console.warn('⚠️ [Supabase Sync] 找不到客户 ID 映射，将客户设为 null:', data.clientId);
        }
        if (!mappedDesignerId && data.designerId) {
          console.warn('⚠️ [Supabase Sync] 找不到设计师 ID 映射，将设计师设为 null:', data.designerId);
        }

        // 创建映射后的数据，排除 camelCase 的 ID 字段
        const { clientId, designerId, createdAt, updatedAt, phases, ...restData } = data;
        const mappedData = {
          ...restData,
          client_id: mappedClientId || null,
          designer_id: mappedDesignerId || null,
          created_at: createdAt,
          updated_at: updatedAt,
          phases: phases,
        };
        const projectId = getMappedId(data.id, idMap) || data.id;
        result = await services.projectService.update(projectId, mappedData);
        console.log('✅ [Supabase Sync] 项目更新成功:', result);
        break;
      }
      case 'deleteProject': {
        console.log('📝 [Supabase Sync] 正在删除项目...', data.id);
        const projectId = getMappedId(data.id, idMap);
        if (projectId) {
          result = await services.projectService.delete(projectId);
          console.log('✅ [Supabase Sync] 项目删除成功');
          // 从 ID 映射表移除
          const newMap = { ...idMap };
          delete newMap[data.id];
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 移除项目 ID 映射:', data.id);
        } else {
          console.warn('⚠️ [Supabase Sync] 跳过删除项目（找不到 ID 映射）:', data.id);
        }
        break;
      }
      case 'addClient': {
        console.log('📝 [Supabase Sync] 正在创建客户...', data);
        result = await services.clientService.create(data);
        console.log('✅ [Supabase Sync] 客户创建成功:', result);
        if (result?.id && data.id) {
          const newMap = recordIdMapping(data.id, result.id, idMap);
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 记录客户 ID 映射:', data.id, '->', result.id);
        }
        break;
      }
      case 'updateClient':
        console.log('📝 [Supabase Sync] 正在更新客户...', data.id, data);
        const clientId = getMappedId(data.id, idMap) || data.id;
        result = await services.clientService.update(clientId, data);
        console.log('✅ [Supabase Sync] 客户更新成功:', result);
        break;
      case 'deleteClient': {
        console.log('📝 [Supabase Sync] 正在删除客户...', data.id);
        const clientId = getMappedId(data.id, idMap);
        if (clientId) {
          result = await services.clientService.delete(clientId);
          console.log('✅ [Supabase Sync] 客户删除成功');
          // 从 ID 映射表移除
          const newMap = { ...idMap };
          delete newMap[data.id];
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 移除客户 ID 映射:', data.id);
        } else {
          console.warn('⚠️ [Supabase Sync] 跳过删除客户（找不到 ID 映射）:', data.id);
        }
        break;
      }
      case 'addDesigner': {
        console.log('📝 [Supabase Sync] 正在创建设计师...', data);
        result = await services.designerService.create(data);
        console.log('✅ [Supabase Sync] 设计师创建成功:', result);
        if (result?.id && data.id) {
          const newMap = recordIdMapping(data.id, result.id, idMap);
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 记录设计师 ID 映射:', data.id, '->', result.id);
        }
        break;
      }
      case 'updateDesigner':
        console.log('📝 [Supabase Sync] 正在更新设计师...', data.id, data);
        const designerId = getMappedId(data.id, idMap) || data.id;
        result = await services.designerService.update(designerId, data);
        console.log('✅ [Supabase Sync] 设计师更新成功:', result);
        break;
      case 'deleteDesigner': {
        console.log('📝 [Supabase Sync] 正在删除设计师...', data.id);
        const designerId = getMappedId(data.id, idMap);
        if (designerId) {
          result = await services.designerService.delete(designerId);
          console.log('✅ [Supabase Sync] 设计师删除成功');
          // 从 ID 映射表移除
          const newMap = { ...idMap };
          delete newMap[data.id];
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 移除设计师 ID 映射:', data.id);
        } else {
          console.warn('⚠️ [Supabase Sync] 跳过删除设计师（找不到 ID 映射）:', data.id);
        }
        break;
      }
      case 'addCase': {
        console.log('📝 [Supabase Sync] 正在创建案例...', data);
        result = await services.caseService.create(data);
        console.log('✅ [Supabase Sync] 案例创建成功:', result);
        if (result?.id && data.id) {
          const newMap = recordIdMapping(data.id, result.id, idMap);
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 记录案例 ID 映射:', data.id, '->', result.id);
        }
        break;
      }
      case 'updateCase':
        console.log('📝 [Supabase Sync] 正在更新案例...', data.id, data);
        const caseId = getMappedId(data.id, idMap) || data.id;
        result = await services.caseService.update(caseId, data);
        console.log('✅ [Supabase Sync] 案例更新成功:', result);
        break;
      case 'deleteCase': {
        console.log('📝 [Supabase Sync] 正在删除案例...', data.id);
        const caseId = getMappedId(data.id, idMap);
        if (caseId) {
          result = await services.caseService.delete(caseId);
          console.log('✅ [Supabase Sync] 案例删除成功');
          // 从 ID 映射表移除
          const newMap = { ...idMap };
          delete newMap[data.id];
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 移除案例 ID 映射:', data.id);
        } else {
          console.warn('⚠️ [Supabase Sync] 跳过删除案例（找不到 ID 映射）:', data.id);
        }
        break;
      }
      case 'addFollowUp': {
        console.log('📝 [Supabase Sync] 正在创建跟进记录...', data);
        // 映射 ID
        const mappedClientId = getMappedId(data.clientId, idMap);
        const mappedDesignerId = getMappedId(data.designerId, idMap);

        // 警告：如果找不到映射
        if (!mappedClientId) {
          console.warn('⚠️ [Supabase Sync] 找不到客户 ID 映射，将客户设为 null:', data.clientId);
        }
        if (!mappedDesignerId) {
          console.warn('⚠️ [Supabase Sync] 找不到设计师 ID 映射，将跟进人设为 null:', data.designerId);
        }

        // 创建映射后的数据，排除 camelCase 的 ID 字段
        const mappedData = {
          type: data.type,
          content: data.content,
          next_plan: data.nextAction,
          next_date: data.nextDate,
          followed_by: mappedDesignerId || null,
          client_id: mappedClientId || null,
          created_at: data.createdAt,
        };
        result = await services.followUpService.create(mappedData);
        console.log('✅ [Supabase Sync] 跟进记录创建成功:', result);
        if (result?.id && data.id) {
          const newMap = recordIdMapping(data.id, result.id, idMap);
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 记录跟进记录 ID 映射:', data.id, '->', result.id);
        }
        break;
      }
      case 'deleteFollowUp': {
        console.log('📝 [Supabase Sync] 正在删除跟进记录...', data.id);
        const followUpId = getMappedId(data.id, idMap);
        if (followUpId) {
          result = await services.followUpService.delete(followUpId);
          console.log('✅ [Supabase Sync] 跟进记录删除成功');
          // 从 ID 映射表移除
          const newMap = { ...idMap };
          delete newMap[data.id];
          setIdMap(newMap);
          console.log('🗺️ [Supabase Sync] 移除跟进记录 ID 映射:', data.id);
        } else {
          console.warn('⚠️ [Supabase Sync] 跳过删除跟进记录（找不到 ID 映射）:', data.id);
        }
        break;
      }
    }
    console.log('🎉 [Supabase Sync] 同步完成:', action, '结果:', result);
    setSyncStatus('success', `${action} 同步成功`);
  } catch (error) {
    console.error(`❌ [Supabase Sync] 同步失败 (${action}):`, error);
    console.error('❌ [Supabase Sync] 错误详情:', error instanceof Error ? error.stack : error);
    setSyncStatus('error', `${action} 同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
    // 不抛出错误，让 localStorage 作为主要存储
  }
};

// 初始数据
const initialClients: Client[] = [
  {
    id: '1',
    name: '张伟',
    phone: '138-0000-0001',
    email: 'zhangwei@example.com',
    address: '北京市朝阳区望京街道',
    company: '科技发展有限公司',
    totalProjects: 3,
    totalSpent: 850000,
    createdAt: '2024-01-15',
    lastContactAt: '2024-12-10',
  },
  {
    id: '2',
    name: '李娜',
    phone: '139-0000-0002',
    email: 'lina@example.com',
    address: '上海市浦东新区陆家嘴',
    totalProjects: 2,
    totalSpent: 620000,
    createdAt: '2024-03-20',
    lastContactAt: '2024-12-08',
  },
  {
    id: '3',
    name: '王强',
    phone: '137-0000-0003',
    email: 'wangqiang@example.com',
    address: '深圳市南山区科技园',
    company: '创新科技有限公司',
    totalProjects: 5,
    totalSpent: 1200000,
    createdAt: '2024-02-10',
    lastContactAt: '2024-12-12',
  },
];

const initialDesigners: Designer[] = [
  {
    id: '1',
    name: '陈设计师',
    title: '首席设计师',
    specialty: ['现代简约', '北欧风格', '工业风'],
    phone: '136-0000-0001',
    email: 'chen@studio.com',
    activeProjects: 4,
    completedProjects: 28,
    rating: 4.9,
    bio: '15年室内设计经验，擅长现代简约风格',
    joinedAt: '2018-03-15',
  },
  {
    id: '2',
    name: '林设计师',
    title: '高级设计师',
    specialty: ['中式风格', '新古典', '轻奢'],
    phone: '136-0000-0002',
    email: 'lin@studio.com',
    activeProjects: 3,
    completedProjects: 22,
    rating: 4.8,
    bio: '专注中式风格与现代融合',
    joinedAt: '2019-06-20',
  },
  {
    id: '3',
    name: '赵设计师',
    title: '设计师',
    specialty: ['现代简约', '日式风格', '极简主义'],
    phone: '136-0000-0003',
    email: 'zhao@studio.com',
    activeProjects: 2,
    completedProjects: 15,
    rating: 4.7,
    bio: '热爱极简设计美学',
    joinedAt: '2020-09-10',
  },
];

const initialProjects: Project[] = [
  {
    id: '1',
    name: '望京SOHO办公空间',
    clientId: '1',
    designerId: '1',
    status: 'in_progress',
    priority: 'high',
    budget: 450000,
    startDate: '2024-10-15',
    description: '现代简约风格办公空间设计，面积800平米',
    location: '北京市朝阳区望京SOHO',
    area: 800,
    style: '现代简约',
    phases: [
      { phase: '平面设计', status: 'completed', progress: 100 },
      { phase: 'SU模型推敲', status: 'completed', progress: 100 },
      { phase: '效果图', status: 'in_progress', progress: 65 },
      { phase: '施工图', status: 'pending', progress: 0 },
      { phase: '设计完成', status: 'pending', progress: 0 },
    ],
    currentPhase: '效果图',
    overallProgress: 53,
    createdAt: '2024-10-01',
    updatedAt: '2024-12-10',
  },
  {
    id: '2',
    name: '陆家嘴高端住宅',
    clientId: '2',
    designerId: '2',
    status: 'in_progress',
    priority: 'high',
    budget: 380000,
    startDate: '2024-11-01',
    description: '轻奢风格私人住宅设计，包含客厅、卧室、书房',
    location: '上海市浦东新区陆家嘴',
    area: 320,
    style: '轻奢',
    phases: [
      { phase: '平面设计', status: 'completed', progress: 100 },
      { phase: 'SU模型推敲', status: 'in_progress', progress: 75 },
      { phase: '效果图', status: 'pending', progress: 0 },
      { phase: '施工图', status: 'pending', progress: 0 },
      { phase: '设计完成', status: 'pending', progress: 0 },
    ],
    currentPhase: 'SU模型推敲',
    overallProgress: 35,
    createdAt: '2024-10-20',
    updatedAt: '2024-12-08',
  },
  {
    id: '3',
    name: '科技园办公楼',
    clientId: '3',
    designerId: '1',
    status: 'completed',
    priority: 'medium',
    budget: 520000,
    startDate: '2024-06-01',
    endDate: '2024-10-30',
    description: '开放式办公空间，包含会议室、休息区、茶水间',
    location: '深圳市南山区科技园',
    area: 1200,
    style: '工业风',
    phases: [
      { phase: '平面设计', status: 'completed', progress: 100 },
      { phase: 'SU模型推敲', status: 'completed', progress: 100 },
      { phase: '效果图', status: 'completed', progress: 100 },
      { phase: '施工图', status: 'completed', progress: 100 },
      { phase: '设计完成', status: 'completed', progress: 100 },
    ],
    currentPhase: '设计完成',
    overallProgress: 100,
    createdAt: '2024-05-15',
    updatedAt: '2024-10-30',
  },
  {
    id: '4',
    name: '别墅改造项目',
    clientId: '1',
    designerId: '3',
    status: 'pending',
    priority: 'medium',
    budget: 280000,
    startDate: '2025-01-15',
    description: '三层别墅全屋改造，新中式风格',
    location: '北京市顺义区中央别墅区',
    area: 450,
    style: '新中式',
    phases: createDefaultPhases(),
    currentPhase: '平面设计',
    overallProgress: 0,
    createdAt: '2024-12-05',
    updatedAt: '2024-12-05',
  },
  {
    id: '5',
    name: '创意工作室',
    clientId: '3',
    designerId: '2',
    status: 'in_progress',
    priority: 'low',
    budget: 180000,
    startDate: '2024-11-20',
    description: '创意工作室空间设计，强调灵活性和功能性',
    location: '深圳市南山区',
    area: 280,
    style: '现代简约',
    phases: [
      { phase: '平面设计', status: 'completed', progress: 100 },
      { phase: 'SU模型推敲', status: 'in_progress', progress: 20 },
      { phase: '效果图', status: 'pending', progress: 0 },
      { phase: '施工图', status: 'pending', progress: 0 },
      { phase: '设计完成', status: 'pending', progress: 0 },
    ],
    currentPhase: 'SU模型推敲',
    overallProgress: 24,
    createdAt: '2024-11-15',
    updatedAt: '2024-12-12',
  },
];

const initialCases: DesignCase[] = [
  {
    id: '1',
    name: '望京SOHO现代办公空间',
    projectId: '3',
    designerId: '1',
    style: '工业风',
    location: '深圳市南山区科技园',
    area: 1200,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    ],
    description: '开放式办公空间设计，融合工业风元素与现代美学',
    tags: ['办公空间', '工业风', '开放办公'],
    featured: true,
    views: 1234,
    likes: 89,
    createdAt: '2024-11-01',
  },
  {
    id: '2',
    name: '新中式住宅',
    projectId: '4',
    designerId: '2',
    style: '新中式',
    location: '北京市朝阳区',
    area: 380,
    images: [
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    description: '传统中式元素与现代生活方式的完美融合',
    tags: ['住宅', '新中式', '别墅'],
    featured: true,
    views: 2341,
    likes: 156,
    createdAt: '2024-10-15',
  },
  {
    id: '3',
    name: '极简主义公寓',
    projectId: '2',
    designerId: '3',
    style: '极简主义',
    location: '上海市浦东新区',
    area: 150,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    description: '简约而不简单的空间设计，追求极致的美学体验',
    tags: ['公寓', '极简主义', '小户型'],
    featured: false,
    views: 876,
    likes: 45,
    createdAt: '2024-09-20',
  },
];

// 初始跟进记录
const initialFollowUps: FollowUp[] = [
  {
    id: '1',
    clientId: '1',
    type: 'call',
    content: '电话沟通了望京SOHO项目的进度，客户对效果图阶段表示满意',
    nextAction: '准备效果图初稿',
    nextDate: '2024-12-15',
    designerId: '1',
    createdAt: '2024-12-10',
  },
  {
    id: '2',
    clientId: '1',
    type: 'visit',
    content: '上门测量别墅现场，记录了房屋结构和客户需求',
    nextAction: '完成平面设计方案',
    nextDate: '2025-01-10',
    designerId: '3',
    createdAt: '2024-12-05',
  },
  {
    id: '3',
    clientId: '2',
    type: 'wechat',
    content: '微信确认了陆家嘴住宅项目的材料选择，客户偏向现代轻奢风格',
    nextAction: '提交SU模型方案',
    nextDate: '2024-12-12',
    designerId: '2',
    createdAt: '2024-12-08',
  },
  {
    id: '4',
    clientId: '3',
    type: 'visit',
    content: '现场考察科技园办公楼，与客户讨论空间布局需求',
    nextAction: '准备施工图',
    nextDate: '2024-10-25',
    designerId: '1',
    createdAt: '2024-10-20',
  },
  {
    id: '5',
    clientId: '3',
    type: 'email',
    content: '发送创意工作室的设计方案和报价',
    nextAction: '等待客户反馈',
    nextDate: '2024-12-15',
    designerId: '2',
    createdAt: '2024-12-12',
  },
];

// Context 类型定义
interface StoreContextType {
  projects: Project[];
  clients: Client[];
  designers: Designer[];
  cases: DesignCase[];
  followUps: FollowUp[];
  
  // 项目操作
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // 客户操作
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalProjects' | 'totalSpent'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // 设计师操作
  addDesigner: (designer: Omit<Designer, 'id' | 'joinedAt' | 'activeProjects' | 'completedProjects'>) => void;
  updateDesigner: (id: string, updates: Partial<Designer>) => void;
  deleteDesigner: (id: string) => void;
  
  // 案例操作
  addCase: (caseItem: Omit<DesignCase, 'id' | 'createdAt' | 'views' | 'likes'>) => void;
  updateCase: (id: string, updates: Partial<DesignCase>) => void;
  deleteCase: (id: string) => void;
  
  // 跟进记录操作
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => void;
  deleteFollowUp: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  // 从 localStorage 加载数据，如果没有则使用初始数据
  const [idMap, setIdMap] = useState<Record<string, string>>(loadIdMap);
  
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window === 'undefined') return initialProjects;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.projects);
      return stored ? JSON.parse(stored) : initialProjects;
    } catch {
      return initialProjects;
    }
  });
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window === 'undefined') return initialClients;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.clients);
      return stored ? JSON.parse(stored) : initialClients;
    } catch {
      return initialClients;
    }
  });
  const [designers, setDesigners] = useState<Designer[]>(() => {
    if (typeof window === 'undefined') return initialDesigners;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.designers);
      return stored ? JSON.parse(stored) : initialDesigners;
    } catch {
      return initialDesigners;
    }
  });
  const [cases, setCases] = useState<DesignCase[]>(() => {
    if (typeof window === 'undefined') return initialCases;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.cases);
      return stored ? JSON.parse(stored) : initialCases;
    } catch {
      return initialCases;
    }
  });
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    if (typeof window === 'undefined') return initialFollowUps;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.followUps);
      return stored ? JSON.parse(stored) : initialFollowUps;
    } catch {
      return initialFollowUps;
    }
  });

  // 保存数据到 localStorage（仅在客户端）
  const saveToStorage = (key: string, data: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // 项目操作
  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => {
      const updated = [...prev, newProject];
      saveToStorage(STORAGE_KEYS.projects, updated);
      // 异步同步到 Supabase
      syncToSupabase('addProject', newProject, idMap, setIdMap).catch(console.error);
      return updated;
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => {
      const updated = prev.map(p =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : p
      );
      saveToStorage(STORAGE_KEYS.projects, updated);
      // 异步同步到 Supabase
      const updatedProject = updated.find(p => p.id === id);
      if (updatedProject) {
        syncToSupabase('updateProject', updatedProject, idMap, setIdMap).catch(console.error);
      }
      return updated;
    });
  };

  const deleteProject = (id: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToStorage(STORAGE_KEYS.projects, updated);
      // 异步同步到 Supabase
      syncToSupabase('deleteProject', { id }, idMap, setIdMap).catch(console.error);
      return updated;
    });
  };

  // 客户操作
  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'totalProjects' | 'totalSpent'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      totalProjects: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients(prev => {
      const updated = [...prev, newClient];
      saveToStorage(STORAGE_KEYS.clients, updated);
      // 异步同步到 Supabase
      syncToSupabase('addClient', newClient, idMap, setIdMap).catch(console.error);
      return updated;
    });
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, ...updates } : c));
      saveToStorage(STORAGE_KEYS.clients, updated);
      // 异步同步到 Supabase
      const updatedClient = updated.find(c => c.id === id);
      if (updatedClient) {
        syncToSupabase('updateClient', updatedClient, idMap, setIdMap).catch(console.error);
      }
      return updated;
    });
  };

  const deleteClient = (id: string) => {
    setClients(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage(STORAGE_KEYS.clients, updated);
      // 异步同步到 Supabase
      syncToSupabase('deleteClient', { id }, idMap, setIdMap).catch(console.error);
      return updated;
    });
  };

  // 设计师操作
  const addDesigner = (designer: Omit<Designer, 'id' | 'joinedAt' | 'activeProjects' | 'completedProjects'>) => {
    const newDesigner: Designer = {
      ...designer,
      id: Date.now().toString(),
      activeProjects: 0,
      completedProjects: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setDesigners(prev => {
      const updated = [...prev, newDesigner];
      saveToStorage(STORAGE_KEYS.designers, updated);
      // 异步同步到 Supabase
      syncToSupabase('addDesigner', newDesigner, idMap, setIdMap).catch(console.error);
      return updated;
    });
  };

  const updateDesigner = (id: string, updates: Partial<Designer>) => {
    setDesigners(prev => {
      const updated = prev.map(d => (d.id === id ? { ...d, ...updates } : d));
      saveToStorage(STORAGE_KEYS.designers, updated);
      // 异步同步到 Supabase
      const updatedDesigner = updated.find(d => d.id === id);
      if (updatedDesigner) {
        syncToSupabase('updateDesigner', updatedDesigner, idMap, setIdMap).catch(console.error);
      }
      return updated;
    });
  };

  const deleteDesigner = (id: string) => {
    setDesigners(prev => {
      const updated = prev.filter(d => d.id !== id);
      saveToStorage(STORAGE_KEYS.designers, updated);
      // 异步同步到 Supabase
      syncToSupabase('deleteDesigner', { id }, idMap, setIdMap).catch(console.error);
      return updated;
    });
  };

  // 案例操作
  const addCase = (caseItem: Omit<DesignCase, 'id' | 'createdAt' | 'views' | 'likes'>) => {
    const newCase: DesignCase = {
      ...caseItem,
      id: Date.now().toString(),
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCases(prev => {
      const updated = [...prev, newCase];
      saveToStorage(STORAGE_KEYS.cases, updated);
      // 异步同步到 Supabase
      syncToSupabase('addCase', newCase, idMap, setIdMap).catch(console.error);
      return updated;
    });
  };

  const updateCase = (id: string, updates: Partial<DesignCase>) => {
    setCases(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, ...updates } : c));
      saveToStorage(STORAGE_KEYS.cases, updated);
      // 异步同步到 Supabase
      const updatedCase = updated.find(c => c.id === id);
      if (updatedCase) {
        syncToSupabase('updateCase', updatedCase, idMap, setIdMap).catch(console.error);
      }
      return updated;
    });
  };

  const deleteCase = (id: string) => {
    setCases(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage(STORAGE_KEYS.cases, updated);
      // 异步同步到 Supabase
      syncToSupabase('deleteCase', { id }, idMap, setIdMap).catch(console.error);
      return updated;
    });
  };

  // 跟进记录操作
  const addFollowUp = (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => {
    const newFollowUp: FollowUp = {
      ...followUp,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setFollowUps(prev => {
      const updated = [newFollowUp, ...prev];
      saveToStorage(STORAGE_KEYS.followUps, updated);
      // 异步同步到 Supabase
      syncToSupabase('addFollowUp', newFollowUp, idMap, setIdMap).catch(console.error);
      return updated;
    });

    // 更新客户的最后联系时间
    setClients(prev => {
      const updated = prev.map(c =>
        c.id === followUp.clientId
          ? { ...c, lastContactAt: newFollowUp.createdAt }
          : c
      );
      saveToStorage(STORAGE_KEYS.clients, updated);
      // 异步同步到 Supabase
      const updatedClient = updated.find(c => c.id === followUp.clientId);
      if (updatedClient) {
        syncToSupabase('updateClient', updatedClient, idMap, setIdMap).catch(console.error);
      }
      return updated;
    });
  };

  const deleteFollowUp = (id: string) => {
    setFollowUps(prev => {
      const updated = prev.filter(f => f.id !== id);
      saveToStorage(STORAGE_KEYS.followUps, updated);
      // 异步同步到 Supabase
      syncToSupabase('deleteFollowUp', { id }, idMap, setIdMap).catch(console.error);
      return updated;
    });
  };

  return (
    <StoreContext.Provider
      value={{
        projects,
        clients,
        designers,
        cases,
        followUps,
        addProject,
        updateProject,
        deleteProject,
        addClient,
        updateClient,
        deleteClient,
        addDesigner,
        updateDesigner,
        deleteDesigner,
        addCase,
        updateCase,
        deleteCase,
        addFollowUp,
        deleteFollowUp,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
