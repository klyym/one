# 室内设计工作室管理系统

## 项目概述
这是一个专业的室内设计工作室管理平台，用于管理项目、客户、设计师。系统采用前后端分离架构，使用 React Context 进行状态管理。

## 版本技术栈

- **Framework**: Next.js 15.1.4 (App Router)
- **Core**: React 19.2.3
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 3.4.19 + PostCSS 8
- **图表库**: Recharts 2.15.4 (数据可视化)
- **状态管理**: React Context API
- **数据库**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM (Schema定义)
- **数据访问**: Supabase SDK

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── page.tsx        # 数据看板（首页）
│   │   ├── projects/       # 项目管理页面
│   │   ├── clients/        # 客户管理页面
│   │   ├── designers/      # 设计师管理页面
│   │   └── settings/       # 系统设置页面
│   ├── components/         # 组件
│   │   ├── ui/             # Shadcn UI 组件库
│   │   └── layout/         # 布局组件
│   │       ├── sidebar.tsx # 侧边栏导航
│   │       └── main-layout.tsx # 主布局
│   ├── storage/            # 数据存储
│   │   └── database/       # 数据库相关
│   │       ├── shared/
│   │       │   └── schema.ts    # Drizzle Schema 定义
│   │       ├── supabase-client.ts # Supabase 客户端
│   │       ├── services.ts       # 数据库服务层
│   │       └── init.ts          # 数据库初始化
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── utils.ts        # 通用工具函数 (cn)
│   │   ├── store.tsx       # 应用状态管理 Context
│   │   ├── auth.tsx        # 用户认证 Context
│   │   └── studio.tsx      # 工作室信息 Context
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 数据类型定义
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 核心功能模块

### 1. 数据看板 (Dashboard)
- 统计卡片：总项目数、客户数量、总营收、即将到期项目
- 项目状态分布图（饼图）
- 设计风格分布图（柱状图）
- 最近更新项目列表（显示总体进度）

### 2. 设计跟进 (Projects /projects)
- 设计阶段项目（stage=design）列表展示（支持搜索和状态筛选）
- 项目创建与编辑（Dialog 表单，含客户快捷新建、造价、阶段切换）
- 项目删除
- 显示项目详细信息：客户、设计师、预算、风格等
- **项目跟进记录**：
  - 自由输入跟进内容（日期 + 文本），如「8月21号方案讨论，修改了玄关柜尺寸」
  - 支持在项目表单中添加、删除跟进记录
  - 展开项目卡片可查看跟进时间线（按日期倒序）
  - 总体进度百分比手动维护（0-100）
- **转入施工**：卡片操作可将项目 stage 改为 construction，进入工程管理

### 3. 工程管理 (Construction /construction)
- 施工阶段项目（stage=construction）列表展示
- 顶部统计：施工中项目、已完工、合同总额、实际成本
- 施工跟进记录（自由输入，日期 + 内容）
- **标记完工**：卡片操作将项目状态改为 completed、进度置 100%
- 支持搜索、状态筛选、新建/编辑/删除项目

### 4. 客户管理 (Clients)
- 客户卡片展示（网格布局）
- 客户信息管理（创建、编辑、删除）
- 显示客户合作项目数、累计消费
- 最近项目关联显示
- **客户跟进功能**：
  - 添加跟进记录（电话、上门、邮件、微信、其他）
  - 记录跟进内容和下一步计划
  - 设置下次跟进日期
  - 自动更新客户最后联系时间
  - 跟进记录列表展示和删除

### 5. 设计师管理 (Designers)
- 设计师卡片展示
- 显示专长风格、评分、项目统计
- 联系方式展示
- 最近项目关联（显示最新跟进时间）
- 新增设计师（姓名、职位、擅长风格、联系方式、评分、简介）
- 编辑和删除设计师

### 6. 系统设置 (Settings)
- 工作室基本信息配置
- 通知设置
- 安全设置
- 主题设置

## 数据模型

### Project（项目）
- 基本信息：名称、客户、设计师、状态、优先级
- 项目详情：预算、面积、地址、风格
- **跟进记录**：
  - updates: 自由跟进记录数组（ProjectUpdate[]，日期 + 内容）
  - overallProgress: 总体进度百分比（手动维护 0-100）
- 时间信息：开始日期、结束日期、创建/更新时间

