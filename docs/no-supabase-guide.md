# 不使用 Supabase 配置指南

## 概述

本指南说明如何在不使用 Supabase 的情况下配置环境变量和数据库。

### 当前架构

项目支持两种数据库访问方式：

1. **Supabase SDK 方式**（需要 Supabase 环境变量）
2. **Drizzle ORM + PostgreSQL 方式**（需要 PostgreSQL 连接信息）

默认情况下，系统会自动选择可用的方式，并支持自动降级到 localStorage。

## 配置方式

### 方式 1：不配置任何数据库（推荐）✨

直接使用项目，无需任何数据库配置。

**特点**：
- ✅ 所有功能正常使用
- ✅ 数据保存在浏览器 localStorage
- ✅ 无需配置任何环境变量
- ✅ 可以直接启动项目

**使用方法**：
```bash
pnpm install
pnpm dev
```

### 方式 2：配置 PostgreSQL 数据库

如果你有 PostgreSQL 数据库，可以配置连接信息。

#### 步骤 1：编辑环境变量

编辑 `.env.local` 文件：

```bash
# PostgreSQL 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
```

#### 步骤 2：重启服务

```bash
# 停止服务
Ctrl + C

# 重新启动
pnpm dev
```

#### 步骤 3：验证连接

打开浏览器控制台，查看日志：

- ✅ `✅ 数据库模式: PostgreSQL` → PostgreSQL 已连接
- ✅ `✅ 数据库模式: localStorage（自动降级）` → 降级到 localStorage

### 方式 3：配置 Supabase（如果你有 Supabase 账号）

如果你有自己的 Supabase 项目，可以使用 Supabase SDK 方式。

#### 步骤 1：获取 Supabase 凭证

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目或选择现有项目
3. 进入 Settings > API
4. 复制 Project URL 和 anon public key

#### 步骤 2：配置环境变量

编辑 `.env.local` 文件：

```bash
# Supabase 配置
COZE_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
COZE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 步骤 3：重启服务

```bash
pnpm dev
```

## 环境变量优先级

系统会按照以下优先级选择数据库连接方式：

1. **Supabase 环境变量**（如果配置了 `COZE_SUPABASE_URL`）
2. **PostgreSQL 环境变量**（如果配置了 `DB_HOST`）
3. **localStorage**（降级模式）

## 数据库适配器工作原理

项目使用数据库适配器（`database-adapter.ts`）自动选择数据库方式：

```typescript
// 1. 尝试连接 PostgreSQL（如果配置了）
const connected = await testConnection();
if (connected) {
  mode = 'postgres';
}

// 2. 如果连接失败，自动降级到 localStorage
mode = 'local';
```

### 降级策略

| 场景 | PostgreSQL | Supabase | 最终模式 |
|------|-----------|----------|---------|
| 未配置任何环境变量 | ❌ | ❌ | localStorage |
| 配置了 PostgreSQL | ✅ | ❌ | PostgreSQL |
| 配置了 Supabase | ❌ | ✅ | Supabase |
| 配置了两者 | ✅ | ✅ | Supabase（优先） |
| PostgreSQL 连接失败 | ❌ | ❌ | localStorage（降级） |
| Supabase 连接失败 | ❌ | ❌ | localStorage（降级） |

## 功能对比

| 功能 | localStorage | PostgreSQL | Supabase |
|------|-------------|-----------|----------|
| 数据持久化 | ✅ 浏览器本地 | ✅ 数据库 | ✅ 云数据库 |
| 多端同步 | ❌ | ✅ 需要配置 | ✅ 自动同步 |
| 离线支持 | ✅ | ✅ | ✅（降级） |
| 配置复杂度 | ⭐ 最简单 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 较复杂 |
| 适合场景 | 演示、测试 | 本地开发 | 生产环境 |

## 常见问题

### Q: 我不想配置任何数据库，可以吗？

**A**: 可以！直接使用项目即可，系统会自动使用 localStorage 模式，所有功能都能正常使用。

### Q: 如何知道当前使用的是哪种数据库模式？

**A**: 打开浏览器控制台（F12），查看日志：
- `✅ 数据库模式: PostgreSQL` → 使用 PostgreSQL
- `✅ 数据库模式: localStorage（自动降级）` → 使用 localStorage

### Q: 配置数据库后没有生效？

**A**: 需要重启开发服务器：
```bash
Ctrl + C
pnpm dev
```

### Q: 数据库连接失败会怎么样？

**A**: 系统会自动降级到 localStorage 模式，不影响功能使用。

### Q: 可以同时配置 PostgreSQL 和 Supabase 吗？

**A**: 可以，但 Supabase 会优先被使用。

## 技术实现

### 数据库适配器

项目使用 `database-adapter.ts` 统一管理多种数据库访问方式：

```typescript
class DatabaseAdapter {
  async initialize() {
    // 尝试连接 PostgreSQL
    if (await testConnection()) {
      this.mode = 'postgres';
      return;
    }

    // 降级到 localStorage
    this.mode = 'local';
  }

  async getStudioInfo() {
    if (this.mode === 'postgres') {
      return postgresService.getStudioInfo();
    }
    return null; // 使用 localStorage
  }
}
```

### PostgreSQL 客户端

使用 Drizzle ORM + pg 直接连接 PostgreSQL：

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = drizzle(pool);
```

### Supabase 客户端

使用 Supabase SDK 连接：

```typescript
import { createClient } from '@supabase/supabase-js';

const client = createClient(
  process.env.COZE_SUPABASE_URL,
  process.env.COZE_SUPABASE_ANON_KEY
);
```

## 推荐配置

### 开发环境（演示、测试）

```bash
# .env.local
NEXT_PUBLIC_APP_NAME=室内设计工作室管理系统
NEXT_PUBLIC_APP_VERSION=1.0.0
# 不配置任何数据库
```

### 本地开发（需要数据库持久化）

```bash
# .env.local
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=studio_db
```

### 生产环境（使用 Supabase）

```bash
# 由 Coze 平台自动注入
COZE_SUPABASE_URL=https://xxx.supabase.co
COZE_SUPABASE_ANON_KEY=xxx
```

## 参考文档

- [环境变量完整指南](./environment-variables.md)
- [数据库写入指南](./database-write-guide.md)
- [Supabase 开通指南](./supabase-setup.md)

## 总结

✅ **无需配置任何数据库**，直接使用即可
✅ **自动降级机制**，数据库不可用时无缝切换到 localStorage
✅ **灵活配置**，支持多种数据库访问方式
✅ **功能完整**，所有功能都能正常使用

**建议**：如果你只是想快速体验系统，无需配置任何数据库，直接使用 localStorage 模式即可！
