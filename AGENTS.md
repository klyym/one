# 室内设计工作室管理系统

## 项目概述
这是一个专业的室内设计工作室管理平台，用于管理项目、客户、设计师和设计案例。系统采用前后端分离架构，使用 React Context 进行状态管理。

## 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **图表库**: Recharts (数据可视化)
- **状态管理**: React Context API

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
│   │   ├── cases/          # 案例展示页面
│   │   ├── designers/      # 设计师管理页面
│   │   └── settings/       # 系统设置页面
│   ├── components/         # 组件
│   │   ├── ui/             # Shadcn UI 组件库
│   │   └── layout/         # 布局组件
│   │       ├── sidebar.tsx # 侧边栏导航
│   │       └── main-layout.tsx # 主布局
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── utils.ts        # 通用工具函数 (cn)
│   │   └── store.tsx       # 状态管理 Context
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
- 最近更新项目列表（显示当前阶段和总体进度）

### 2. 项目管理 (Projects)
- 项目列表展示（支持搜索和状态筛选）
- 项目创建与编辑（Dialog 表单）
- 项目删除
- 显示项目详细信息：客户、设计师、预算、风格等
- **阶段化进度管理**：
  - 五个设计阶段：平面设计 → SU模型推敲 → 效果图 → 施工图 → 设计完成
  - 支持展开查看每个阶段的详细进度
  - 自动计算总体进度百分比
  - 显示当前所在阶段

### 3. 客户管理 (Clients)
- 客户卡片展示（网格布局）
- 客户信息管理（创建、编辑、删除）
- 显示客户合作项目数、累计消费
- 最近项目关联显示

### 4. 案例展示 (Cases)
- 案例卡片展示（图片网格）
- 案例详情弹窗（多图展示）
- 风格筛选功能
- 浏览量、点赞数统计
- 精选案例标记

### 5. 设计师管理 (Designers)
- 设计师卡片展示
- 显示专长风格、评分、项目统计
- 联系方式展示
- 最近项目关联（显示当前阶段）
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
- **阶段化进度**：
  - phases: 阶段进度数组（PhaseProgress[]）
  - currentPhase: 当前阶段（平面设计 | SU模型推敲 | 效果图 | 施工图 | 设计完成）
  - overallProgress: 总体进度百分比（自动计算）
- 时间信息：开始日期、结束日期、创建/更新时间

### PhaseProgress（阶段进度）
- phase: 阶段名称
- status: 阶段状态（pending | in_progress | completed）
- progress: 该阶段内进度（0-100）
- startDate/endDate: 阶段起止时间
- notes: 阶段备注

### Client（客户）
- 联系信息：姓名、电话、邮箱、地址
- 公司信息：公司名称
- 统计数据：项目数、累计消费
- 备注：自定义备注信息

### Designer（设计师）
- 基本信息：姓名、职位、联系方式
- 专业信息：擅长风格、评分、项目统计
- 个人简介

### DesignCase（设计案例）
- 案例信息：名称、风格、面积、地址
- 多媒体：图片数组（支持多图上传）
- 统计数据：浏览量、点赞数
- 标签系统：多个标签
- 精选标记

## API 接口

### 图片上传接口
- 路径：`POST /api/cases/upload`
- 功能：上传案例图片到对象存储
- 支持：JPG、PNG、GIF、WebP 格式，单文件最大 10MB
- 返回：图片 key 和签名 URL（有效期 30 天）
- 使用：S3Storage 对象存储服务

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
- 使用 Tailwind CSS 进行样式编写
- 支持 dark mode（通过 next-themes）
- 响应式设计：移动端优先

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


