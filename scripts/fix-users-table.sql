-- ============================================================================
-- 完整修复脚本 - 修复客户端代码与数据库表结构不匹配的问题
-- ============================================================================
-- 问题：
-- 1. users 表的 id 字段是 UUID 类型，但客户端使用字符串 ID
-- 2. 缺少 is_active 字段
--
-- 解决：修改 id 字段为 VARCHAR 类型，添加缺失字段
-- ============================================================================

-- 1. 修改 users 表的 id 字段类型（VARCHAR 兼容字符串 ID 和 UUID）
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255) USING id::text;

-- 2. 添加缺失的 is_active 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. 添加其他可能缺失的字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 4. 删除现有的测试数据（避免冲突）
DELETE FROM users WHERE id IN ('admin-001', 'designer-001');

-- 5. 验证修复结果
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- 修复完成！现在客户端应该能够正常初始化用户数据了
-- ============================================================================
