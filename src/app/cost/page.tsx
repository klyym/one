'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil } from 'lucide-react';
import type { Project } from '@/types';

// 金额格式化
const formatMoney = (value?: number): string => {
  if (!value) return '¥0';
  if (value >= 10000) return `¥${(value / 10000).toFixed(1)}万`;
  return `¥${value.toLocaleString()}`;
};

// 状态标签
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    in_progress: '进行中',
    completed: '已完成',
    pending: '待开始',
    on_hold: '暂停中',
  };
  return statusMap[status] || status;
};

export default function CostPage() {
  const { projects, clients, updateProject } = useStore();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [costForm, setCostForm] = useState({ budget: '', contractAmount: '', actualCost: '' });

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setCostForm({
      budget: project.budget ? String(project.budget) : '',
      contractAmount: project.contractAmount ? String(project.contractAmount) : '',
      actualCost: project.actualCost ? String(project.actualCost) : '',
    });
  };

  const saveCost = () => {
    if (!editingProject) return;
    updateProject(editingProject.id, {
      budget: Number(costForm.budget) || 0,
      contractAmount: costForm.contractAmount ? Number(costForm.contractAmount) : undefined,
      actualCost: costForm.actualCost ? Number(costForm.actualCost) : undefined,
    });
    setEditingProject(null);
  };

  // 汇总统计
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalContract = projects.reduce((sum, p) => sum + (p.contractAmount || 0), 0);
  const totalCost = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0);
  const totalProfit = totalContract - totalCost;
  const profitRate = totalContract > 0 ? (totalProfit / totalContract) * 100 : 0;
  const profitableCount = projects.filter(p => p.contractAmount && p.actualCost !== undefined && p.contractAmount > p.actualCost).length;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">项目造价</h1>
        <p className="text-muted-foreground mt-1">各项目预算、合同额与实际成本的盈亏概览</p>
      </div>

      {/* 汇总卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">总预算</p>
            <p className="text-xl font-bold mt-1">{formatMoney(totalBudget)}</p>
            <p className="text-xs text-muted-foreground mt-1">{projects.length} 个项目</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">总合同额</p>
            <p className="text-xl font-bold mt-1">{formatMoney(totalContract)}</p>
            <p className="text-xs text-muted-foreground mt-1">已签订合同金额</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">总成本</p>
            <p className="text-xl font-bold mt-1">{formatMoney(totalCost)}</p>
            <p className="text-xs text-muted-foreground mt-1">实际投入成本</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">总利润</p>
            <p className={`text-xl font-bold mt-1 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney(totalProfit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">合同额 − 成本</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">整体利润率</p>
            <p className={`text-xl font-bold mt-1 ${profitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalContract > 0 ? `${profitRate.toFixed(1)}%` : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{profitableCount} 个项目盈利</p>
          </CardContent>
        </Card>
      </div>

      {/* 造价明细表 */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>项目</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">预算</TableHead>
                <TableHead className="text-right">合同额</TableHead>
                <TableHead className="text-right">实际成本</TableHead>
                <TableHead className="text-right">利润</TableHead>
                <TableHead className="text-right">利润率</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => {
                const client = clients.find(c => c.id === project.clientId);
                const profit =
                  project.contractAmount && project.actualCost !== undefined
                    ? project.contractAmount - project.actualCost
                    : null;
                const rate =
                  project.contractAmount && profit !== null
                    ? (profit / project.contractAmount) * 100
                    : null;

                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{client?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getStatusLabel(project.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(project.budget)}</TableCell>
                    <TableCell className="text-right">
                      {project.contractAmount ? formatMoney(project.contractAmount) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {project.actualCost !== undefined ? formatMoney(project.actualCost) : '—'}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        profit === null ? '' : profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {profit === null ? '—' : formatMoney(profit)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        rate === null ? '' : rate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {rate === null ? '—' : `${rate.toFixed(1)}%`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openEdit(project)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        编辑
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    暂无项目，请先在「项目管理」中新建项目
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 编辑造价弹窗 */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑造价：{editingProject?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="costBudget">预算（元）</Label>
              <Input
                id="costBudget"
                type="number"
                value={costForm.budget}
                onChange={(e) => setCostForm({ ...costForm, budget: e.target.value })}
                placeholder="预算金额"
              />
            </div>
            <div>
              <Label htmlFor="costContract">合同额（元）</Label>
              <Input
                id="costContract"
                type="number"
                value={costForm.contractAmount}
                onChange={(e) => setCostForm({ ...costForm, contractAmount: e.target.value })}
                placeholder="与客户签订的合同金额"
              />
            </div>
            <div>
              <Label htmlFor="costActual">实际成本（元）</Label>
              <Input
                id="costActual"
                type="number"
                value={costForm.actualCost}
                onChange={(e) => setCostForm({ ...costForm, actualCost: e.target.value })}
                placeholder="项目实际投入成本"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setEditingProject(null)}>
                取消
              </Button>
              <Button onClick={saveCost}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
