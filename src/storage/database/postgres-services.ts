/**
 * PostgreSQL 数据库服务层（使用 Drizzle ORM）
 * 替代 Supabase SDK，直接使用 PostgreSQL
 */

import { eq, and, desc, like, sql } from 'drizzle-orm';
import { getDatabase } from './postgres-client';
import * as schema from './shared/schema';

// 类型定义
type Db = ReturnType<typeof getDatabase>;

/**
 * 数据库服务类
 */
class PostgresDatabaseService {
  private db: Db;

  constructor() {
    this.db = getDatabase();
  }

  // ==================== 工作室信息 ====================

  /**
   * 获取工作室信息
   */
  async getStudioInfo() {
    const result = await this.db
      .select()
      .from(schema.studioInfo)
      .limit(1);

    return result[0] || null;
  }

  /**
   * 更新工作室信息
   */
  async updateStudioInfo(data: Partial<typeof schema.studioInfo.$inferInsert>) {
    // 先检查是否存在
    const existing = await this.getStudioInfo();

    if (existing) {
      // 更新
      await this.db
        .update(schema.studioInfo)
        .set({ ...data, updated_at: new Date() })
        .where(eq(schema.studioInfo.id, existing.id));

      return { ...existing, ...data, updated_at: new Date() };
    } else {
      // 插入
      const [result] = await this.db
        .insert(schema.studioInfo)
        .values(data as any)
        .returning();

      return result;
    }
  }

  // ==================== 用户管理 ====================

