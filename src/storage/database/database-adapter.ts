/**
 * 数据库适配器
 * 支持 PostgreSQL 和 localStorage 双模式，自动降级
 */

import { postgresService } from './postgres-services';
import { testConnection } from './postgres-client';

export type DatabaseMode = 'postgres' | 'local' | 'unavailable';

/**
 * 数据库适配器类
 */
class DatabaseAdapter {
  private mode: DatabaseMode = 'unavailable';
  private initialized = false;

  /**
   * 初始化数据库适配器
   */
  async initialize(): Promise<DatabaseMode> {
    if (this.initialized) {
      return this.mode;
    }

    this.initialized = true;

    // 客户端环境直接使用 localStorage
    if (typeof window !== 'undefined') {
      this.mode = 'local';
      console.log('✅ 数据库模式: localStorage（客户端环境）');
      return this.mode;
    }

    // 服务端尝试连接 PostgreSQL
    try {
      const connected = await testConnection();

      if (connected) {
        this.mode = 'postgres';
        console.log('✅ 数据库模式: PostgreSQL');
        return this.mode;
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL 连接失败，使用 localStorage 模式:', error);
    }

    // 降级到 localStorage
    this.mode = 'local';
    console.log('✅ 数据库模式: localStorage（自动降级）');
    return this.mode;
  }

  /**
   * 获取当前数据库模式
   */
  getMode(): DatabaseMode {
    return this.mode;
  }

  /**
   * 是否使用 PostgreSQL
   */
  isPostgres(): boolean {
    return this.mode === 'postgres';
  }

  /**
   * 是否使用 localStorage
   */
  isLocal(): boolean {
    return this.mode === 'local';
  }

  // ==================== 工作室信息 ====================

  async getStudioInfo() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getStudioInfo();
    }

    // localStorage 模式（返回 null，让上层使用 localStorage）
    return null;
  }

  async updateStudioInfo(data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.updateStudioInfo(data);
    }

    // localStorage 模式（返回 false，让上层使用 localStorage）
    return false;
  }

  // ==================== 用户管理 ====================

  async getAllUsers() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getAllUsers();
    }

    return [];
  }

  async getUserById(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getUserById(id);
    }

    return null;
  }

  async getUserByEmail(email: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getUserByEmail(email);
    }

    return null;
  }

  async createUser(data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.createUser(data);
    }

    return null;
  }

  async updateUser(id: string, data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.updateUser(id, data);
    }

    return null;
  }

  async deleteUser(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.deleteUser(id);
    }

    return null;
  }

  // ==================== 客户管理 ====================

  async getAllClients() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getAllClients();
    }

    return [];
  }

  async getClientById(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getClientById(id);
    }

    return null;
  }

  async createClient(data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.createClient(data);
    }

    return null;
  }

  async updateClient(id: string, data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.updateClient(id, data);
    }

    return null;
  }

  async deleteClient(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.deleteClient(id);
    }

    return null;
  }

  // ==================== 设计师管理 ====================

  async getAllDesigners() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getAllDesigners();
    }

    return [];
  }

  async getDesignerById(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getDesignerById(id);
    }

    return null;
  }

  async createDesigner(data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.createDesigner(data);
    }

    return null;
  }

  async updateDesigner(id: string, data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.updateDesigner(id, data);
    }

    return null;
  }

  async deleteDesigner(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.deleteDesigner(id);
    }

    return null;
  }

  // ==================== 项目管理 ====================

  async getAllProjects() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getAllProjects();
    }

    return [];
  }

  async getProjectById(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getProjectById(id);
    }

    return null;
  }

  async createProject(data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.createProject(data);
    }

    return null;
  }

  async updateProject(id: string, data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.updateProject(id, data);
    }

    return null;
  }

  async deleteProject(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.deleteProject(id);
    }

    return null;
  }

  // ==================== 设计案例 ====================

  async getAllCases() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getAllCases();
    }

    return [];
  }

  async getCaseById(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.getCaseById(id);
    }

    return null;
  }

  async createCase(data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.createCase(data);
    }

    return null;
  }

  async updateCase(id: string, data: any) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.updateCase(id, data);
    }

    return null;
  }

  async deleteCase(id: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.mode === 'postgres') {
      return postgresService.deleteCase(id);
    }

    return null;
  }
}

// 导出适配器实例
export const dbAdapter = new DatabaseAdapter();

// 导出默认实例
export default dbAdapter;
