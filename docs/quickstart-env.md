# 环境变量快速开始指南

## 快速配置

### 1. 本地开发（推荐 - 无需数据库）

直接启动项目，系统会自动使用 localStorage 模式：

```bash
pnpm install
pnpm dev
```

✅ **特点**：
- 无需配置任何数据库
- 所有功能正常使用
- 数据保存在浏览器本地

### 2. 本地开发（使用数据库）

如果你需要本地数据库支持，请按照以下步骤：

#### 步骤 1：创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目
3. 进入 Settings > API
4. 复制 Project URL 和 anon public key

#### 步骤 2：配置环境变量

编辑 `.env.local` 文件：

```bash
COZE_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 步骤 3：重启服务

```bash
# 停止服务
Ctrl + C

# 重新启动
pnpm dev
```

### 3. Coze 平台开发环境

在 Coze 平台中，环境变量会自动注入：

- ✅ 开通 Supabase 服务后，环境变量自动配置
- ✅ 无需手动配置
- ✅ 系统自动检测并使用数据库

### 4. 生产环境

生产环境的环境变量由 Coze 平台管理：

- ✅ 环境变量自动注入
- ✅ 无需手动配置
- ✅ 支持数据库持久化

## 环境变量文件说明

| 文件 | 用途 | 是否提交 Git |
|------|------|--------------|
| `.env.example` | 环境变量示例模板 | ✅ 是 |
| `.env.local` | 本地开发配置 | ❌ 否 |

## 检查当前配置

### 查看应用是否使用数据库

打开浏览器控制台，查看日志：

- ✅ `数据库初始化成功` → 数据库已连接
- ⚠️ `数据库初始化失败，使用本地存储` → 降级到 localStorage

### 测试环境变量

访问：`http://localhost:5000/api/debug`（如果创建了该接口）

## 常见问题

### Q: 修改 .env.local 后没有生效？

**A**: 重启开发服务器：

```bash
Ctrl + C
pnpm dev
```

### Q: 如何知道是否使用了数据库？

**A**: 打开浏览器控制台（F12），查看日志：

```
✅ 数据库初始化成功
✅ 工作室信息已从数据库加载
```

或者：

```
⚠️ 数据库初始化失败，使用本地存储
```

### Q: 可以在生产环境使用 localStorage 吗？

**A**: 可以。系统会自动检测数据库可用性，如果不可用则降级到 localStorage。

### Q: 如何获取 Supabase 凭证？

**A**: 参考详细文档：`docs/supabase-setup.md`

## 详细文档

- [环境变量完整指南](./environment-variables.md)
- [Supabase 开通指南](./supabase-setup.md)
- [数据库同步说明](./database-sync.md)

## 支持与帮助

如遇到问题，请：

1. 检查浏览器控制台日志
2. 查看 `docs/` 目录下的详细文档
3. 确认环境变量配置正确
4. 重启开发服务器

---

**提示**：如果只是想快速体验系统，无需配置任何环境变量，直接使用默认的 localStorage 模式即可！
