'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FolderKanban,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { projects, clients, cases } = useStore();

  // 计算统计数据
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalClients: clients.length,
    totalRevenue: projects.reduce((sum, p) => sum + p.budget, 0),
    upcomingDeadlines: projects.filter(p => {
      if (!p.endDate) return false;
      const deadline = new Date(p.endDate);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30天内
    }).length,
  };

  // 项目状态分布数据
  const statusData = [
    { name: '进行中', value: projects.filter(p => p.status === 'in_progress').length },
    { name: '已完成', value: projects.filter(p => p.status === 'completed').length },
    { name: '待开始', value: projects.filter(p => p.status === 'pending').length },
    { name: '暂停中', value: projects.filter(p => p.status === 'on_hold').length },
  ];

  // 风格分布数据
  const styleData = projects.reduce((acc, p) => {
    const style = p.style;
    const existing = acc.find(item => item.name === style);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: style, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // 最近项目
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      in_progress: { label: '进行中', variant: 'default' },
      completed: { label: '已完成', variant: 'secondary' },
      pending: { label: '待开始', variant: 'outline' },
      on_hold: { label: '暂停中', variant: 'destructive' },
    };
    return statusMap[status] || { label: status, variant: 'outline' };
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; color: string }> = {
      high: { label: '高', color: 'text-red-600' },
      medium: { label: '中', color: 'text-yellow-600' },
      low: { label: '低', color: 'text-green-600' },
    };
    return priorityMap[priority] || { label: priority, color: 'text-gray-600' };
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">数据看板</h1>
        <p className="text-muted-foreground mt-1">欢迎回来，查看工作室最新动态</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总项目数</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              进行中 {stats.activeProjects} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">客户数量</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              累计合作客户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总营收</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(stats.totalRevenue / 10000).toFixed(0)}万
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>{' '}
              较上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground mt-1">
              30天内到期项目
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 项目状态分布 */}
        <Card>
          <CardHeader>
            <CardTitle>项目状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 设计风格分布 */}
        <Card>
          <CardHeader>
            <CardTitle>设计风格分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={styleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近项目 */}
      <Card>
        <CardHeader>
          <CardTitle>最近更新项目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => {
              const status = getStatusBadge(project.status);
              const priority = getPriorityBadge(project.priority);
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className={`text-xs ${priority.color}`}>
                        优先级: {priority.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.location} · {project.area}㎡ · {project.style}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">进度 {project.progress}%</p>
                      <Progress value={project.progress} className="w-24 h-2" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ¥{(project.budget / 10000).toFixed(0)}万
                      </p>
                      <p className="text-xs text-muted-foreground">
                        更新于 {project.updatedAt}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
