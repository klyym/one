/**
 * 数据库服务层
 * 提供统一的数据访问接口
 * 支持字段名映射，将前端数据格式转换为数据库格式
 */

import { getSupabaseClient } from './supabase-client';

const client = getSupabaseClient();

// 字段映射工具函数
const mapClientToDb = {
  // Client 映射
  client: (data: any) => ({
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    company_name: data.company || data.company_name,
    notes: data.notes,
  }),
  
  // Designer 映射
  designer: (data: any) => ({
    name: data.name,
    position: data.title || data.position,
    phone: data.phone,
    email: data.email,
    specialties: data.specialty ? data.specialty.join(',') : undefined,
    rating: data.rating || 0,
    bio: data.bio,
  }),
  
  // Project 映射
  project: (data: any) => ({
    name: data.name,
    client_id: data.clientId,
    designer_id: data.designerId,
    status: data.status,
    priority: data.priority,
    budget: data.budget,
    area: data.area,
    address: data.location || data.address,
    style: data.style,
    overall_progress: data.overallProgress,
    current_phase: data.currentPhase,
    start_date: data.startDate,
    end_date: data.endDate,
    notes: data.description || data.notes,
  }),
  
  // DesignCase 映射
  designCase: (data: any) => ({
    name: data.name,
    style: data.style,
    area: data.area,
    address: data.location || data.address,
    images: data.images,
    tags: data.tags ? data.tags.join(',') : undefined,
    is_featured: data.featured || false,
  }),
  
  // FollowUp 映射
  followUp: (data: any) => ({
    client_id: data.clientId,
    type: data.type,
    content: data.content,
    next_plan: data.nextAction,
    next_date: data.nextDate,
    followed_by: data.designerId,
  }),
};

