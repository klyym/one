/**
 * 数据库服务层
 * 提供统一的数据访问接口
 */

import { getSupabaseClient } from './supabase-client';

const client = getSupabaseClient();

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
    // 检查是否已存在用户
    const { data: existing } = await client
      .from('users')
      .select('id')
      .limit(1);

    if (!existing || existing.length === 0) {
      // 创建默认用户（密码需要实际哈希）
      // 这里使用简化版本，实际项目中应该使用 bcrypt 或类似的密码哈希库
      const defaultUsers = [
        {
          id: 'admin-001',
          email: 'admin@studio.com',
          name: '管理员',
          role: 'admin',
          password_hash: 'admin123', // 实际应该使用 bcrypt hash
          is_active: true,
        },
        {
          id: 'designer-001',
          email: 'chen@studio.com',
          name: '陈设计师',
          role: 'designer',
          password_hash: '123456', // 实际应该使用 bcrypt hash
          is_active: true,
        },
      ];

      const { error } = await client
        .from('users')
        .insert(defaultUsers);
      if (error) throw new Error(`初始化用户数据失败: ${error.message}`);
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

  async create(clientData: { name: string; phone?: string; email?: string; address?: string; company_name?: string; notes?: string }) {
    const { data, error } = await client
      .from('clients')
      .insert(clientData)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建客户失败: ${error.message}`);
    return data;
  },

  async update(id: string, updates: { name?: string; phone?: string; email?: string; address?: string; company_name?: string; notes?: string }) {
    const { data, error } = await client
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新客户失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
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

  async create(designer: { name: string; position: string; phone: string; email?: string; specialties?: string; rating?: number; bio?: string }) {
    const { data, error } = await client
      .from('designers')
      .insert(designer)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建设计师失败: ${error.message}`);
    return data;
  },

  async update(id: string, updates: { name?: string; position?: string; phone?: string; email?: string; specialties?: string; rating?: number; bio?: string; project_count?: number }) {
    const { data, error } = await client
      .from('designers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新设计师失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    const { error } = await client
      .from('designers')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除设计师失败: ${error.message}`);
  },

  async incrementProjectCount(id: string) {
    const { data, error } = await client
      .rpc('increment_project_count', { designer_id: id });
    if (error) {
      // 如果 RPC 不存在，手动更新
      const { data: designer } = await this.getById(id);
      if (designer) {
        return this.update(id, { project_count: (designer.project_count || 0) + 1 });
      }
    }
    return data;
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

  async create(project: {
    name: string;
    client_id: string;
    designer_id: string;
    status?: string;
    priority?: string;
    budget?: number;
    area?: number;
    address?: string;
    style?: string;
    start_date?: string;
    end_date?: string;
    notes?: string;
  }) {
    const { data, error } = await client
      .from('projects')
      .insert(project)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建项目失败: ${error.message}`);
    
    // 增加设计师项目计数
    if (project.designer_id) {
      await designerService.incrementProjectCount(project.designer_id);
    }
    
    return data;
  },

  async update(id: string, updates: {
    name?: string;
    client_id?: string;
    designer_id?: string;
    status?: string;
    priority?: string;
    budget?: number;
    area?: number;
    address?: string;
    style?: string;
    overall_progress?: number;
    current_phase?: string;
    start_date?: string;
    end_date?: string;
    notes?: string;
  }) {
    const { data, error } = await client
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新项目失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    const { error } = await client
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除项目失败: ${error.message}`);
  },
};

// 项目阶段
export const projectPhaseService = {
  async getByProjectId(projectId: string) {
    const { data, error } = await client
      .from('project_phases')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`获取项目阶段失败: ${error.message}`);
    return data || [];
  },

  async create(phase: {
    project_id: string;
    phase_name: string;
    status?: string;
    progress?: number;
    notes?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const { data, error } = await client
      .from('project_phases')
      .insert(phase)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建项目阶段失败: ${error.message}`);
    return data;
  },

  async update(id: string, updates: {
    phase_name?: string;
    status?: string;
    progress?: number;
    notes?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const { data, error } = await client
      .from('project_phases')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新项目阶段失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    const { error } = await client
      .from('project_phases')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除项目阶段失败: ${error.message}`);
  },
};

// 设计案例
export const designCaseService = {
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

  async create(caseData: {
    name: string;
    style: string;
    area?: number;
    address?: string;
    images?: any[];
    tags?: string;
    is_featured?: boolean;
  }) {
    const { data, error } = await client
      .from('design_cases')
      .insert(caseData)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建设计案例失败: ${error.message}`);
    return data;
  },

  async update(id: string, updates: {
    name?: string;
    style?: string;
    area?: number;
    address?: string;
    images?: any[];
    tags?: string;
    is_featured?: boolean;
    view_count?: number;
    like_count?: number;
  }) {
    const { data, error } = await client
      .from('design_cases')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新设计案例失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
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

  async create(followUp: {
    client_id: string;
    type: string;
    content: string;
    next_plan?: string;
    next_date?: string;
    followed_by?: string;
  }) {
    const { data, error } = await client
      .from('follow_ups')
      .insert(followUp)
      .select()
      .maybeSingle();
    if (error) throw new Error(`创建跟进记录失败: ${error.message}`);
    return data;
  },

  async delete(id: string) {
    const { error } = await client
      .from('follow_ups')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除跟进记录失败: ${error.message}`);
  },
};

// 数据库初始化
export async function initializeDatabase() {
  try {
    await studioInfoService.initialize();
    await userService.initialize();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}
