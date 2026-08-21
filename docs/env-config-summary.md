# 环境变量配置总结

## 当前状态

### ✅ 已配置的环境变量

```bash
COZE_PROJECT_ENV=DEV
COZE_PROJECT_ID=7623708897425080329
COZE_PROJECT_NAME=设计工作室管理平台
COZE_PROJECT_DOMAIN_DEFAULT=https://1b574753-057d-4d9e-8020-ddd04f60de94.dev.coze.site
COZE_WORKSPACE_PATH=/workspace/projects
DEPLOY_RUN_PORT=5000
```

### ❌ 缺少的 Supabase 环境变量

```bash
COZE_SUPABASE_URL=
COZE_SUPABASE_ANON_KEY=
COZE_SUPABASE_SERVICE_ROLE_KEY=
```

## 解决方案

### 方案 1：在 Coze 平台开通 Supabase 服务 ⭐ 推荐

**优势**：
- ✅ 环境变量自动注入
- ✅ 无需手动配置
- ✅ 生产环境自动同步
- ✅ 符合最佳实践

**步骤**：
1. 登录 Coze 平台工作台
2. 进入项目设置 → 集成
3. 找到 **Supabase** 并点击"开通"
4. 等待开通完成（几分钟）
5. 重启项目

**重启命令**：
```bash
Ctrl + C
coze dev
```

### 方案 2：使用配置脚本（快速配置）

运行配置脚本：

```bash
/workspace/projects/scripts/configure-env.sh
```

按照提示选择选项 2，输入你的 Supabase 凭证。

**获取 Supabase 凭证**：
1. 访问 [https://supabase.com](https://supabase.com)
2. 登录或注册
3. 创建新项目
4. 进入 Settings → API
5. 复制 Project URL 和 anon public key

### 方案 3：手动配置 .env.local

编辑 `/workspace/projects/.env.local`：

```bash
# Supabase 项目 URL
COZE_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co

# Supabase 匿名访问密钥
COZE_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase 服务端密钥（可选）
COZE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**重启服务**：
```bash
Ctrl + C
rm -rf .next
coze dev
```

### 方案 4：使用 localStorage 模式（无需配置）

**适用场景**：
- 快速体验系统功能
- 单设备使用
- 不需要多端同步

**特点**：
- ✅ 无需配置数据库
- ✅ 所有功能正常使用
- ✅ 数据保存在浏览器本地
- ❌ 无法在多设备间同步

**当前状态**：
系统已自动降级到 localStorage 模式，可以正常使用。

## 验证配置

### 方法 1：检查环境变量

```bash
env | grep SUPABASE
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
  "message": "数据库连接成功",
  "database": {
    "healthCheck": [...],
    "studioInfo": [...]
  }
}
```

### 方法 3：查看应用日志

打开浏览器控制台（F12）：

- ✅ `数据库初始化成功` → 配置正确
- ❌ `数据库初始化失败，使用本地存储` → 配置错误

## 快速配置命令

### 使用脚本（推荐）

```bash
# 运行配置脚本
/workspace/projects/scripts/configure-env.sh

# 按照提示操作
```

### 手动配置

```bash
# 编辑配置文件
nano /workspace/projects/.env.local

# 或使用 vi
vi /workspace/projects/.env.local

# 保存后重启
Ctrl + C
rm -rf .next
coze dev
```

## 当前数据库状态

### 可用的数据库

- **数据库类型**: PostgreSQL 17.5
- **连接地址**: 172.36.4.126:59833
- **数据库名**: postgres
- **访问方式**: 通过 exec_sql 工具

### 已创建的表

```
✅ studio_info        - 工作室基本信息
✅ users              - 用户（管理员、设计师）
✅ clients            - 客户信息
✅ designers          - 设计师信息
✅ projects           - 项目信息
✅ project_phases     - 项目阶段进度
✅ design_cases       - 设计案例
✅ follow_ups         - 跟进记录
✅ health_check       - 系统健康检查
```

### 数据写入测试

已成功测试以下数据写入：
- ✅ 工作室信息
- ✅ 用户数据
- ✅ 客户数据
- ✅ 设计师数据

**注意**：这些数据是通过 exec_sql 工具写入的，应用目前无法访问（缺少 Supabase 环境变量）。

## 文档索引

| 文档 | 用途 |
|------|------|
| `docs/how-to-configure-env.md` | 环境变量配置详细指南 |
| `docs/supabase-setup.md` | Supabase 开通指南 |
| `docs/database-write-guide.md` | 数据库写入功能说明 |
| `docs/environment-variables.md` | 环境变量完整指南 |
| `docs/quickstart-env.md` | 快速开始指南 |
| `scripts/configure-env.sh` | 环境变量配置脚本 |

## 常见问题

### Q1: 为什么要配置 Supabase？

**A**:
- 数据持久化到云端数据库
- 支持多端数据同步
- 支持离线工作（降级机制）
- 生产环境必需

### Q2: 不配置可以吗？

**A**: 可以。系统会自动降级到 localStorage 模式，所有功能正常使用。但数据仅保存在浏览器本地。

### Q3: Supabase 是免费的吗？

**A**: 是的。Supabase 免费套餐包含：
- 500MB 数据库存储
- 1GB 文件存储
- 2GB 带宽/月
- 50,000 MAU/月

### Q4: 如何获取 Supabase 凭证？

**A**:
1. 访问 https://supabase.com
2. 注册并创建项目
3. 进入 Settings → API
4. 复制 Project URL 和 anon public key

### Q5: 配置后没有生效？

**A**:
1. 重启服务：`Ctrl + C` → `coze dev`
2. 清理缓存：`rm -rf .next`
3. 检查环境变量：`env | grep SUPABASE`

## 推荐配置流程

### 快速体验（无需配置）

```bash
# 直接使用，无需任何配置
pnpm dev
# 系统自动使用 localStorage 模式
```

### 完整配置（推荐）

```bash
# 1. 运行配置脚本
/workspace/projects/scripts/configure-env.sh

# 2. 选择选项 1（Coze 平台开通）或 选项 2（手动配置）

# 3. 按照提示操作

# 4. 重启服务
Ctrl + C
rm -rf .next
coze dev

# 5. 验证配置
curl http://localhost:5000/api/debug
```

### 本地开发（使用 Supabase）

```bash
# 1. 创建 Supabase 项目
# 访问 https://supabase.com 并创建项目

# 2. 获取凭证
# Settings → API → 复制 Project URL 和 anon key

# 3. 配置环境变量
# 编辑 .env.local 文件

# 4. 初始化数据库表结构
# 在 Supabase Dashboard 的 SQL Editor 中执行 SQL 脚本

# 5. 重启服务
Ctrl + C
rm -rf .next
coze dev
```

## 下一步

根据你的需求选择：

1. **快速体验** → 使用 localStorage 模式（无需配置）
2. **开发测试** → 配置 Supabase 环境（推荐）
3. **生产部署** → 在 Coze 平台开通 Supabase 服务

## 获取帮助

如遇到问题：
1. 查看文档（`docs/` 目录）
2. 检查日志（`/app/work/logs/bypass/`）
3. 查看浏览器控制台
4. 运行配置脚本：`/workspace/projects/scripts/configure-env.sh`

---

**提示**: 如果只是想快速体验系统功能，无需配置数据库，直接使用 localStorage 模式即可！