// 工作室信息
export const studioInfoService = {
  async get() {
    const { data, error } = await client
      .from('studio_info')
      .select('*')
      .maybeSingle();
    if (error) throw new Error(`获取工作室信息失败: ${error.message}`);
    return data;
  },

  async update(info: { name?: string; address?: string; phone?: string; email?: string }) {
    const { data, error } = await client
      .from('studio_info')
      .update({ ...info, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新工作室信息失败: ${error.message}`);
    return data;
  },

  async initialize() {
    try {
      // 检查是否已存在数据
      const { data: existing } = await client
        .from('studio_info')
        .select('id')
        .maybeSingle();

      if (!existing) {
        const { error } = await client
          .from('studio_info')
          .insert({
            name: '室内设计工作室',
            address: '',
            phone: '',
            email: '',
          });
        if (error) throw new Error(`初始化工作室信息失败: ${error.message}`);
      }
    } catch (error) {
      console.warn('工作室信息初始化失败:', error);
    }
  },
};

// 用户
export const userService = {
  async getAll() {
    const { data, error } = await client
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`获取用户列表失败: ${error.message}`);
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`获取用户失败: ${error.message}`);
    return data;
  },

  async getByEmail(email: string) {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw new Error(`获取用户失败: ${error.message}`);
    return data;
  },

  async create(user: { email: string; name: string; role: string; password_hash: string }) {
    const { data, error } = await client
      .from('users')
      .insert(user)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建用户失败: ${error.message}`);
    return data;
  },

  async update(id: string, updates: { name?: string; role?: string; is_active?: boolean; email?: string; password_hash?: string }) {
    const { data, error } = await client
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新用户失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    const { error } = await client
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除用户失败: ${error.message}`);
  },

  async initialize() {
    try {
      // 检查是否已存在用户
      const { data: existing } = await client
        .from('users')
        .select('id')
        .limit(1);

      if (!existing || existing.length === 0) {
        // 创建默认用户（密码需要实际哈希）
        const defaultUsers = [
          {
            id: 'admin-001',
            email: 'admin@studio.com',
            name: '管理员',
            role: 'admin',
            password_hash: 'admin123',
            is_active: true,
          },
          {
            id: 'designer-001',
            email: 'chen@studio.com',
            name: '陈设计师',
            role: 'designer',
            password_hash: '123456',
            is_active: true,
          },
        ];

        const { error } = await client
          .from('users')
          .insert(defaultUsers);
        if (error) throw new Error(`初始化用户数据失败: ${error.message}`);
      }
    } catch (error) {
      console.warn('用户数据初始化失败:', error);
    }
  },
};

// 客户
export const clientService = {
  async getAll() {
    const { data, error } = await client
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`获取客户列表失败: ${error.message}`);
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await client
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`获取客户失败: ${error.message}`);
    return data;
  },

  async create(clientData: any) {
    const dbData = mapClientToDb.client(clientData);
    console.log('[ClientService] 创建客户:', dbData);
    const { data, error } = await client
      .from('clients')
      .insert(dbData)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建客户失败: ${error.message}`);
    return data;
  },

  async update(id: string, updates: any) {
    const dbData = mapClientToDb.client(updates);
    console.log('[ClientService] 更新客户:', id, dbData);
    const { data, error } = await client
      .from('clients')
      .update({ ...dbData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新客户失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    console.log('[ClientService] 删除客户:', id);
    const { error } = await client
      .from('clients')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除客户失败: ${error.message}`);
  },
};

// 设计师
export const designerService = {
  async getAll() {
    const { data, error } = await client
      .from('designers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`获取设计师列表失败: ${error.message}`);
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await client
      .from('designers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`获取设计师失败: ${error.message}`);
    return data;
  },

  async create(designer: any) {
    const dbData = mapClientToDb.designer(designer);
    console.log('[DesignerService] 创建设计师:', dbData);
    const { data, error } = await client
      .from('designers')
      .insert(dbData)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建设计师失败: ${error.message}`);
    return data;
  },

  async update(id: string, updates: any) {
    const dbData = mapClientToDb.designer(updates);
    console.log('[DesignerService] 更新设计师:', id, dbData);
    const { data, error } = await client
      .from('designers')
      .update({ ...dbData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新设计师失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    console.log('[DesignerService] 删除设计师:', id);
    const { error } = await client
      .from('designers')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除设计师失败: ${error.message}`);
  },

  async incrementProjectCount(id: string) {
    try {
      const { data: designer } = await this.getById(id);
      if (designer) {
        return this.update(id, { project_count: (designer.project_count || 0) + 1 });
      }
    } catch (error) {
      console.warn('增加设计师项目计数失败:', error);
    }
  },
};

// 项目
export const projectService = {
  async getAll() {
    const { data, error } = await client
      .from('projects')
      .select('*, clients(name), designers(name)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`获取项目列表失败: ${error.message}`);
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await client
      .from('projects')
      .select('*, clients(name), designers(name)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`获取项目失败: ${error.message}`);
    return data;
  },

  async create(project: any) {
    const dbData = mapClientToDb.project(project);
    console.log('[ProjectService] 创建项目:', dbData);
    const { data, error } = await client
      .from('projects')
      .insert(dbData)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建项目失败: ${error.message}`);
    
    // 增加设计师项目计数
    if (project.designerId) {
      await this.incrementProjectCount(project.designerId);
    }
    
    return data;
  },

  async update(id: string, updates: any) {
    const dbData = mapClientToDb.project(updates);
    console.log('[ProjectService] 更新项目:', id, dbData);
    const { data, error } = await client
      .from('projects')
      .update({ ...dbData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新项目失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    console.log('[ProjectService] 删除项目:', id);
    const { error } = await client
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除项目失败: ${error.message}`);
  },

  async incrementProjectCount(designerId: string) {
    try {
      await designerService.incrementProjectCount(designerId);
    } catch (error) {
      console.warn('增加设计师项目计数失败:', error);
    }
  },
};

// 设计案例
export const caseService = {
  async getAll() {
    const { data, error } = await client
      .from('design_cases')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`获取设计案例列表失败: ${error.message}`);
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await client
      .from('design_cases')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`获取设计案例失败: ${error.message}`);
    return data;
  },

  async create(caseData: any) {
    const dbData = mapClientToDb.designCase(caseData);
    console.log('[CaseService] 创建案例:', dbData);
    const { data, error } = await client
      .from('design_cases')
      .insert(dbData)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建设计案例失败: ${error.message}`);
    return data;
  },

  async update(id: string, updates: any) {
    const dbData = mapClientToDb.designCase(updates);
    console.log('[CaseService] 更新案例:', id, dbData);
    const { data, error } = await client
      .from('design_cases')
      .update({ ...dbData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新设计案例失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    console.log('[CaseService] 删除案例:', id);
    const { error } = await client
      .from('design_cases')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除设计案例失败: ${error.message}`);
  },
};

// 跟进记录
export const followUpService = {
  async getByClientId(clientId: string) {
    const { data, error } = await client
      .from('follow_ups')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`获取跟进记录失败: ${error.message}`);
    return data || [];
  },

  async create(followUp: any) {
    const dbData = mapClientToDb.followUp(followUp);
    console.log('[FollowUpService] 创建跟进记录:', dbData);
    const { data, error } = await client
      .from('follow_ups')
      .insert(dbData)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建跟进记录失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    console.log('[FollowUpService] 删除跟进记录:', id);
    const { error } = await client
      .from('follow_ups')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除跟进记录失败: ${error.message}`);
  },
};
