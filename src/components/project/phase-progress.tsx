'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { PhaseProgress } from '@/types';

interface PhaseProgressDisplayProps {
  phases: PhaseProgress[];
  overallProgress: number;
  currentPhase: string;
}

export function PhaseProgressDisplay({
  phases,
  overallProgress,
  currentPhase,
}: PhaseProgressDisplayProps) {
  const getPhaseIcon = (status: PhaseProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPhaseBadge = (status: PhaseProgress['status']) => {
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
      {/* 总体进度 */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm font-medium text-muted-foreground">总体进度</p>
          <p className="text-2xl font-bold">{overallProgress}%</p>
        </div>
        <div className="flex-1 ml-4">
          <Progress value={overallProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">
            当前阶段：{currentPhase}
          </p>
        </div>
      </div>

      {/* 阶段列表 */}
      <div className="space-y-3">
        {phases.map((phase, index) => (
          <div
            key={phase.phase}
            className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
              phase.status === 'in_progress'
                ? 'border-blue-300 bg-blue-50 dark:bg-blue-950/20'
                : phase.status === 'completed'
                ? 'border-green-300 bg-green-50 dark:bg-green-950/20'
                : 'border-border'
            }`}
          >
            <div className="flex flex-col items-center">
              {getPhaseIcon(phase.status)}
              {index < phases.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-2 ${
                    phase.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{phase.phase}</h4>
                  {getPhaseBadge(phase.status)}
                </div>
                <span className="text-sm font-medium">{phase.progress}%</span>
              </div>

              {phase.status === 'in_progress' && (
                <Progress value={phase.progress} className="h-2" />
              )}

              {phase.notes && (
                <p className="text-xs text-muted-foreground mt-2">
                  {phase.notes}
                </p>
              )}

              {phase.startDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  开始：{phase.startDate}
                  {phase.endDate && ` · 结束：${phase.endDate}`}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
