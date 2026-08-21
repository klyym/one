// 项目状态
export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold';

// 项目优先级
export type ProjectPriority = 'low' | 'medium' | 'high';

// 项目阶段：设计 / 施工
export type ProjectStage = 'design' | 'construction';

// 项目跟进记录（自由输入：日期 + 内容）
export interface ProjectUpdate {
  id: string;
  date: string; // 跟进日期
  content: string; // 跟进内容，自由输入
}

// 项目类型
export interface Project {
  id: string;
  name: string;
  clientId: string;
  designerId: string;
  stage: ProjectStage; // 设计跟进 / 工程施工
  status: ProjectStatus;
  priority: ProjectPriority;
  budget: number; // 预算（元）
  contractAmount?: number; // 合同额（元）
  actualCost?: number; // 实际成本（元）
  startDate: string;
  endDate?: string;
  description: string;
  location: string;
  area: number; // 面积（平方米）
  style: string; // 设计风格
  updates: ProjectUpdate[]; // 项目跟进记录（自由输入）
  overallProgress: number; // 总体进度百分比（手动维护 0-100）
  createdAt: string;
  updatedAt: string;
}

// 客户
export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  company?: string;
  notes?: string;
  totalProjects: number;
  totalSpent: number;
  createdAt: string;
  lastContactAt?: string;
}

// 跟进记录
export interface FollowUp {
  id: string;
  clientId: string;
  type: 'call' | 'visit' | 'email' | 'wechat' | 'other'; // 跟进方式
  content: string; // 跟进内容
  nextAction?: string; // 下一步计划
  nextDate?: string; // 下次跟进日期
  designerId?: string; // 跟进人
  createdAt: string;
}

// 跟进类型标签
export const FOLLOW_UP_TYPES = {
  call: { label: '电话', icon: '📞' },
  visit: { label: '上门', icon: '🏠' },
  email: { label: '邮件', icon: '📧' },
  wechat: { label: '微信', icon: '💬' },
  other: { label: '其他', icon: '📝' },
} as const;

// 设计师
export interface Designer {
  id: string;
  name: string;
  avatar?: string;
  title: string; // 职位
  specialty: string[]; // 专长
  phone: string;
  email: string;
  activeProjects: number;
  completedProjects: number;
  rating: number; // 评分 1-5
  bio?: string;
  joinedAt: string;
}

// 看板统计数据
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  totalRevenue: number;
  upcomingDeadlines: number;
}
