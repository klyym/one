-- ============================================================================
-- 室内设计工作室管理系统 - 数据库表结构初始化脚本
-- ============================================================================
-- 使用方法：
-- 1. 打开 Supabase Dashboard
-- 2. 点击左侧菜单的 "SQL Editor"
-- 3. 点击 "New query"
-- 4. 复制此脚本并粘贴
-- 5. 点击 "Run" 执行
-- ============================================================================

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

-- 5. 项目表
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    designer_id UUID REFERENCES designers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'planning',
    priority VARCHAR(20) DEFAULT 'medium',
    budget DECIMAL(15,2),
    area DECIMAL(10,2),
    address TEXT,
    style VARCHAR(100),
    current_phase VARCHAR(50) DEFAULT '平面设计',
    overall_progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 项目阶段表
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

-- 7. 设计案例表
CREATE TABLE IF NOT EXISTS design_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    style VARCHAR(100),
    area DECIMAL(10,2),
    address TEXT,
    images TEXT[],
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 跟进记录表
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

-- 9. 健康检查表
CREATE TABLE IF NOT EXISTS health_check (
    id INTEGER PRIMARY KEY,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入健康检查记录
INSERT INTO health_check (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 插入默认工作室信息
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
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_client_id ON follow_ups(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_designers_email ON designers(email);

-- ============================================================================
-- 完成！
-- ============================================================================
-- 现在你可以：
-- 1. 在 Supabase Dashboard 中查看创建的表
-- 2. 刷新你的应用页面
-- 3. 应用将自动连接到数据库并初始化数据
-- ============================================================================
