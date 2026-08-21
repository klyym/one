-- ============================================================================
-- 室内设计工作室管理系统 - 数据库一键重建脚本
-- ============================================================================
-- ⚠️ 警告：本脚本会 DROP 所有旧表并重建，将清空数据库中所有数据！
--    - 如需保留现有数据，请改用 scripts/migrate-database.sql（增量升级）
--
-- 使用方法：
-- 1. 打开 Supabase Dashboard
-- 2. 点击左侧菜单的 "SQL Editor"
-- 3. 点击 "New query"
-- 4. 复制此脚本并粘贴
-- 5. 点击 "Run" 执行
-- ============================================================================

-- 0. 删除所有旧表（按依赖顺序倒序删除）
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS design_cases CASCADE;
DROP TABLE IF EXISTS project_phases CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS designers CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS studio_info CASCADE;
DROP TABLE IF EXISTS health_check CASCADE;

-- 1. 工作室信息表
CREATE TABLE IF NOT EXISTS studio_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(50),
    avatar VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 客户表
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    company_name VARCHAR(255),
    address TEXT,
    notes TEXT,
    project_count INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    last_contact_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 设计师表
CREATE TABLE IF NOT EXISTS designers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    specialties TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    avatar VARCHAR(255),
    bio TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    project_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 项目表（设计跟进 / 工程施工 两阶段）
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    designer_id UUID REFERENCES designers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',           -- pending, in_progress, completed, on_hold
    stage VARCHAR(20) DEFAULT 'design',             -- design 设计跟进 / construction 工程施工
    priority VARCHAR(20) DEFAULT 'medium',          -- low, medium, high
    budget DECIMAL(15,2),                           -- 预算（元）
    contract_amount DECIMAL(15,2),                  -- 合同额（元）
    actual_cost DECIMAL(15,2),                      -- 实际成本（元）
    area DECIMAL(10,2),
    address TEXT,
    style VARCHAR(100),
    overall_progress INTEGER DEFAULT 0,             -- 总体/施工进度 0-100（手动维护）
    updates JSONB DEFAULT '[]',                     -- 跟进记录 [{ id, date, content }]
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 项目阶段表（已弃用：设计阶段已改为自由跟进记录，此表保留仅为兼容历史数据）
CREATE TABLE IF NOT EXISTS project_phases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phase VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 跟进记录表（客户跟进：电话/上门/邮件/微信等）
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    next_plan TEXT,
    next_date DATE,
    designer_id UUID REFERENCES designers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 健康检查表
CREATE TABLE IF NOT EXISTS health_check (
    id INTEGER PRIMARY KEY,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入健康检查记录
INSERT INTO health_check (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 插入默认工作室信息（应用启动时也会自动初始化，这里作为兜底）
INSERT INTO studio_info (name, address, phone, email, description)
VALUES (
    '室内设计工作室',
    '北京市朝阳区',
    '010-88888888',
    'contact@studio.com',
    '专业的室内设计工作室'
) ON CONFLICT DO NOTHING;

-- 创建索引（优化查询性能）
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_designer_id ON projects(designer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_client_id ON follow_ups(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_designers_email ON designers(email);

-- ============================================================================
-- 完成！
-- ============================================================================
-- 现在你可以：
-- 1. 在 Supabase Dashboard 中查看创建的表（8 张：studio_info/users/clients/designers/
--    projects/project_phases/follow_ups/health_check，design_cases 已移除）
-- 2. 刷新你的应用页面
-- 3. 应用将自动连接数据库并初始化默认账号
--    （admin@studio.com / admin123，由应用启动时写入）
-- ============================================================================