### ProjectUpdate（项目跟进记录）
- date: 跟进日期（自由选择）
- content: 跟进内容（自由输入，如方案讨论、修改项等）

### Client（客户）
- 联系信息：姓名、电话、邮箱、地址
- 公司信息：公司名称
- 统计数据：项目数、累计消费
- 备注：自定义备注信息

### FollowUp（跟进记录）
- 基本信息：客户ID、跟进类型、跟进内容
- 跟进类型：电话（call）、上门（visit）、邮件（email）、微信（wechat）、其他（other）
- 后续计划：下一步计划、下次跟进日期
- 跟进人：关联设计师
- 时间信息：创建时间

### Designer（设计师）
- 基本信息：姓名、职位、联系方式
- 专业信息：擅长风格、评分、项目统计
- 个人简介

## 数据库

### 数据库技术栈
- **数据库**: PostgreSQL (通过 Supabase)
- **Schema 管理**: Drizzle ORM
- **数据访问**: Supabase SDK (HTTP/PostgREST)
- **访问控制**: RLS (Row Level Security)

### 数据库表结构

#### 核心表
1. **studio_info** - 工作室基本信息
2. **users** - 用户（管理员、设计师）
3. **clients** - 客户信息
4. **designers** - 设计师信息
5. **projects** - 项目信息
6. **follow_ups** - 跟进记录

### 数据库使用规范

#### Schema 修改流程
```bash
# 1. 同步数据库模型
coze-coding-ai db generate-models

# 2. 修改 schema.ts
# 编辑 src/storage/database/shared/schema.ts

# 3. 同步到数据库
coze-coding-ai db upgrade

# 4. 配置 RLS 策略
# 使用 exec_sql 工具执行 RLS SQL
```

#### 数据库服务层
所有数据库操作通过 `src/storage/database/services.ts` 中的服务方法进行：

```typescript
import { userService, projectService, clientService } from '@/storage/database/services';

// 查询
const users = await userService.getAll();
const user = await userService.getById('user-id');

// 创建
const newUser = await userService.create({
  email: 'user@example.com',
  name: 'User Name',
  role: 'designer',
  password_hash: 'hashed_password'
});

// 更新
await userService.update('user-id', { name: 'New Name' });

// 删除
await userService.delete('user-id');
```

#### RLS 策略
- 项目不使用 Supabase Auth，所有表使用场景 A（公开读写）
- 权限控制在应用层实现
- 禁止在数据库层依赖 auth.uid() 和 auth.role()

#### 注意事项
- 🔴 数据操作使用 Supabase SDK（`client.from()`），不用 Drizzle ORM 语法
- 🔴 字段名使用 snake_case（如 `created_at`），禁止 camelCase
- 每次调用都检查了 `{ data, error }` 并 throw
- 新建表已执行 `db upgrade` 并配置了 RLS
- `.delete()` / `.update()` 都带了 filter
- 不要删除或修改 Supabase 内置 schema（`auth`、`storage`、`realtime`、`extensions`）

### 数据库初始化
应用启动时会自动初始化数据库数据：
- 工作室基本信息
- 默认用户账号（admin@studio.com, chen@studio.com）

如需手动初始化：
```typescript
import { initAppDatabase } from '@/storage/database/init';
await initAppDatabase();
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

常用命令：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 状态管理
- 使用 React Context API 进行全局状态管理
- 状态存储在 `src/lib/store.tsx` 中
- 通过 `useStore()` Hook 访问状态和操作方法

### 组件规范
- 所有页面组件必须使用 `'use client'` 指令（因为使用了 Context）
- 使用 shadcn/ui 组件库构建界面
- 遵循 TypeScript 严格类型检查

### 样式规范
- 使用 Tailwind CSS v3.4.19 进行样式编写
- 配置文件：`tailwind.config.js` 和 `postcss.config.js`
- 支持 dark mode（通过 next-themes）
- 响应式设计：移动端优先
- 注意：避免使用 Tailwind v4 特有的语法，如 `var(--spacing(x))` 等

### Hydration 错误预防
严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。

## UI 设计与组件规范

- 模板默认预装核心组件库 `shadcn/ui`，位于 `src/components/ui/` 目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范
- 使用 Card、Button、Badge、Dialog 等组件构建界面
- 图表使用 Recharts 库

## 端口配置

- 开发环境端口：5000
- 通过 `coze dev` 命令启动开发服务器
- 支持热更新（HMR）


