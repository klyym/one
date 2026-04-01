'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { PhaseProgress, DesignPhase } from '@/types';

interface PhaseEditorProps {
  phases: PhaseProgress[];
  onChange: (phases: PhaseProgress[]) => void;
}

const DESIGN_PHASES: DesignPhase[] = ['平面设计', 'SU模型推敲', '效果图', '施工图', '设计完成'];

export function PhaseEditor({ phases, onChange }: PhaseEditorProps) {
  const updatePhase = (index: number, updates: Partial<PhaseProgress>) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], ...updates };
    
    // 如果某个阶段设为进行中，确保之前的阶段都是已完成
    if (updates.status === 'in_progress') {
      for (let i = 0; i < index; i++) {
        if (newPhases[i].status === 'pending') {
          newPhases[i] = { ...newPhases[i], status: 'completed', progress: 100 };
        }
      }
    }
    
    // 如果某个阶段设为已完成，自动将进度设为100%
    if (updates.status === 'completed') {
      newPhases[index].progress = 100;
    }
    
    // 如果某个阶段设为待开始，自动将进度设为0%
    if (updates.status === 'pending') {
      newPhases[index].progress = 0;
    }
    
    onChange(newPhases);
  };

  const getStatusBadge = (status: PhaseProgress['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">已完成</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">进行中</Badge>;
      case 'pending':
        return <Badge variant="outline">待开始</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">阶段进度设置</Label>
        <p className="text-xs text-muted-foreground">
          总体进度会根据阶段自动计算
        </p>
      </div>
      
      <div className="space-y-3">
        {phases.map((phase, index) => (
          <div
            key={phase.phase}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{index + 1}. {phase.phase}</span>
                {getStatusBadge(phase.status)}
              </div>
              
              <Select
                value={phase.status}
                onValueChange={(value) => updatePhase(index, { status: value as PhaseProgress['status'] })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待开始</SelectItem>
                  <SelectItem value="in_progress">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {phase.status === 'in_progress' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">阶段内进度</Label>
                  <span className="text-sm font-medium">{phase.progress}%</span>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={phase.progress}
                  onChange={(e) => updatePhase(index, { progress: Number(e.target.value) })}
                  className="w-full"
                />
                <Progress value={phase.progress} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">开始时间</Label>
                <Input
                  type="date"
                  value={phase.startDate || ''}
                  onChange={(e) => updatePhase(index, { startDate: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">结束时间</Label>
                <Input
                  type="date"
                  value={phase.endDate || ''}
                  onChange={(e) => updatePhase(index, { endDate: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">备注</Label>
              <Input
                placeholder="可选备注信息"
                value={phase.notes || ''}
                onChange={(e) => updatePhase(index, { notes: e.target.value })}
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 总体进度预览 */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">总体进度预览</span>
          <span className="text-lg font-bold">
            {Math.round(
              (phases.reduce((sum, p) => {
                if (p.status === 'completed') return sum + 100;
                if (p.status === 'in_progress') return sum + p.progress;
                return sum;
              }, 0) / (phases.length * 100)) * 100
            )}%
          </span>
        </div>
        <Progress
          value={Math.round(
            (phases.reduce((sum, p) => {
              if (p.status === 'completed') return sum + 100;
              if (p.status === 'in_progress') return sum + p.progress;
              return sum;
            }, 0) / (phases.length * 100)) * 100
          )}
          className="h-3"
        />
        <p className="text-xs text-muted-foreground mt-2">
          当前阶段：{phases.find(p => p.status === 'in_progress')?.phase || '全部完成'}
        </p>
      </div>
    </div>
  );
}
