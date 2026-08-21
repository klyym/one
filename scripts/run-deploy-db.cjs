/**
 * 数据库部署工具：执行 SQL 文件（支持多语句 DDL/INSERT）
 *
 * 用法：
 *   DB_CONN="postgresql://user:pass@host:port/db" node scripts/run-deploy-db.cjs scripts/init-database.sql
 *
 * 安全说明：
 *   - 连接串仅从环境变量 DB_CONN 读取，不写入任何文件
 *   - SSL 使用 rejectUnauthorized: false（兼容 Supabase 自签/托管证书）
 */
'use strict';

const { Client } = require('pg');
const fs = require('fs');

const conn = process.env.DB_CONN;
const file = process.argv[2];

if (!conn) {
  console.error('❌ 缺少环境变量 DB_CONN（PostgreSQL 连接串）');
  process.exit(1);
}
if (!file) {
  console.error('❌ 缺少 SQL 文件路径参数');
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`❌ SQL 文件不存在: ${file}`);
  process.exit(1);
}

const sql = fs.readFileSync(file, 'utf8');
const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });

(async () => {
  await client.connect();
  console.log('✅ 数据库连接成功');
  console.log(`📄 执行 SQL 文件: ${file}（${sql.length} 字符）`);
  const res = await client.query(sql);
  console.log('✅ 执行完成');
  if (res && res.command) console.log(`   最后命令: ${res.command}`);
  await client.end();
})().catch(async (e) => {
  console.error(`❌ 执行失败: ${e.message}`);
  try { await client.end(); } catch (_) { /* ignore */ }
  process.exit(1);
});
