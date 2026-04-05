# 环境变量配置指南

本文档详细说明项目中的环境变量配置，包括开发环境、生产环境以及各个变量的用途。

## 环境变量文件说明

| 文件名 | 用途 | 是否提交到 Git |
|--------|------|----------------|
| `.env.example` | 环境变量示例模板 | ✅ 是 |
| `.env.local` | 本地开发环境配置 | ❌ 否 |
| `.env.production` | 生产环境配置（平台注入） | ❌ 否 |

## 环境变量分类

### 1. Coze 平台自动注入变量

以下环境变量由 Coze 平台自动注入，无需手动配置：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `COZE_PROJECT_ENV` | 应用环境 | `DEV` 或 `PROD` |
| `COZE_WORKSPACE_PATH` | 项目工作目录 | `/workspace/projects` |
| `COZE_PROJECT_DOMAIN_DEFAULT` | 对外访问域名 | `https://abc123.dev.coze.site` |
| `DEPLOY_RUN_PORT` | 服务监听端口 | `5000` |
| `COZE_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `COZE_SUPABASE_ANON_KEY` | Supabase 匿名访问密钥 | `eyJhbGc...` |
| `COZE_SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | `eyJhbGc...` |

### 2. 应用配置变量

| 变量名 | 说明 | 默认值 | 是否必需 |
|--------|------|--------|----------|
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `室内设计工作室管理系统` | 否 |
| `NEXT_PUBLIC_APP_VERSION` | 应用版本 | `1.0.0` | 否 |
| `NEXT_PUBLIC_DEBUG` | 调试模式 | `false` | 否 |

### 3. Supabase 数据库变量

| 变量名 | 说明 | 是否必需 | 使用场景 |
|--------|------|----------|----------|
| `COZE_SUPABASE_URL` | Supabase 项目 URL | 否 | 数据库连接 |
| `COZE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 否 | 客户端访问 |
| `COZE_SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | 否 | 服务端访问 |
| `NEXT_PUBLIC_SUPABASE_URL` | 客户端可见的 Supabase URL | 否 | 客户端连接 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 客户端可见的密钥 | 否 | 客户端认证 |

### 4. 对象存储变量（可选）

| 变量名 | 说明 | 是否必需 |
|--------|------|----------|
| `S3_BUCKET_NAME` | S3 存储桶名称 | 否 |
| `S3_ACCESS_KEY_ID` | S3 访问密钥 ID | 否 |
| `S3_SECRET_ACCESS_KEY` | S3 密钥 | 否 |
| `S3_REGION` | S3 区域 | 否 |
| `S3_ENDPOINT` | S3 端点 | 否 |

## 环境变量优先级

环境变量的读取优先级（从高到低）：

1. **Coze 平台注入的环境变量**（最高优先级）
2. `.env.local` 文件中的配置
3. `.env.development` 或 `.env.production` 文件
4. `.env` 文件
5. 系统环境变量

## 配置场景

### 场景 1：本地开发（不使用数据库）

系统会自动降级到 localStorage 模式，无需配置任何数据库相关变量。

```bash
# .env.local 保持默认或留空即可
```

**特点**：
- ✅ 所有功能正常使用
- ✅ 数据保存在浏览器本地
- ❌ 无法在多设备间同步
- ❌ 刷新浏览器数据不会丢失

### 场景 2：本地开发（使用本地 Supabase）

需要自己搭建 Supabase 项目或使用 Supabase Cloud。

```bash
# .env.local
COZE_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**特点**：
- ✅ 所有功能正常使用
- ✅ 数据保存在数据库
- ✅ 支持多端同步
- ✅ 支持离线工作（降级机制）

### 场景 3：Coze 平台开发环境

在 Coze 平台开发环境中，环境变量会自动注入。

```bash
# 系统环境变量（由平台注入）
COZE_PROJECT_ENV=DEV
COZE_SUPABASE_URL=https://xxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGc...
```

**注意**：
- ✅ 如果在 Coze 平台开通了 Supabase 服务，环境变量自动注入
- ❌ 如果未开通 Supabase，系统会降级到 localStorage 模式

### 场景 4：Coze 平台生产环境

生产环境的环境变量由 Coze 平台自动注入和管理。

```bash
# 系统环境变量（由平台注入）
COZE_PROJECT_ENV=PROD
COZE_PROJECT_DOMAIN_DEFAULT=https://your-project.coze.site
DEPLOY_RUN_PORT=5000
COZE_SUPABASE_URL=https://xxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGc...
COZE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 变量命名规范

