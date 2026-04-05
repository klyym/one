# 室内设计工作室管理系统 - 数据库文档

## 概述

本项目使用 Supabase (PostgreSQL) 作为数据库后端，通过 Supabase SDK 进行数据访问。

## 数据库表结构

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| studio_info | 工作室基本信息 | name, address, phone, email |
| users | 用户（管理员、设计师） | email, name, role, password_hash |
| clients | 客户信息 | name, phone, email, address, company_name |
| designers | 设计师信息 | name, position, phone, specialties, rating, project_count |
| projects | 项目信息 | name, client_id, designer_id, status, priority, budget, area, style |
| project_phases | 项目阶段进度 | project_id, phase_name, status, progress |
| design_cases | 设计案例 | name, style, area, images, tags, is_featured |
| follow_ups | 跟进记录 | client_id, type, content, next_plan, next_date |

## 快速开始

### 1. 数据库客户端

数据库客户端已自动配置在 `src/storage/database/supabase-client.ts`。

使用示例：

```typescript
import { getSupabaseClient } from '@/storage/database/supabase-client';

const client = getSupabaseClient();
```

### 2. 数据库服务层

所有数据库操作通过 `src/storage/database/services.ts` 中的服务方法进行。

```typescript
import {
  userService,
  projectService,
  clientService,
  designerService
} from '@/storage/database/services';

// 查询所有用户
const users = await userService.getAll();

// 根据ID查询用户
const user = await userService.getById('user-id');

// 创建用户
const newUser = await userService.create({
  email: 'user@example.com',
  name: 'User Name',
  role: 'designer',
  password_hash: 'hashed_password'
});

// 更新用户
await userService.update('user-id', { name: 'New Name' });

// 删除用户
await userService.delete('user-id');
```

### 3. 数据库初始化

应用启动时会自动初始化默认数据：

```typescript
import { initAppDatabase } from '@/storage/database/init';
await initAppDatabase();
```

默认初始化数据：
- 工作室基本信息
- 默认用户账号
  - admin@studio.com (管理员)
  - chen@studio.com (设计师)

## Schema 修改流程

如果需要修改数据库表结构：

```bash
# 1. 同步数据库模型
coze-coding-ai db generate-models

# 2. 修改 schema.ts
# 编辑 src/storage/database/shared/schema.ts

# 3. 同步到数据库
coze-coding-ai db upgrade

# 4. 如果需要，配置 RLS 策略
```

## 注意事项

1. **字段命名**: 所有数据库字段名使用 `snake_case`（如 `created_at`）
2. **错误处理**: 所有数据库操作都返回 `{ data, error }`，必须检查 error
3. **RLS 策略**: 所有表都已配置 RLS（公开读写），权限控制在应用层
4. **更新/删除**: 所有 `.update()` 和 `.delete()` 操作必须带 filter 条件
5. **分页查询**: Supabase 默认最多返回 1000 行，大量数据需要分页

## 默认账号

| 邮箱 | 角色 | 密码 |
|------|------|------|
| admin@studio.com | 管理员 | admin123 |
| chen@studio.com | 设计师 | 123456 |

> 注意：密码在生产环境中应该使用 bcrypt 等库进行哈希处理
