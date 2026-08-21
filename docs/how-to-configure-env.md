# 环境变量配置指南

## 当前状态检查

### 1. 检查环境变量

```bash
env | grep -E "SUPABASE|COZE" | sort
```

### 2. 当前可用的 Coze 环境变量

✅ 已配置的环境变量：
```
COZE_PROJECT_ENV=DEV
COZE_PROJECT_ID=7623708897425080329
COZE_PROJECT_NAME=设计工作室管理平台
COZE_PROJECT_DOMAIN_DEFAULT=https://1b574753-057d-4d9e-8020-ddd04f60de94.dev.coze.site
COZE_WORKSPACE_PATH=/workspace/projects
DEPLOY_RUN_PORT=5000
```

❌ 缺少的 Supabase 环境变量：
```
COZE_SUPABASE_URL=
COZE_SUPABASE_ANON_KEY=
COZE_SUPABASE_SERVICE_ROLE_KEY=
```

## 解决方案

### 方案 1：在 Coze 平台开通 Supabase 服务（推荐）

**步骤 1：登录 Coze 平台**
1. 访问 Coze 平台工作台
2. 进入你的项目

**步骤 2：开通 Supabase 集成**
1. 进入项目设置
2. 找到"集成"或"服务配置"选项
3. 找到 **Supabase**
4. 点击"开通"或"启用"按钮
5. 等待开通完成（通常需要几分钟）

**步骤 3：重启项目**
```bash
# 停止当前服务
Ctrl + C

# 重新启动
coze dev
```

**步骤 4：验证配置**
```bash
# 检查环境变量
env | grep SUPABASE

# 访问测试接口
curl http://localhost:5000/api/debug
```

**优点**：
- ✅ 环境变量自动注入
- ✅ 无需手动配置
- ✅ 生产环境自动同步
- ✅ 符合最佳实践

### 方案 2：手动配置 Supabase 环境变量

如果你已经有了 Supabase 项目的凭证，可以手动配置。

