# 数据库写入配置说明

## 当前状态

### ✅ 数据库已就绪
通过检查，数据库状态如下：

- **数据库类型**: PostgreSQL 17.5
- **连接状态**: ✅ 正常
- **表结构**: ✅ 完整（已创建 9 张表）
- **数据写入**: ✅ 支持（通过 exec_sql 工具）

### 📊 已存在的数据库表

```
├── studio_info        # 工作室基本信息
├── users              # 用户（管理员、设计师）
├── clients            # 客户信息
├── designers          # 设计师信息
├── projects           # 项目信息
├── project_phases     # 项目阶段进度
├── design_cases       # 设计案例
├── follow_ups         # 跟进记录
└── health_check       # 系统健康检查
```

### ⚠️ 当前问题

**环境变量未配置**，导致 Next.js 应用无法连接到数据库：

```bash
# 缺少的环境变量
COZE_SUPABASE_URL=
COZE_SUPABASE_ANON_KEY=
COZE_SUPABASE_SERVICE_ROLE_KEY=
```

**结果**：
- ✅ 数据库可用（通过 exec_sql 工具）
- ❌ 应用无法连接（缺少环境变量）
- ⚠️ 系统降级到 localStorage 模式

## 解决方案

### 方案 1：开通 Supabase 集成（推荐）

在 Coze 平台上开通 Supabase 服务，环境变量会自动注入。

**步骤**：
1. 登录 Coze 平台
2. 进入项目设置 → 集成
3. 找到 **Supabase** 并点击"开通"
4. 等待开通完成（几分钟）
5. 重启项目

**优点**：
- ✅ 环境变量自动注入
- ✅ 无需手动配置
- ✅ 生产环境自动同步

### 方案 2：手动配置环境变量

如果已知 Supabase 的连接信息，可以手动配置：

**步骤**：
1. 编辑 `.env.local` 文件
2. 填写 Supabase 凭证
3. 重启开发服务器

**配置示例**：
```bash
# .env.local
COZE_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
COZE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 方案 3：使用 exec_sql 工具直接操作（临时方案）

在当前环境中，可以使用 `exec_sql` 工具直接操作数据库：

**示例**：
```typescript
// 插入工作室信息
exec_sql({
  sql: `INSERT INTO studio_info (name, address, phone, email) VALUES ($1, $2, $3, $4)`,
  env: 'develop'
});
```

## 数据写入示例

### 1. 初始化工作室信息

```sql
INSERT INTO studio_info (name, address, phone, email, website, description)
VALUES (
  '我的设计工作室',
  '北京市朝阳区xxx',
  '010-12345678',
  'contact@studio.com',
  'https://studio.com',
  '专业的室内设计工作室'
);
```

### 2. 创建用户

```sql
INSERT INTO users (email, name, role, password_hash, phone, created_at, updated_at)
VALUES (
  'admin@studio.com',
  '管理员',
  'admin',
  'hashed_password_here',
  '13800138000',
  NOW(),
  NOW()
);
```

### 3. 创建客户

```sql
INSERT INTO clients (name, phone, email, company, address, created_at, updated_at)
VALUES (
  '张三',
  '13800138001',
  'zhangsan@example.com',
  '某某公司',
  '上海市浦东新区xxx',
  NOW(),
  NOW()
);
```

## 验证数据库写入

### 方法 1：使用测试接口

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

**失败响应**：
```json
{
  "success": false,
  "message": "数据库连接失败",
  "error": "Supabase 环境变量未配置",
  "suggestion": "请检查 Supabase 环境变量配置"
}
```

### 方法 2：查看应用日志

打开浏览器控制台（F12），查看日志：

- ✅ `数据库初始化成功` → 数据库已连接
- ⚠️ `数据库初始化失败，使用本地存储` → 降级到 localStorage

## 环境变量 vs 直接数据库访问

| 方式 | 用途 | 适用场景 |
|------|------|----------|
| **环境变量** | Next.js 应用连接 | 应用运行时数据读写 |
| **exec_sql 工具** | 直接数据库操作 | 数据初始化、调试、维护 |

### 使用建议

1. **应用运行时**：
   - 配置环境变量
   - 使用 Supabase SDK 进行数据读写
   - 支持自动降级到 localStorage

2. **数据初始化**：
   - 使用 exec_sql 工具
   - 执行数据迁移脚本
   - 创建初始数据

3. **调试和维护**：
   - 使用 exec_sql 工具直接查询
   - 检查数据一致性
   - 执行修复操作

## Coze 数据库说明

### "扣子数据库"指的是什么？

在 Coze 平台中，"数据库"是通过集成第三方服务实现的：

1. **Supabase**（当前使用）：
   - PostgreSQL 数据库
   - 通过 Coze 集成提供
   - 环境变量自动注入

2. **其他数据库服务**：
   - Coze 平台支持集成其他数据库服务
   - 需要手动配置

### 当前架构

```
Coze 平台
  ↓ 集成
Supabase 服务
  ↓ PostgreSQL 数据库
应用数据（项目、客户、设计师、案例等）
```

### 数据存储位置

- **生产环境**：Coze 提供的 Supabase 实例（云端）
- **开发环境**：当前可用的 Supabase 数据库（云端）
- **降级模式**：浏览器 localStorage（本地）

## 快速测试

### 测试数据库写入（使用 exec_sql）

```sql
-- 测试写入
INSERT INTO studio_info (name, address, phone, email)
VALUES ('测试工作室', '测试地址', '1234567890', 'test@example.com')
ON CONFLICT DO NOTHING;

-- 查询结果
SELECT * FROM studio_info;
```

### 测试应用连接

访问：`http://localhost:5000/api/debug`

## 总结

### ✅ 当前可以做的

1. **直接操作数据库**：
   - 使用 exec_sql 工具
   - 执行任意 SQL 操作
   - 数据可以成功写入

2. **应用数据管理**：
   - 配置环境变量后应用可连接
   - 支持 CRUD 操作
   - 自动降级到 localStorage

### 🔄 需要配置的

1. **开通 Supabase 集成**：
   - 在 Coze 平台开通服务
   - 环境变量自动注入
   - 应用自动连接

2. **或手动配置环境变量**：
   - 填写 Supabase 凭证
   - 重启服务生效

### 📝 下一步建议

1. **短期**：使用 exec_sql 工具初始化数据
2. **中期**：在 Coze 平台开通 Supabase 集成
3. **长期**：配置完整的环境变量体系

## 参考文档

- [Supabase 开通指南](./supabase-setup.md)
- [环境变量配置指南](./environment-variables.md)
- [数据库同步说明](./database-sync.md)
