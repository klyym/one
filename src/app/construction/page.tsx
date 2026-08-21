'use client';

import { useState, type FormEvent } from 'react';
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
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Building,
  MessageCircle,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { FollowUpList } from '@/components/client/follow-up-list';
import type { Project, ProjectStatus, ProjectPriority, ProjectStage, ProjectUpdate } from '@/types';

// 金额格式化
const formatMoney = (value?: number): string => {
  if (!value) return '¥0';
  if (value >= 10000) return `¥${(value / 10000).toFixed(1)}万`;
  return `¥${value.toLocaleString()}`;
};

const today = () => new Date().toISOString().split('T')[0];

export default function ConstructionPage() {
  const { projects, clients, designers, addProject, updateProject, deleteProject, addClient, updateClient } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'basic' | 'updates'>('basic');
  const [clientIdValue, setClientIdValue] = useState<string>('');

  // 施工跟进记录（自由输入）
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [newUpdateDate, setNewUpdateDate] = useState<string>(today());
  const [newUpdateContent, setNewUpdateContent] = useState('');

  // 总体进度（手动维护 0-100）
  const [progressValue, setProgressValue] = useState<string>('0');

  // 客户详情弹窗
  const [clientDetailId, setClientDetailId] = useState<string | null>(null);
  const [isEditingClient, setIsEditingClient] = useState(false);

  // 新建客户快捷弹窗
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', address: '', company: '', notes: '' });

  // 客户跟进弹窗
  const [followUpClientId, setFollowUpClientId] = useState<string | null>(null);

  // 施工项目（stage === construction）
  const constructionProjects = projects.filter(p => (p.stage ?? 'design') === 'construction');

  // 过滤（搜索 + 状态）
  const filteredProjects = constructionProjects.filter(project => {
    const client = clients.find(c => c.id === project.clientId);
    const matchesSearch = (project.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (project.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 统计
  const ongoingCount = constructionProjects.filter(p => p.status === 'in_progress').length;
  const completedCount = constructionProjects.filter(p => p.status === 'completed').length;
  const totalContract = constructionProjects.reduce((s, p) => s + (p.contractAmount || 0), 0);
  const totalCost = constructionProjects.reduce((s, p) => s + (p.actualCost || 0), 0);

  // 客户详情弹窗的实时数据
  const detailClient = clientDetailId ? clients.find(c => c.id === clientDetailId) || null : null;

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
    const projectData = {
      name: formData.get('name') as string,
      clientId: clientIdValue,
      designerId: formData.get('designerId') as string,
      stage: (formData.get('stage') as ProjectStage) || 'construction',
      status: formData.get('status') as ProjectStatus,
      priority: formData.get('priority') as ProjectPriority,
      budget: Number(formData.get('budget')) || 0,
      contractAmount: Number(formData.get('contractAmount')) || undefined,
      actualCost: Number(formData.get('actualCost')) || undefined,
      startDate: formData.get('startDate') as string,
      endDate: (formData.get('endDate') as string) || undefined,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      area: Number(formData.get('area')),
      style: formData.get('style') as string,
      updates: updates,
      overallProgress: Math.min(100, Math.max(0, Number(progressValue) || 0)),
    };

    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
    }

    setIsDialogOpen(false);
    setEditingProject(null);
    setUpdates([]);
    setProgressValue('0');
    setClientIdValue('');
    setActiveTab('basic');
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setUpdates(project.updates || []);
    setProgressValue(String(project.overallProgress ?? 0));
    setClientIdValue(project.clientId);
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingProject(null);
    setUpdates([]);
    setProgressValue('0');
    setClientIdValue('');
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  // 新增/删除施工跟进记录
  const addUpdate = () => {
    const content = newUpdateContent.trim();
    if (!content) return;
    setUpdates(prev => [
      ...prev,
      { id: Date.now().toString(), date: newUpdateDate || today(), content },
    ]);
    setNewUpdateContent('');
    setNewUpdateDate(today());
  };

  const removeUpdate = (id: string) => {
    setUpdates(prev => prev.filter(u => u.id !== id));
  };

  // 新建客户（保存后自动选中）
  const handleCreateClient = (e: FormEvent) => {
    e.preventDefault();
    const id = addClient({
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      email: newClient.email.trim(),
      address: newClient.address.trim(),
      company: newClient.company.trim() || undefined,
      notes: newClient.notes.trim() || undefined,
    });
    setClientIdValue(id);
    setIsNewClientOpen(false);
    setNewClient({ name: '', phone: '', email: '', address: '', company: '', notes: '' });
  };

  // 在客户详情弹窗内编辑客户
  const handleSaveClientEdit = (formData: FormData) => {
    if (!detailClient) return;
    updateClient(detailClient.id, {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      company: (formData.get('company') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
    });
    setIsEditingClient(false);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      in_progress: { label: '施工中', variant: 'default' },
      completed: { label: '已完工', variant: 'secondary' },
      pending: { label: '待开工', variant: 'outline' },
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

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">工程管理</h1>
          <p className="text-muted-foreground mt-1">施工阶段项目的进度与现场跟进</p>
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
                onClick={() => setActiveTab('updates')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'updates'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                施工跟进
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
                        <div className="flex gap-2">
                          <Select name="clientId" value={clientIdValue} onValueChange={setClientIdValue}>
                            <SelectTrigger className="flex-1">
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
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title="新建客户"
                            onClick={() => setIsNewClientOpen(true)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
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

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="status">状态</Label>
                        <Select name="status" defaultValue={editingProject?.status || 'in_progress'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">待开工</SelectItem>
                            <SelectItem value="in_progress">施工中</SelectItem>
                            <SelectItem value="completed">已完工</SelectItem>
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
                      <div>
                        <Label htmlFor="stage">项目阶段</Label>
                        <Select name="stage" defaultValue={editingProject?.stage || 'construction'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="design">设计跟进</SelectItem>
                            <SelectItem value="construction">工程施工</SelectItem>
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
                        <Label htmlFor="contractAmount">合同额（元）</Label>
                        <Input
                          id="contractAmount"
                          name="contractAmount"
                          type="number"
                          defaultValue={editingProject?.contractAmount}
                          placeholder="可选"
                        />
                      </div>
                      <div>
                        <Label htmlFor="actualCost">实际成本（元）</Label>
                        <Input
                          id="actualCost"
                          name="actualCost"
                          type="number"
                          defaultValue={editingProject?.actualCost}
                          placeholder="可选"
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="progress">施工进度（%）</Label>
                        <Input
                          id="progress"
                          type="number"
                          min={0}
                          max={100}
                          value={progressValue}
                          onChange={(e) => setProgressValue(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">手动填写 0-100</p>
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
                  <div className="space-y-4">
                    {/* 跟进记录列表 */}
                    {updates.length > 0 ? (
                      <div className="space-y-3">
                        {[...updates]
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map(u => (
                            <div key={u.id} className="flex gap-3 items-start border rounded-lg p-3">
                              <span className="text-xs bg-muted rounded px-2 py-1 whitespace-nowrap mt-0.5 shrink-0">
                                {u.date}
                              </span>
                              <p className="text-sm flex-1 pt-0.5">{u.content}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUpdate(u.id)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        还没有施工跟进记录，添加第一条吧
                      </p>
                    )}

                    {/* 新增跟进记录 */}
                    <div className="border-t pt-4 space-y-3">
                      <p className="text-sm font-medium">添加施工跟进</p>
                      <div className="flex gap-3">
                        <Input
                          type="date"
                          value={newUpdateDate}
                          onChange={(e) => setNewUpdateDate(e.target.value)}
                          className="w-[170px] shrink-0"
                        />
                        <Input
                          placeholder="如：水电验收通过，泥瓦工进场..."
                          value={newUpdateContent}
                          onChange={(e) => setNewUpdateContent(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addUpdate}
                          disabled={!newUpdateContent.trim()}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          添加跟进
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingProject(null);
                      setUpdates([]);
                      setProgressValue('0');
                      setActiveTab('basic');
                      setClientIdValue('');
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

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">施工中项目</p>
            <p className="text-xl font-bold mt-1">{ongoingCount} 个</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">已完工</p>
            <p className="text-xl font-bold mt-1">{completedCount} 个</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">合同总额</p>
            <p className="text-xl font-bold mt-1">{formatMoney(totalContract)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">实际成本</p>
            <p className="text-xl font-bold mt-1">{formatMoney(totalCost)}</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目、地址或客户..."
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
            <SelectItem value="pending">待开工</SelectItem>
            <SelectItem value="in_progress">施工中</SelectItem>
            <SelectItem value="completed">已完工</SelectItem>
            <SelectItem value="on_hold">暂停中</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 施工项目列表 */}
      <div className="grid gap-4">
        {filteredProjects.map((project) => {
          const status = getStatusBadge(project.status);
          const priority = getPriorityBadge(project.priority);
          const client = clients.find(c => c.id === project.clientId);
          const designer = designers.find(d => d.id === project.designerId);
          const isExpanded = expandedProjects.has(project.id);
          const sortedUpdates = project.updates ? [...project.updates].sort((a, b) => b.date.localeCompare(a.date)) : [];

          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 头部：名称 + 徽章 */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge className={priority.className}>{priority.label}</Badge>
                    </div>

                    {/* 关键信息行 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-left text-primary hover:underline"
                        onClick={() => {
                          setClientDetailId(project.clientId);
                          setIsEditingClient(false);
                        }}
                      >
                        <User className="h-4 w-4 shrink-0" />
                        <span className="truncate">{client?.name || '未分配客户'}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <span>📄</span>
                        <span>合同 {formatMoney(project.contractAmount)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🧾</span>
                        <span>成本 {formatMoney(project.actualCost)}</span>
                      </div>
                      <div>📅 {project.startDate}{project.endDate ? ` ~ ${project.endDate}` : ''}</div>
                    </div>

                    {/* 施工进度（手动） */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">施工进度</span>
                          <span className="text-sm text-muted-foreground">{project.overallProgress}%</span>
                        </div>
                        <Progress value={project.overallProgress} className="h-2" />
                      </div>
                    </div>

                    {/* 展开查看详情 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3"
                      onClick={() => toggleProjectExpansion(project.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          收起详情
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          查看详情
                        </>
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="mt-3 pt-4 border-t space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                          <div>📍 地址：{project.location || '—'}</div>
                          <div>📐 面积：{project.area}㎡</div>
                          <div>🎨 风格：{project.style || '—'}</div>
                          <div>✏️ 设计师：{designer?.name || '—'}</div>
                          <div>💰 预算：{formatMoney(project.budget)}</div>
                          {project.description && (
                            <div className="col-span-2 md:col-span-4">
                              📝 {project.description}
                            </div>
                          )}
                        </div>

                        {/* 施工跟进时间线 */}
                        {sortedUpdates.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">施工跟进</p>
                            <div className="space-y-2">
                              {sortedUpdates.map(u => (
                                <div key={u.id} className="flex gap-3 items-start text-sm">
                                  <span className="text-xs bg-muted rounded px-2 py-1 whitespace-nowrap shrink-0 mt-0.5">
                                    {u.date}
                                  </span>
                                  <span className="text-muted-foreground pt-0.5">{u.content}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {project.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`确认将「${project.name}」标记为已完工？`)) {
                            updateProject(project.id, { status: 'completed', overallProgress: 100 });
                          }
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        标记完工
                      </Button>
                    )}
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
            暂无施工项目。设计阶段完成后，在「设计跟进」中点击「转入施工」
          </div>
        )}
      </div>

      {/* 新建客户快捷弹窗 */}
      <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新建客户</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div>
              <Label htmlFor="newClientName">姓名 *</Label>
              <Input
                id="newClientName"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newClientPhone">电话 *</Label>
              <Input
                id="newClientPhone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newClientEmail">邮箱 *</Label>
              <Input
                id="newClientEmail"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newClientAddress">地址 *</Label>
              <Input
                id="newClientAddress"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newClientCompany">公司</Label>
              <Input
                id="newClientCompany"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="newClientNotes">备注</Label>
              <Textarea
                id="newClientNotes"
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsNewClientOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-1" />
                保存并选择
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 客户详情弹窗（内嵌编辑） */}
      <Dialog
        open={!!detailClient}
        onOpenChange={(open) => {
          if (!open) {
            setClientDetailId(null);
            setIsEditingClient(false);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {detailClient && !isEditingClient && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detailClient.name}
                  {detailClient.company && (
                    <span className="text-sm font-normal text-muted-foreground flex items-center">
                      <Building className="h-3.5 w-3.5 mr-1" />
                      {detailClient.company}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2 shrink-0" />
                  {detailClient.phone || '—'}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2 shrink-0" />
                  {detailClient.email || '—'}
                </div>
                <div className="flex items-start text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                  <span>{detailClient.address || '—'}</span>
                </div>
              </div>

              {detailClient.notes && (
                <p className="text-sm text-muted-foreground pt-3 border-t">{detailClient.notes}</p>
              )}

              <div className="grid grid-cols-3 gap-3 text-sm pt-3 border-t">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">合作项目</span>
                  <span className="font-medium mt-1">{detailClient.totalProjects} 个</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">累计消费</span>
                  <span className="font-medium text-green-600 mt-1">{formatMoney(detailClient.totalSpent)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">首次合作</span>
                  <span className="font-medium mt-1">{detailClient.createdAt}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={() => setIsEditingClient(true)}>
                  编辑客户
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFollowUpClientId(detailClient.id)}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  跟进记录
                </Button>
              </div>
            </div>
          )}

          {detailClient && isEditingClient && (
            <div>
              <DialogHeader>
                <DialogTitle>编辑客户</DialogTitle>
              </DialogHeader>
              <form action={handleSaveClientEdit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="editClientName">姓名 *</Label>
                  <Input id="editClientName" name="name" defaultValue={detailClient.name} required />
                </div>
                <div>
                  <Label htmlFor="editClientPhone">电话 *</Label>
                  <Input id="editClientPhone" name="phone" defaultValue={detailClient.phone} required />
                </div>
                <div>
                  <Label htmlFor="editClientEmail">邮箱 *</Label>
                  <Input id="editClientEmail" name="email" type="email" defaultValue={detailClient.email} required />
                </div>
                <div>
                  <Label htmlFor="editClientAddress">地址 *</Label>
                  <Input id="editClientAddress" name="address" defaultValue={detailClient.address} required />
                </div>
                <div>
                  <Label htmlFor="editClientCompany">公司</Label>
                  <Input id="editClientCompany" name="company" defaultValue={detailClient.company} />
                </div>
                <div>
                  <Label htmlFor="editClientNotes">备注</Label>
                  <Textarea id="editClientNotes" name="notes" defaultValue={detailClient.notes} rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditingClient(false)}>
                    取消
                  </Button>
                  <Button type="submit">保存</Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 跟进记录弹窗 */}
      <Dialog open={!!followUpClientId} onOpenChange={() => setFollowUpClientId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {followUpClientId && (
            <FollowUpList clientId={followUpClientId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