**步骤 1：获取 Supabase 凭证**
1. 访问 [https://supabase.com](https://supabase.com)
2. 登录或注册账号
3. 创建新项目或选择现有项目
4. 进入 **Settings** → **API**
5. 复制以下信息：
   - **Project URL**: `https://[project-id].supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role secret**: `eyJhbGc...`（可选）

**步骤 2：配置 .env.local 文件**

编辑 `/workspace/projects/.env.local`：

```bash
# Supabase 项目 URL
COZE_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co

# Supabase 匿名访问密钥
COZE_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase 服务端密钥（可选）
COZE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**示例**：
```bash
COZE_SUPABASE_URL=https://abc123xyz.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://abc123xyz.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
COZE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**步骤 3：重启服务**
```bash
# 停止服务
Ctrl + C

# 清理缓存
rm -rf .next

# 重新启动
coze dev
```

**步骤 4：验证配置**

访问：`http://localhost:5000/api/debug`

**成功响应**：
```json
{
  "success": true,
  "message": "数据库连接成功",
  "database": {
    "healthCheck": [...],
    "studioInfo": [...]
  }
}
```

### 方案 3：创建免费的 Supabase 项目（适用于本地开发）

如果你还没有 Supabase 项目，可以免费创建一个。

**步骤 1：注册 Supabase**
1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub、Google 或邮箱注册

**步骤 2：创建项目**
1. 登录后点击 "New Project"
2. 填写项目信息：
   - **Name**: `设计工作室管理平台`
   - **Database Password**: 设置一个强密码（记住它）
   - **Region**: 选择离你最近的区域
3. 点击 "Create new project"
4. 等待项目创建完成（1-2 分钟）

**步骤 3：获取 API 凭证**
1. 进入项目主页
2. 点击左侧菜单的 **Settings** → **API**
3. 复制以下信息：
   - **Project URL**
   - **anon public key**
   - **service_role secret**

**步骤 4：配置环境变量**

按照方案 2 的步骤 2 配置 `.env.local` 文件。

**步骤 5：初始化数据库表结构**

Supabase 项目默认是空的，需要创建表结构。

你可以选择：
- 使用 Drizzle 迁移脚本（推荐）
- 在 Supabase Dashboard 中手动创建表
- 使用 SQL 脚本导入表结构

**使用 SQL 脚本**：

1. 进入 Supabase Dashboard
2. 点击左侧菜单的 **SQL Editor**
3. 点击 "New query"
4. 复制以下 SQL 脚本并执行：

```sql
-- 工作室信息表
CREATE TABLE IF NOT EXISTS studio_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    password_hash TEXT NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 客户表
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    company_name VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 设计师表
CREATE TABLE IF NOT EXISTS designers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    specialties TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    bio TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    project_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 健康检查表
CREATE TABLE IF NOT EXISTS health_check (
    id INTEGER PRIMARY KEY,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO health_check (id) VALUES (1) ON CONFLICT DO NOTHING;
```

## 验证配置

### 方法 1：检查环境变量

```bash
# 查看所有环境变量
env | grep -E "SUPABASE|COZE" | sort
```

**预期输出**：
```
COZE_SUPABASE_URL=https://xxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 方法 2：访问测试接口

```bash
curl http://localhost:5000/api/debug
```

**成功响应**：
```json
{
  "success": true,
  "message": "数据库连接成功"
}
```

### 方法 3：查看浏览器控制台

打开浏览器控制台（F12），查看日志：

- ✅ `数据库初始化成功` → 配置正确
- ❌ `数据库初始化失败，使用本地存储` → 配置错误

## 常见问题

### Q1: 修改 .env.local 后没有生效？

**A**: 需要重启开发服务器：

```bash
# 停止服务
Ctrl + C

# 清理缓存
rm -rf .next

# 重新启动
coze dev
```

### Q2: 如何获取 Supabase 凭证？

**A**: 参考方案 2 和方案 3 的详细步骤。

### Q3: 可以不使用 Supabase 吗？

**A**: 可以。系统会自动降级到 localStorage 模式，所有功能仍然可以使用。

### Q4: Supabase 是免费的吗？

**A**: Supabase 免费套餐包含：
- 500MB 数据库存储
- 1GB 文件存储
- 2GB 带宽/月
- 50,000 MAU/月

对于小项目完全够用。

### Q5: 在生产环境如何配置？

**A**: 在 Coze 平台的生产环境中，环境变量会自动注入，无需手动配置。

## 安全注意事项

1. **不要提交敏感信息到 Git**
   - `.env.local` 已加入 `.gitignore`
   - 永远不要将 API 密钥提交到版本控制

2. **使用不同的环境**
   - 开发环境和生产环境使用不同的 Supabase 项目
   - 定期轮换密钥

3. **最小权限原则**
   - 客户端使用 anon key
   - 服务端使用 service_role key
   - 不要在客户端暴露 service_role key

## 快速配置模板

复制以下模板到 `.env.local` 文件，然后填写实际值：

```bash
# ============================================================================
# Supabase 数据库配置
# ============================================================================
# 获取方式：https://supabase.com/dashboard → Settings → API

# Supabase 项目 URL
COZE_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co

# Supabase 匿名访问密钥
COZE_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase 服务端密钥（可选，仅服务端使用）
COZE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 下一步

配置完成后：
1. 重启开发服务器
2. 访问 `http://localhost:5000/api/debug` 验证连接
3. 查看浏览器控制台确认数据库初始化状态
4. 开始使用数据库功能

## 获取帮助

如果遇到问题：
1. 查看 [Supabase 官方文档](https://supabase.com/docs)
2. 检查浏览器控制台日志
3. 查看 `/app/work/logs/bypass/app.log` 日志文件
4. 参考 `docs/` 目录下的其他文档

---

**提示**: 如果只是想快速体验系统，无需配置数据库，直接使用默认的 localStorage 模式即可！
