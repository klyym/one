-- ============================================================================
-- RLS 修复脚本：为所有表配置公开读写策略
-- ============================================================================
-- 背景：数据库重建后新表默认启用 RLS（行级安全）但没有放行策略，
--       导致浏览器端（anon key）无法读写数据（同步失败、看不到数据）。
-- 原项目设计：所有表 RLS 公开读写，权限控制在应用层。
--
-- 使用方法：Supabase Dashboard -> SQL Editor -> New query -> 粘贴执行
-- ============================================================================

-- 启用 RLS（幂等，重复执行安全）
ALTER TABLE studio_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;

-- 为每张表创建公开读写策略（幂等：如果同名策略已存在会报错，可忽略或先 DROP）
DROP POLICY IF EXISTS "public_all" ON studio_info;
DROP POLICY IF EXISTS "public_all" ON users;
DROP POLICY IF EXISTS "public_all" ON clients;
DROP POLICY IF EXISTS "public_all" ON designers;
DROP POLICY IF EXISTS "public_all" ON projects;
DROP POLICY IF EXISTS "public_all" ON project_phases;
DROP POLICY IF EXISTS "public_all" ON follow_ups;
DROP POLICY IF EXISTS "public_all" ON health_check;

CREATE POLICY "public_all" ON studio_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON designers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON project_phases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON follow_ups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON health_check FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 完成！执行后浏览器端即可正常读写数据库。
-- ============================================================================