  /**
   * 获取所有用户
   */
  async getAllUsers() {
    return await this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        role: schema.users.role,
        is_active: schema.users.is_active,
        created_at: schema.users.created_at,
        updated_at: schema.users.updated_at,
      })
      .from(schema.users)
      .orderBy(desc(schema.users.created_at));
  }

  /**
   * 根据 ID 获取用户
   */
  async getUserById(id: string) {
    const [user] = await this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        role: schema.users.role,
        is_active: schema.users.is_active,
        created_at: schema.users.created_at,
        updated_at: schema.users.updated_at,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id));

    return user || null;
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    return user || null;
  }

  /**
   * 创建用户
   */
  async createUser(data: typeof schema.users.$inferInsert) {
    const [user] = await this.db
      .insert(schema.users)
      .values(data)
      .returning();

    return user;
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, data: Partial<typeof schema.users.$inferInsert>) {
    const [user] = await this.db
      .update(schema.users)
      .set({ ...data, updated_at: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    return user;
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string) {
    const result = await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id));

    return result;
  }

  // ==================== 客户管理 ====================

  /**
   * 获取所有客户
   */
  async getAllClients() {
    return await this.db
      .select()
      .from(schema.clients)
      .orderBy(desc(schema.clients.created_at));
  }

  /**
   * 根据搜索和筛选获取客户
   */
  async getClients(filters?: { search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    const conditions = [];

    if (filters?.search) {
      conditions.push(like(schema.clients.name, `%${filters.search}%`));
    }

    if (filters?.sortBy) {
      const column = schema.clients[filters.sortBy as keyof typeof schema.clients];
      if (column) {
        if (filters.sortOrder === 'asc') {
          if (conditions.length > 0) {
            return await this.db
              .select()
              .from(schema.clients)
              .where(and(...conditions))
              .orderBy(column as any);
          }
          return await this.db
            .select()
            .from(schema.clients)
            .orderBy(column as any);
        } else {
          if (conditions.length > 0) {
            return await this.db
              .select()
              .from(schema.clients)
              .where(and(...conditions))
              .orderBy(desc(column as any));
          }
          return await this.db
            .select()
            .from(schema.clients)
            .orderBy(desc(column as any));
        }
      }
    }

    if (conditions.length > 0) {
      return await this.db
        .select()
        .from(schema.clients)
        .where(and(...conditions))
        .orderBy(desc(schema.clients.created_at));
    }

    return await this.db
      .select()
      .from(schema.clients)
      .orderBy(desc(schema.clients.created_at));
  }

  /**
   * 根据 ID 获取客户
   */
  async getClientById(id: string) {
    const [client] = await this.db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.id, id));

    return client || null;
  }

  /**
   * 创建客户
   */
  async createClient(data: typeof schema.clients.$inferInsert) {
    const [client] = await this.db
      .insert(schema.clients)
      .values(data)
      .returning();

    return client;
  }

  /**
   * 更新客户
   */
  async updateClient(id: string, data: Partial<typeof schema.clients.$inferInsert>) {
    const [client] = await this.db
      .update(schema.clients)
      .set({ ...data, updated_at: new Date() })
      .where(eq(schema.clients.id, id))
      .returning();

    return client;
  }

  /**
   * 删除客户
   */
  async deleteClient(id: string) {
    const result = await this.db
      .delete(schema.clients)
      .where(eq(schema.clients.id, id));

    return result;
  }

  // ==================== 设计师管理 ====================

  /**
   * 获取所有设计师
   */
  async getAllDesigners() {
    return await this.db
      .select()
      .from(schema.designers)
      .orderBy(desc(schema.designers.created_at));
  }

  /**
   * 根据 ID 获取设计师
   */
  async getDesignerById(id: string) {
    const [designer] = await this.db
      .select()
      .from(schema.designers)
      .where(eq(schema.designers.id, id));

    return designer || null;
  }

  /**
   * 创建设计师
   */
  async createDesigner(data: typeof schema.designers.$inferInsert) {
    const [designer] = await this.db
      .insert(schema.designers)
      .values(data)
      .returning();

    return designer;
  }

  /**
   * 更新设计师
   */
  async updateDesigner(id: string, data: Partial<typeof schema.designers.$inferInsert>) {
    const [designer] = await this.db
      .update(schema.designers)
      .set({ ...data, updated_at: new Date() })
      .where(eq(schema.designers.id, id))
      .returning();

    return designer;
  }

  /**
   * 删除设计师
   */
  async deleteDesigner(id: string) {
    const result = await this.db
      .delete(schema.designers)
      .where(eq(schema.designers.id, id));

    return result;
  }

  // ==================== 项目管理 ====================

  /**
   * 获取所有项目
   */
  async getAllProjects() {
    return await this.db
      .select()
      .from(schema.projects)
      .orderBy(desc(schema.projects.created_at));
  }

  /**
   * 根据筛选获取项目
   */
  async getProjects(filters?: {
    status?: string;
    clientId?: string;
    designerId?: string;
    search?: string;
  }) {
    let query = this.db.select().from(schema.projects);

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(schema.projects.status, filters.status));
    }

    if (filters?.clientId) {
      conditions.push(eq(schema.projects.client_id, filters.clientId));
    }

    if (filters?.designerId) {
      conditions.push(eq(schema.projects.designer_id, filters.designerId));
    }

    if (filters?.search) {
      conditions.push(like(schema.projects.name, `%${filters.search}%`));
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(schema.projects.created_at));
    }

    return await query.orderBy(desc(schema.projects.created_at));
  }

  /**
   * 根据 ID 获取项目
   */
  async getProjectById(id: string) {
    const [project] = await this.db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, id));

    return project || null;
  }

  /**
   * 创建项目
   */
  async createProject(data: typeof schema.projects.$inferInsert) {
    const [project] = await this.db
      .insert(schema.projects)
      .values(data)
      .returning();

    return project;
  }

  /**
   * 更新项目
   */
  async updateProject(id: string, data: Partial<typeof schema.projects.$inferInsert>) {
    const [project] = await this.db
      .update(schema.projects)
      .set({ ...data, updated_at: new Date() })
      .where(eq(schema.projects.id, id))
      .returning();

    return project;
  }

  /**
   * 删除项目
   */
  async deleteProject(id: string) {
    const result = await this.db
      .delete(schema.projects)
      .where(eq(schema.projects.id, id));

    return result;
  }

  // ==================== 设计案例 ====================

  /**
   * 获取所有案例
   */
  async getAllCases() {
    return await this.db
      .select()
      .from(schema.designCases)
      .orderBy(desc(schema.designCases.created_at));
  }

  /**
   * 根据筛选获取案例
   */
  async getCases(filters?: {
    style?: string;
    isFeatured?: boolean;
    search?: string;
  }) {
    let query = this.db.select().from(schema.designCases);

    const conditions = [];

    if (filters?.style) {
      conditions.push(eq(schema.designCases.style, filters.style));
    }

    if (filters?.isFeatured !== undefined) {
      conditions.push(eq(schema.designCases.is_featured, filters.isFeatured));
    }

    if (filters?.search) {
      conditions.push(like(schema.designCases.name, `%${filters.search}%`));
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(schema.designCases.created_at));
    }

    return await query.orderBy(desc(schema.designCases.created_at));
  }

  /**
   * 根据 ID 获取案例
   */
  async getCaseById(id: string) {
    const [case_] = await this.db
      .select()
      .from(schema.designCases)
      .where(eq(schema.designCases.id, id));

    return case_ || null;
  }

  /**
   * 创建案例
   */
  async createCase(data: typeof schema.designCases.$inferInsert) {
    const [case_] = await this.db
      .insert(schema.designCases)
      .values(data)
      .returning();

    return case_;
  }

  /**
   * 更新案例
   */
  async updateCase(id: string, data: Partial<typeof schema.designCases.$inferInsert>) {
    const [case_] = await this.db
      .update(schema.designCases)
      .set({ ...data, updated_at: new Date() })
      .where(eq(schema.designCases.id, id))
      .returning();

    return case_;
  }

  /**
   * 删除案例
   */
  async deleteCase(id: string) {
    const result = await this.db
      .delete(schema.designCases)
      .where(eq(schema.designCases.id, id));

    return result;
  }

  // ==================== 跟进记录 ====================

  /**
   * 获取客户的所有跟进记录
   */
  async getFollowUpsByClient(clientId: string) {
    return await this.db
      .select()
      .from(schema.followUps)
      .where(eq(schema.followUps.client_id, clientId))
      .orderBy(desc(schema.followUps.created_at));
  }

  /**
   * 创建跟进记录
   */
  async createFollowUp(data: typeof schema.followUps.$inferInsert) {
    const [followUp] = await this.db
      .insert(schema.followUps)
      .values(data)
      .returning();

    return followUp;
  }

  /**
   * 删除跟进记录
   */
  async deleteFollowUp(id: string) {
    const result = await this.db
      .delete(schema.followUps)
      .where(eq(schema.followUps.id, id));

    return result;
  }
}

// 导出服务实例
export const postgresService = new PostgresDatabaseService();

// 导出默认实例
export default postgresService;
