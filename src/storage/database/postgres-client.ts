/**
 * PostgreSQL 数据库客户端（非 Supabase）
 * 使用 Drizzle ORM + pg 直接连接 PostgreSQL 数据库
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

// 数据库连接配置
const dbHost = process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432', 10);
const dbUser = process.env.DB_USER || process.env.POSTGRES_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '';
const dbName = process.env.DB_NAME || process.env.POSTGRES_DB || 'postgres';

let pool: pkg.Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * 创建数据库连接池
 */
function createPool(): pkg.Pool {
  if (pool) {
    return pool;
  }

  try {
    pool = new Pool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 空闲连接超时
      connectionTimeoutMillis: 2000, // 连接超时
    });

    // 监听连接错误
    pool.on('error', (err) => {
      console.error('数据库连接池错误:', err);
    });

    return pool;
  } catch (error) {
    console.error('创建数据库连接池失败:', error);
    throw new Error('数据库连接失败');
  }
}

/**
 * 获取 Drizzle 数据库实例
 */
export function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const pool = createPool();
    dbInstance = drizzle(pool);
    return dbInstance;
  } catch (error) {
    console.error('获取数据库实例失败:', error);
    throw new Error('数据库初始化失败');
  }
}

/**
 * 测试数据库连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = createPool();
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    console.log('✅ 数据库连接成功:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

/**
 * 关闭数据库连接池
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    dbInstance = null;
  }
}

/**
 * 获取原始连接池（用于特殊场景）
 */
export function getPool() {
  return createPool();
}

/**
 * 重置数据库实例（用于测试或重新连接）
 */
export function resetDatabase() {
  if (pool) {
    pool.end().then(() => {
      pool = null;
      dbInstance = null;
    });
  }
}

export default getDatabase;
