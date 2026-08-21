-- ============================================================================
-- 室内设计工作室管理系统 - 数据库增量升级脚本（保留数据）
-- ============================================================================
-- 适用于：数据库已有旧表结构、不想清空数据的情况。
-- 与 scripts/init-database.sql（一键重建）二选一执行。
--
-- 变更内容：
--   1. 删除已废弃的 design_cases（案例展示模块已删除）
--   2. projects 表新增：stage / contract_amount / actual_cost / updates
--   3. projects 表移除：current_phase（设计阶段系统已改为自由跟进记录）
--   4. users 表补 is_active 列（与代码初始化逻辑对齐）
--
-- 使用方法：Supabase Dashboard -> SQL Editor -> New query -> 粘贴执行
-- ============================================================================

-- 1. 删除案例展示表（已删除模块）
DROP TABLE IF EXISTS design_cases CASCADE;

-- 2. projects 表：新增设计/施工阶段字段
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stage VARCHAR(20) NOT NULL DEFAULT 'design';
COMMENT ON COLUMN projects.stage IS 'design 设计跟进 / construction 工程施工';

-- 3. projects 表：新增造价字段（预算 budget 已存在）
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_amount DECIMAL(15,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(15,2);

-- 4. projects 表：新增跟进记录列（jsonb 数组）
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updates JSONB DEFAULT '[]';

-- 5. projects 表：移除废弃的阶段字段
ALTER TABLE projects DROP COLUMN IF EXISTS current_phase;

-- 6. users 表：补 is_active 列（应用初始化默认用户使用）
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 7. 补充索引
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);

-- ============================================================================
-- 完成！刷新应用页面即可连接新结构。
-- 注意：project_phases 表保留但已不再被代码使用，可手动删除：
--   DROP TABLE IF EXISTS project_phases CASCADE;
-- ============================================================================
