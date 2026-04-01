// 项目状态
export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold';

// 项目优先级
export type ProjectPriority = 'low' | 'medium' | 'high';

// 设计阶段
export type DesignPhase = '平面设计' | 'SU模型推敲' | '效果图' | '施工图' | '设计完成';

// 阶段进度状态
export interface PhaseProgress {
  phase: DesignPhase;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number; // 该阶段内的进度 0-100
  startDate?: string;
  endDate?: string;
  notes?: string;
}

// 项目类型
export interface Project {
  id: string;
  name: string;
  clientId: string;
  designerId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget: number;
  startDate: string;
  endDate?: string;
  description: string;
  location: string;
  area: number; // 面积（平方米）
  style: string; // 设计风格
  phases: PhaseProgress[]; // 阶段化进度
  currentPhase: DesignPhase; // 当前阶段
  overallProgress: number; // 总体进度百分比（自动计算）
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

// 设计案例
export interface DesignCase {
  id: string;
  name: string;
  projectId: string;
  designerId: string;
  style: string;
  location: string;
  area: number;
  images: string[];
  description: string;
  tags: string[];
  featured: boolean;
  views: number;
  likes: number;
  createdAt: string;
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
