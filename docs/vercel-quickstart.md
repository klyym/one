# 🚀 Vercel 部署快速指南

## 快速开始

### 1. 准备环境变量

确保 `.env.local` 文件已配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥
```

### 2. 一键部署

使用部署脚本快速部署到 Vercel：

```bash
cd /workspace/projects
bash scripts/deploy-to-vercel.sh
```

脚本会自动完成：
- ✅ 检查必需工具
- ✅ 检查环境变量
- ✅ 运行构建测试
- ✅ 安装 Vercel CLI（如需要）
- ✅ 部署到 Vercel

### 3. 配置生产环境变量

部署成功后，在 Vercel Dashboard 中配置环境变量：

1. 访问你的项目 → **Settings** → **Environment Variables**
2. 添加以下变量：

| 名称 | 值 |
|------|-----|
| NEXT_PUBLIC_SUPABASE_URL | 你的 Supabase URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 你的 anon key |
| SUPABASE_SERVICE_ROLE_KEY | 你的 service_role key |

3. 选择环境：`Production, Preview, Development`
4. 点击 **Save**
5. 重新部署项目

## 📚 详细文档

- [部署检查清单](./vercel-deployment-checklist.md) - 完整的部署前检查清单
- [环境变量配置指南](./environment-variables-guide.md) - 详细的环境变量配置说明
- [vercel.json](../vercel.json) - Vercel 配置文件
- [.vercelignore](../.vercelignore) - 部署时忽略的文件

## 🎯 手动部署步骤

如果不想使用自动化脚本，可以手动部署：

### 方式一：通过 Vercel 网站

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 **New Project**
4. 选择你的 GitHub 仓库
5. 配置环境变量
6. 点击 **Deploy**

### 方式二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录
vercel login

# 预览部署
vercel

# 生产环境部署
vercel --prod
```

## ✅ 部署后验证

### 1. 检查应用状态

访问部署的 URL，确认页面正常加载。

### 2. 测试数据库连接

```bash
curl https://你的域名/api/debug
```

期望返回：
```json
{
  "success": true,
  "message": "✅ 数据库表结构验证通过"
}
```

### 3. 功能测试

- [ ] 数据看板正常显示
- [ ] 项目管理功能正常
- [ ] 客户管理功能正常
- [ ] 案例展示功能正常
- [ ] 设计师管理功能正常

## 🐛 常见问题

### 构建失败

**症状**：构建过程中报错

**解决方案**：
- 检查 package.json 中的依赖
- 查看构建日志
- 确认 build 脚本配置正确

### 数据库连接失败

**症状**：应用提示数据库连接错误

**解决方案**：
- 检查环境变量是否正确
- 确认 Supabase 项目运行正常
- 验证 RLS 策略配置

### 环境变量未生效

**症状**：本地正常，生产环境报错

**解决方案**：
- 确认 Vercel Dashboard 中已配置环境变量
- 重新部署项目
- 使用 `vercel env ls` 检查配置

## 📞 获取帮助

- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Next.js 文档](https://nextjs.org/docs)

---

**祝你部署顺利！** 🎉
