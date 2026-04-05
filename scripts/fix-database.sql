-- ============================================================================
-- 修复表结构补丁脚本
-- ============================================================================
-- 问题：客户端代码期望的字段与实际表结构不匹配
-- 解决：添加缺失的字段
-- ============================================================================

-- 1. 修复 users 表 - 添加缺失字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 验证修复
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