### 公开变量（浏览器端可见）

以 `NEXT_PUBLIC_` 前缀开头的变量会在构建时打包到客户端代码中，可以在浏览器中访问。

```typescript
// 示例：在客户端代码中使用
const appName = process.env.NEXT_PUBLIC_APP_NAME;
```

**注意事项**：
- ❌ 不要在公开变量中存储敏感信息（如密钥、密码）
- ✅ 仅存储非敏感的配置信息（如应用名称、版本号）

### 私有变量（仅服务端可见）

不带 `NEXT_PUBLIC_` 前缀的变量仅在服务端可用，不会暴露给浏览器。

```typescript
// 示例：在服务端代码中使用
const supabaseUrl = process.env.COZE_SUPABASE_URL;
```

**注意事项**：
- ✅ 可以存储敏感信息（如 API 密钥、数据库连接字符串）
- ❌ 在客户端代码中访问会返回 `undefined`

## 如何获取 Supabase 凭证

### 使用 Supabase Cloud

1. 访问 [https://supabase.com](https://supabase.com)
2. 登录或注册账号
3. 创建新项目：
   - 点击 "New Project"
   - 输入项目名称
   - 选择数据库密码
   - 选择区域（推荐选择离你最近的区域）
   - 点击 "Create new project"
4. 等待项目创建完成（通常需要 1-2 分钟）
5. 进入项目设置：
   - 点击左侧菜单的 "Settings" → "API"
   - 复制以下信息：
     - **Project URL**: `https://xxx.supabase.co`
     - **anon public key**: `eyJhbGc...`
     - **service_role secret**: `eyJhbGc...`（服务端专用）

### 使用自建 Supabase

如果你使用自建的 Supabase 实例：

1. 获取 Supabase 实例的访问 URL
2. 从管理员那里获取 API 密钥
3. 配置到 `.env.local` 文件中

## 安全最佳实践

### 1. 永远不要提交敏感信息到 Git

```bash
# .gitignore 已配置
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 2. 使用不同的密钥

- 开发环境和生产环境使用不同的 Supabase 项目
- 定期轮换密钥
- 使用最小权限原则（anon key vs service_role key）

### 3. 监控密钥使用

- 定期检查 Supabase 项目的访问日志
- 如果发现异常使用，立即轮换密钥

### 4. 环境隔离

- 开发、测试、生产环境使用不同的配置
- 不要在代码中硬编码任何配置

## 调试环境变量

### 检查环境变量是否生效

在开发环境中，可以通过以下方式检查：

**方法 1：在服务端代码中打印**

```typescript
// src/app/api/debug/route.ts
export async function GET() {
  return Response.json({
    env: process.env.COZE_PROJECT_ENV,
    workspace: process.env.COZE_WORKSPACE_PATH,
    supabaseUrl: process.env.COZE_SUPABASE_URL,
  });
}
```

**方法 2：在浏览器控制台检查**

```javascript
// 公开变量
console.log(process.env.NEXT_PUBLIC_APP_NAME);

// 私有变量（返回 undefined）
console.log(process.env.COZE_SUPABASE_URL); // undefined
```

**方法 3：查看构建输出**

```bash
# 构建项目
pnpm build

# 查看构建日志中的环境变量
```

### 常见问题

#### Q: 修改了 .env.local 但没有生效？

**A**: 需要重启开发服务器：

```bash
# 停止服务
Ctrl + C

# 重新启动
pnpm dev
```

#### Q: 为什么在浏览器中访问不到 `COZE_SUPABASE_URL`？

**A**: 因为它不是公开变量。如果需要在客户端访问，请使用 `NEXT_PUBLIC_SUPABASE_URL`。

#### Q: 如何在 Docker 中配置环境变量？

**A**: 使用 `docker-compose.yml` 或 Dockerfile：

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - COZE_SUPABASE_URL=https://xxx.supabase.co
      - COZE_SUPABASE_ANON_KEY=your-key
    env_file:
      - .env.local
```

## 参考链接

- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase 客户端配置](https://supabase.com/docs/reference/javascript/initializing)
- [Coze 平台开发文档](https://www.coze.cn/docs)

## 更新日志

- 2024-04-05: 创建环境变量配置指南
