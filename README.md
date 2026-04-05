# 🚀 室内设计工作室管理系统

专业的室内设计工作室管理平台，用于管理项目、客户、设计师和设计案例。

## 🌐 项目地址

- **GitHub**: https://github.com/klyym/one
- **部署地址**: [待配置]

## ✨ 功能特性

- 📊 **数据看板** - 实时统计项目、客户、营收数据
- 📁 **项目管理** - 阶段化进度管理（平面设计 → SU模型 → 效果图 → 施工图）
- 👥 **客户管理** - 客户信息管理、跟进记录、消费统计
- 🎨 **案例展示** - 多图展示、风格筛选、精选案例
- 👨‍💼 **设计师管理** - 设计师信息、专长风格、项目统计
- ⚙️ **系统设置** - 工作室信息、通知设置、主题配置

## 🛠️ 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Storage**: S3 兼容对象存储

## 📦 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd projects
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥
```

### 4. 初始化数据库

在 Supabase Dashboard SQL Editor 中执行初始化脚本：

```bash
# 查看初始化脚本
cat scripts/init-database.sql
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5000

## 🚀 部署

### 部署到 Vercel（推荐）

#### 快速部署

```bash
# 1. 检查部署准备状态
pnpm check:deploy

# 2. 一键部署到 Vercel
pnpm deploy
```

#### 详细步骤

1. **推送到 GitHub**

```bash
git add .
git commit -m "feat: 准备部署"
git push
```

2. **在 Vercel 上配置**

- 访问 https://vercel.com
- 连接你的 GitHub 仓库
- 配置环境变量（见下方）
- 点击 Deploy

3. **配置环境变量**

在 Vercel Dashboard → Settings → Environment Variables 中添加：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

详细文档请查看：
- [Vercel 快速开始](docs/vercel-quickstart.md)
- [部署检查清单](docs/vercel-deployment-checklist.md)
- [环境变量指南](docs/environment-variables-guide.md)

### 手动部署

```bash
# 构建
pnpm run build

# 启动生产服务器
pnpm start
```

## 📁 项目结构

```
├── src/
│   ├── app/              # 页面路由
│   │   ├── page.tsx      # 数据看板
│   │   ├── projects/     # 项目管理
│   │   ├── clients/      # 客户管理
│   │   ├── cases/        # 案例展示
│   │   ├── designers/    # 设计师管理
│   │   └── settings/     # 系统设置
│   ├── components/       # 组件
│   │   ├── ui/          # shadcn/ui 组件
│   │   └── layout/      # 布局组件
│   ├── storage/         # 数据存储
│   │   └── database/    # 数据库相关
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具库
│   └── types/           # 类型定义
├── docs/               # 文档
├── scripts/            # 脚本
└── public/             # 静态资源
```

## 🔧 开发命令

```bash
# 开发环境
pnpm dev

# 构建
pnpm run build

# 生产环境
pnpm start

# 代码检查
pnpm lint

# 类型检查
pnpm ts-check

# 部署检查
pnpm check:deploy

# 部署到 Vercel
pnpm deploy
```

## 📚 数据库

本项目使用 Supabase 作为数据库。

### 初始化数据库

在 Supabase Dashboard SQL Editor 中执行：

```bash
# 完整初始化脚本
cat scripts/init-database.sql

# 表结构修复脚本
cat scripts/fix-users-table.sql
```

### 数据库表

- `studio_info` - 工作室信息
- `users` - 用户（管理员、设计师）
- `clients` - 客户信息
- `designers` - 设计师信息
- `projects` - 项目信息
- `project_phases` - 项目阶段进度
- `design_cases` - 设计案例
- `follow_ups` - 跟进记录
- `health_check` - 健康检查

详细文档：[AGENTS.md](AGENTS.md)

## 🔐 环境变量

| 变量名 | 说明 | 是否必需 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名公钥 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | ✅ |

详细配置说明：[环境变量指南](docs/environment-variables-guide.md)

## 🐛 故障排查

### 数据库连接失败

1. 检查环境变量是否正确配置
2. 确认 Supabase 项目是否正常运行
3. 验证 RLS 策略配置

### 构建失败

```bash
# 本地测试构建
pnpm run build

# 查看详细错误
pnpm run build 2>&1 | tail -n 50
```

### 部署问题

```bash
# 运行部署前检查
pnpm check:deploy

# 查看部署日志
vercel logs
```

## 📖 文档

- [AGENTS.md](AGENTS.md) - 项目详细说明
- [Vercel 快速开始](docs/vercel-quickstart.md) - 部署指南
- [部署检查清单](docs/vercel-deployment-checklist.md) - 部署前检查
- [环境变量指南](docs/environment-variables-guide.md) - 环境配置
- [部署总结](docs/vercel-deployment-summary.md) - 部署配置说明

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

---

**祝你使用愉快！** 🎉
