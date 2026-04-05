# Vercel 部署前检查清单

## ✅ 部署前必须完成的步骤

### 1. 代码提交到 GitHub
- [ ] 确保所有代码已提交到本地仓库
- [ ] 推送到 GitHub 远程仓库（main 或 master 分支）

```bash
git add .
git commit -m "feat: 准备 Vercel 部署"
git push origin main
```

### 2. Supabase 配置验证
- [ ] 确认 Supabase 项目已创建
- [ ] 确认所有表已创建（9 张表）
- [ ] 确认 users 表的 id 字段已改为 VARCHAR
- [ ] 确认 users 表包含 is_active、avatar、status 字段
- [ ] 确认 RLS 策略已配置（公开读写）

### 3. 环境变量准备
- [ ] 准备 Supabase Project URL
- [ ] 准备 Supabase Anon Key
- [ ] 准备 Supabase Service Role Key

**获取方法**：
1. 登录 Supabase Dashboard
2. 选择你的项目
3. 进入 Settings → API
4. 复制以下信息：
   - Project URL
   - anon public key
   - service_role secret key

### 4. 本地测试
- [ ] 本地开发环境运行正常（`pnpm dev`）
- [ ] 所有功能测试通过
- [ ] 数据库连接正常
- [ ] 图片上传功能正常（如需要）

### 5. 构建测试
- [ ] 本地构建成功（`pnpm run build`）
- [ ] 没有构建错误或警告

```bash
pnpm run build
```

## 🚀 Vercel 部署步骤

### 方式一：通过 Vercel 网站部署

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置环境变量**
   在 "Environment Variables" 部分添加：

   | 名称 | 值 | 类型 |
   |------|-----|------|
   | NEXT_PUBLIC_SUPABASE_URL | 你的 Supabase URL | Plain |
   | NEXT_PUBLIC_SUPABASE_ANON_KEY | 你的 anon key | Plain |
   | SUPABASE_SERVICE_ROLE_KEY | 你的 service_role key | Secret |

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成（约 2-3 分钟）
   - 部署成功后会获得一个预览链接

5. **生产环境部署**
   - 如果预览版本正常，点击 "Promote to Production"
   - 获得正式生产域名

### 方式二：使用 Vercel CLI 部署

```bash
# 1. 安装 Vercel CLI
pnpm add -g vercel

# 2. 登录
vercel login

# 3. 预览部署
cd /workspace/projects
vercel

# 4. 生产环境部署
vercel --prod

# 5. 配置环境变量（如果需要）
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## 🔧 部署后验证

### 1. 检查应用状态
- [ ] 访问部署的 URL
- [ ] 页面正常加载
- [ ] 没有错误提示

### 2. 测试数据库连接
- [ ] 访问 `/api/debug` 接口
- [ ] 检查返回的数据库连接状态

```bash
curl https://你的域名/api/debug
```

### 3. 功能测试
- [ ] 数据看板正常显示
- [ ] 项目管理功能正常
- [ ] 客户管理功能正常
- [ ] 案例展示功能正常
- [ ] 设计师管理功能正常

### 4. 环境变量验证
- [ ] 检查 Vercel Dashboard 中的环境变量
- [ ] 确认所有变量都已配置

## 📊 常见问题排查

### 问题 1：构建失败
**症状**：构建过程中报错
**解决**：
- 检查 package.json 中的依赖是否完整
- 确认 build 脚本配置正确
- 查看 Vercel 构建日志

### 问题 2：数据库连接失败
**症状**：应用提示数据库连接错误
**解决**：
- 检查环境变量是否正确配置
- 确认 Supabase 项目正常运行
- 验证 RLS 策略配置

### 问题 3：图片上传失败
**症状**：上传图片时报错
**解决**：
- 检查对象存储配置
- 确认 bucket 权限设置正确
- 验证 CORS 配置

### 问题 4：页面 404
**症状**：访问某些页面返回 404
**解决**：
- 检查路由配置
- 确认页面文件存在于正确的目录
- 查看构建日志中的静态生成警告

## 🎯 部署成功标志

当你看到以下情况，说明部署成功：

✅ Vercel Dashboard 显示 "Ready" 状态
✅ 可以访问你的应用 URL
✅ 数据库连接正常
✅ 所有功能正常工作
✅ 没有控制台错误

## 📝 后续维护

### 自动部署
- 每次推送到 `main` 分支，Vercel 会自动部署
- Pull Request 会生成预览链接

### 环境变量更新
```bash
# 通过 Vercel CLI
vercel env rm NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

### 域名配置
- 在 Vercel Dashboard → Settings → Domains
- 添加自定义域名
- 配置 DNS 记录

---

## 🎉 准备好了吗？

按照以上清单逐项检查，完成后就可以开始部署了！

**祝你部署顺利！** 🚀
