# Vercel 部署配置总结

## 📦 部署相关文件

本项目已配置完整的 Vercel 部署支持，包含以下文件：

### 核心配置文件

| 文件 | 说明 |
|------|------|
| `vercel.json` | Vercel 配置文件，定义构建命令、输出目录、环境变量等 |
| `.vercelignore` | 指定部署时忽略的文件和目录 |
| `package.json` | 包含部署相关的 npm 脚本 |

### 部署脚本

| 脚本 | 说明 | 使用方法 |
|------|------|----------|
| `scripts/check-deploy-ready.sh` | 部署前状态检查脚本 | `pnpm check:deploy` |
| `scripts/deploy-to-vercel.sh` | 一键部署到 Vercel 脚本 | `pnpm deploy` |

### 文档

| 文档 | 说明 |
|------|------|
| `docs/vercel-quickstart.md` | 快速开始指南 |
| `docs/vercel-deployment-checklist.md` | 完整的部署检查清单 |
| `docs/environment-variables-guide.md` | 环境变量配置指南 |

## 🚀 快速部署命令

### 1. 检查部署准备状态

```bash
pnpm check:deploy
```

这个脚本会检查：
- ✅ Node.js、pnpm、Git 等必需工具
- ✅ 配置文件完整性
- ✅ 环境变量配置
- ✅ 构建是否成功

### 2. 一键部署到 Vercel

```bash
pnpm deploy
```

这个脚本会自动：
- ✅ 检查环境
- ✅ 运行构建测试
- ✅ 安装 Vercel CLI（如需要）
- ✅ 部署到 Vercel

### 3. 直接使用 Vercel CLI

```bash
# 预览部署
vercel

# 生产环境部署
vercel --prod

# 或使用 npm 脚本
pnpm deploy:preview
pnpm deploy:prod
```

## 📋 vercel.json 配置说明

```json
{
  "buildCommand": "pnpm install && pnpm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["hkg1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

### 配置项说明

- **buildCommand**: 构建命令
- **outputDirectory**: 构建输出目录
- **framework**: 框架类型（Next.js）
- **regions**: 部署区域（hkg1 = 香港）
- **env**: 环境变量引用

## 🔐 环境变量配置

### 本地开发

在 `.env.local` 文件中配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥
```

### Vercel 生产环境

在 Vercel Dashboard 中配置：

1. 进入 **Settings** → **Environment Variables**
2. 添加以下变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. 选择环境：`Production, Preview, Development`
4. 点击 **Save**
5. 重新部署

## ✅ 部署流程

### 标准部署流程

```
1. 开发完成
   ↓
2. pnpm check:deploy   (检查部署准备状态)
   ↓
3. git add . && git commit -m "feat: 准备部署"
   ↓
4. git push
   ↓
5. pnpm deploy         (部署到 Vercel)
   ↓
6. 在 Vercel Dashboard 配置环境变量
   ↓
7. 重新部署
   ↓
8. 测试验证
```

### 自动部署流程（推荐）

1. 推送到 `main` 分支
2. Vercel 自动触发部署
3. 部署完成，获得预览链接
4. 测试通过后，点击 "Promote to Production"

## 📊 部署验证清单

部署完成后，请验证以下项目：

### 应用状态
- [ ] 访问部署 URL，页面正常加载
- [ ] 浏览器控制台无错误
- [ ] 所有页面可以正常访问

### 功能测试
- [ ] 数据看板显示正常
- [ ] 项目管理功能正常
- [ ] 客户管理功能正常
- [ ] 案例展示功能正常
- [ ] 设计师管理功能正常
- [ ] 跟进记录功能正常

### 数据库连接
- [ ] 访问 `/api/debug` 接口，返回成功
- [ ] 数据可以正常读写
- [ ] 图片上传功能正常（如需要）

### 环境变量
- [ ] Vercel Dashboard 中已配置所有环境变量
- [ ] 环境变量应用到正确的环境

## 🐛 故障排查

### 问题：构建失败

**检查项**：
1. 查看构建日志
2. 确认依赖是否完整
3. 检查 build 脚本配置

**解决方法**：
```bash
# 本地测试构建
pnpm run build

# 查看详细错误
pnpm run build 2>&1 | tail -n 50
```

### 问题：环境变量未生效

**检查项**：
1. Vercel Dashboard 中是否已配置
2. 环境变量名称是否正确
3. 是否选择了正确的环境

**解决方法**：
```bash
# 查看已配置的环境变量
vercel env ls

# 重新部署以应用新变量
vercel --prod
```

### 问题：数据库连接失败

**检查项**：
1. 环境变量是否正确
2. Supabase 项目是否正常运行
3. RLS 策略是否配置

**解决方法**：
```bash
# 测试数据库连接
curl https://你的域名/api/debug
```

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Supabase 文档](https://supabase.com/docs)

## 🎯 总结

本项目已完全配置好 Vercel 部署支持，你可以：

1. **快速部署**：使用 `pnpm deploy` 一键部署
2. **自动部署**：推送到 GitHub 后自动部署
3. **灵活配置**：通过 `vercel.json` 自定义配置
4. **完整文档**：详细的部署指南和故障排查

**现在就可以开始部署了！** 🚀
