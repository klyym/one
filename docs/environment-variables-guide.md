# 环境变量配置指南

## 📋 必需的环境变量

本项目需要配置以下 3 个环境变量才能正常运行：

| 变量名 | 说明 | 是否必需 | 示例 |
|--------|------|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ 必需 | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名公钥 | ✅ 必需 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | ✅ 必需 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 🔑 如何获取 Supabase 凭证

### 步骤 1：登录 Supabase Dashboard

1. 访问 https://supabase.com/dashboard
2. 使用你的账号登录

### 步骤 2：选择项目

1. 在 Dashboard 中选择你的项目
2. 如果还没有项目，先创建一个新项目

### 步骤 3：获取 API 凭证

1. 点击左侧菜单的 **Settings**
2. 选择 **API** 选项卡
3. 在 **Project API keys** 部分找到以下信息：

#### a) Project URL
- 在 **Project URL** 字段中显示
- 示例：`https://abcdefghijklmnop.supabase.co`

#### b) anon public key
- 在 **Project API keys** 部分找到 `anon` key
- 点击 "Show" 按钮查看完整密钥
- 示例：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### c) service_role secret key
- 在 **Project API keys** 部分找到 `service_role` key
- ⚠️ 这是敏感密钥，**不要泄露**！
- 点击 "Show" 按钮查看完整密钥
- 示例：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ⚙️ 配置环境变量

### 本地开发环境

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥
```

**重要**：
- `NEXT_PUBLIC_` 前缀的变量会被暴露到客户端
- 没有 `NEXT_PUBLIC_` 前缀的变量只在服务端可用
- **不要将 `.env.local` 提交到 Git**

### Vercel 生产环境

#### 方式一：通过 Vercel Dashboard

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 点击 "Add New" 添加每个环境变量：

| Name | Value | Environment |
|------|-------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | 你的 Supabase URL | Production, Preview, Development |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 你的 anon key | Production, Preview, Development |
| SUPABASE_SERVICE_ROLE_KEY | 你的 service_role key | Production, Preview, Development |

5. 点击 "Save"
6. 重新部署项目以应用新的环境变量

#### 方式二：通过 Vercel CLI

```bash
# 登录 Vercel
vercel login

# 添加环境变量（会提示选择环境）
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 输入值，选择环境（Production, Preview, Development）

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 输入值，选择环境

vercel env add SUPABASE_SERVICE_ROLE_KEY
# 输入值，选择环境

# 查看已配置的环境变量
vercel env ls

# 重新部署以应用新变量
vercel --prod
```

### 其他部署平台

#### Netlify
在 **Site settings** → **Build & deploy** → **Environment variables** 中添加

#### Docker
在 `docker-compose.yml` 或 `Dockerfile` 中配置：
```yaml
environment:
  - NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
  - SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥
```

## 🔒 安全注意事项

### 1. Service Role Key 保护

⚠️ **`SUPABASE_SERVICE_ROLE_KEY` 是敏感信息，必须严格保护！**

- **不要**提交到 Git 仓库
- **不要**在客户端代码中使用
- **不要**在前端 JavaScript 中引用
- **不要**在公共文档中暴露
- 仅在服务端 API Routes 中使用

### 2. Anon Key 使用

`NEXT_PUBLIC_SUPABASE_ANON_KEY` 可以安全地暴露到客户端，但需要配合 RLS 策略使用。

### 3. 环境区分

确保不同环境使用不同的 Supabase 项目：
- **开发环境**：使用开发数据库
- **生产环境**：使用生产数据库
- **测试环境**：使用测试数据库

### 4. 定期轮换密钥

建议定期（每 3-6 个月）更新 API 密钥：
1. 在 Supabase Dashboard 中重新生成密钥
2. 更新所有环境中的环境变量
3. 重新部署应用

## ✅ 验证配置

### 本地验证

```bash
# 启动开发服务器
pnpm dev

# 访问调试接口
curl http://localhost:5000/api/debug
```

期望返回：
```json
{
  "success": true,
  "message": "✅ 数据库表结构验证通过"
}
```

### 生产环境验证

```bash
# 测试生产环境接口
curl https://你的域名/api/debug
```

## 🐛 常见问题

### 问题 1：环境变量未生效

**症状**：应用提示 "Invalid API key" 或数据库连接失败

**解决方案**：
1. 确认环境变量名称拼写正确（区分大小写）
2. 检查是否有多余的空格或引号
3. 重新部署项目以应用新配置
4. 清除浏览器缓存

### 问题 2：开发环境正常，生产环境报错

**症状**：本地运行正常，Vercel 部署后报错

**解决方案**：
1. 检查 Vercel Dashboard 中的环境变量是否配置
2. 确认环境变量应用到了正确的环境（Production）
3. 查看部署日志中的错误信息
4. 使用 `vercel env ls` 检查配置

### 问题 3：Service Role Key 泄露

**症状**：发现密钥在代码仓库或日志中暴露

**解决方案**：
1. 立即在 Supabase Dashboard 中重新生成密钥
2. 更新所有环境中的环境变量
3. 重新部署应用
4. 检查是否有其他泄露途径

## 📚 相关文档

- [Supabase 环境变量文档](https://supabase.com/docs/guides/getting-started/start/quickstart)
- [Vercel 环境变量文档](https://vercel.com/docs/projects/environment-variables)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)

---

**配置完成后，记得测试所有功能是否正常！** 🚀
