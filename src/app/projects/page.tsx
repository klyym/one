'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { PhaseProgressDisplay } from '@/components/project/phase-progress';
import { PhaseEditor } from '@/components/project/phase-editor';
import type { Project, ProjectStatus, ProjectPriority, PhaseProgress, DesignPhase } from '@/types';

// 设计阶段列表
const DESIGN_PHASES: DesignPhase[] = ['平面设计', 'SU模型推敲', '效果图', '施工图', '设计完成'];

// 创建默认的阶段进度
const createDefaultPhases = (): PhaseProgress[] => {
  return DESIGN_PHASES.map((phase) => ({
    phase,
    status: 'pending' as const,
    progress: 0,
  }));
};

// 计算总体进度
const calculateOverallProgress = (phases: PhaseProgress[]): number => {
  const totalPhases = phases.length;
  const completedPhases = phases.filter(p => p.status === 'completed').length;
  const currentPhase = phases.find(p => p.status === 'in_progress');
  
  if (currentPhase) {
    const currentPhaseIndex = phases.findIndex(p => p.phase === currentPhase.phase);
    return Math.round(((completedPhases + currentPhase.progress / 100) / totalPhases) * 100);
  }
  
  return Math.round((completedPhases / totalPhases) * 100);
};

// 获取当前阶段
const getCurrentPhase = (phases: PhaseProgress[]): DesignPhase => {
  const inProgressPhase = phases.find(p => p.status === 'in_progress');
  if (inProgressPhase) return inProgressPhase.phase;
  
  const pendingPhase = phases.find(p => p.status === 'pending');
  if (pendingPhase) return pendingPhase.phase;
  
  return '设计完成';
};

export default function ProjectsPage() {
  const { projects, clients, designers, addProject, updateProject, deleteProject } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [phases, setPhases] = useState<PhaseProgress[]>(createDefaultPhases());
  const [activeTab, setActiveTab] = useState<'basic' | 'phases'>('basic');

  // 过滤项目
  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (project.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleSaveProject = (formData: FormData) => {
    const currentPhase = getCurrentPhase(phases);
    const overallProgress = calculateOverallProgress(phases);

    const projectData = {
      name: formData.get('name') as string,
      clientId: formData.get('clientId') as string,
      designerId: formData.get('designerId') as string,
      status: formData.get('status') as ProjectStatus,
      priority: formData.get('priority') as ProjectPriority,
      budget: Number(formData.get('budget')),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || undefined,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      area: Number(formData.get('area')),
      style: formData.get('style') as string,
      phases: phases,
      currentPhase: currentPhase,
      overallProgress: overallProgress,
    };

    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
    }

    setIsDialogOpen(false);
    setEditingProject(null);
    setPhases(createDefaultPhases());
    setActiveTab('basic');
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setPhases(project.phases);
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingProject(null);
    setPhases(createDefaultPhases());
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

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
    const priorityMap: Record<string, { label: string; className: string }> = {
      high: { label: '高', className: 'bg-red-100 text-red-700' },
      medium: { label: '中', className: 'bg-yellow-100 text-yellow-700' },
      low: { label: '低', className: 'bg-green-100 text-green-700' },
    };
    return priorityMap[priority] || { label: priority, className: 'bg-gray-100' };
  };

  const getCurrentPhaseBadge = (currentPhase: string, status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-700">设计完成</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700">{currentPhase}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">项目管理</h1>
          <p className="text-muted-foreground mt-1">管理所有设计项目</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              新建项目
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? '编辑项目' : '新建项目'}
              </DialogTitle>
            </DialogHeader>
            
            {/* 标签页切换 */}
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'basic'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                基本信息
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('phases')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'phases'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                阶段进度
              </button>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <form action={handleSaveProject} className="space-y-4 py-4">
                {activeTab === 'basic' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">项目名称</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingProject?.name}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="client">客户</Label>
                        <Select name="clientId" defaultValue={editingProject?.clientId}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择客户" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="designer">设计师</Label>
                        <Select name="designerId" defaultValue={editingProject?.designerId}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择设计师" />
                          </SelectTrigger>
                          <SelectContent>
                            {designers.map(designer => (
                              <SelectItem key={designer.id} value={designer.id}>
                                {designer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="style">设计风格</Label>
                        <Input
                          id="style"
                          name="style"
                          defaultValue={editingProject?.style}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">状态</Label>
                        <Select name="status" defaultValue={editingProject?.status || 'pending'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">待开始</SelectItem>
                            <SelectItem value="in_progress">进行中</SelectItem>
                            <SelectItem value="completed">已完成</SelectItem>
                            <SelectItem value="on_hold">暂停中</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">优先级</Label>
                        <Select name="priority" defaultValue={editingProject?.priority || 'medium'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">高</SelectItem>
                            <SelectItem value="medium">中</SelectItem>
                            <SelectItem value="low">低</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget">预算（元）</Label>
                        <Input
                          id="budget"
                          name="budget"
                          type="number"
                          defaultValue={editingProject?.budget}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="area">面积（㎡）</Label>
                        <Input
                          id="area"
                          name="area"
                          type="number"
                          defaultValue={editingProject?.area}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">开始日期</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          defaultValue={editingProject?.startDate}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">结束日期</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          defaultValue={editingProject?.endDate}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location">项目地址</Label>
                      <Input
                        id="location"
                        name="location"
                        defaultValue={editingProject?.location}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">项目描述</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingProject?.description}
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <PhaseEditor phases={phases} onChange={setPhases} />
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingProject(null);
                      setPhases(createDefaultPhases());
                      setActiveTab('basic');
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit">保存</Button>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目名称或地址..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">待开始</SelectItem>
            <SelectItem value="in_progress">进行中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="on_hold">暂停中</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 项目列表 */}
      <div className="grid gap-4">
        {filteredProjects.map((project) => {
          const status = getStatusBadge(project.status);
          const priority = getPriorityBadge(project.priority);
          const client = clients.find(c => c.id === project.clientId);
          const designer = designers.find(d => d.id === project.designerId);
          const isExpanded = expandedProjects.has(project.id);

          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge className={priority.className}>{priority.label}</Badge>
                      {getCurrentPhaseBadge(project.currentPhase, project.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground mb-4">
                      <div>📍 地址：{project.location}</div>
                      <div>📐 面积：{project.area}㎡</div>
                      <div>🎨 风格：{project.style}</div>
                      <div>👤 客户：{client?.name}</div>
                      <div>✏️ 设计师：{designer?.name}</div>
                      <div>💰 预算：¥{(project.budget / 10000).toFixed(0)}万</div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                    
                    {/* 总体进度 */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">总体进度</span>
                          <span className="text-sm text-muted-foreground">{project.overallProgress}%</span>
                        </div>
                        <Progress value={project.overallProgress} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        开始：{project.startDate}
                        {project.endDate && ` · 结束：${project.endDate}`}
                      </div>
                    </div>

                    {/* 展开查看阶段详情 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      onClick={() => toggleProjectExpansion(project.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          收起阶段详情
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          查看阶段详情
                        </>
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        <PhaseProgressDisplay
                          phases={project.phases}
                          overallProgress={project.overallProgress}
                          currentPhase={project.currentPhase}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(project)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            没有找到匹配的项目
          </div>
        )}
      </div>
    </div>
  );
}
