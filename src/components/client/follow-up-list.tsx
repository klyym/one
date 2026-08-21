'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2, Calendar, User, ArrowRight, Phone, Mail, Home, MessageCircle, FileText } from 'lucide-react';
import type { FollowUp } from '@/types';
import { FOLLOW_UP_TYPES } from '@/types';

interface FollowUpListProps {
  clientId: string;
}

export function FollowUpList({ clientId }: FollowUpListProps) {
  const { followUps, designers, addFollowUp, deleteFollowUp } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 获取该客户的跟进记录
  const clientFollowUps = followUps
    .filter(f => f.clientId === clientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSaveFollowUp = (formData: FormData) => {
    const followUpData = {
      clientId,
      type: formData.get('type') as FollowUp['type'],
      content: formData.get('content') as string,
      nextAction: formData.get('nextAction') as string || undefined,
      nextDate: formData.get('nextDate') as string || undefined,
      designerId: formData.get('designerId') as string || undefined,
    };

    addFollowUp(followUpData);
    setIsDialogOpen(false);
  };

  const getDesigner = (designerId?: string) => {
    if (!designerId) return null;
    return designers.find(d => d.id === designerId);
  };

  const getTypeIcon = (type: FollowUp['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'visit':
        return <Home className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'wechat':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">跟进记录</CardTitle>
          <span className="text-sm text-muted-foreground">
            共 {clientFollowUps.length} 条记录
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 新建跟进按钮 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              添加跟进记录
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加跟进记录</DialogTitle>
            </DialogHeader>
            <form action={handleSaveFollowUp} className="space-y-4">
              <div>
                <Label htmlFor="type">跟进方式</Label>
                <Select name="type" defaultValue="call">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FOLLOW_UP_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.icon} {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">跟进内容 *</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={4}
                  placeholder="记录沟通内容和客户反馈..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nextAction">下一步计划</Label>
                  <Input
                    id="nextAction"
                    name="nextAction"
                    placeholder="待办事项"
                  />
                </div>
                <div>
                  <Label htmlFor="nextDate">下次跟进日期</Label>
                  <Input
                    id="nextDate"
                    name="nextDate"
                    type="date"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="designerId">跟进人</Label>
                <Select name="designerId">
                  <SelectTrigger>
                    <SelectValue placeholder="选择跟进人" />
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* 跟进记录列表 */}
        {clientFollowUps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            暂无跟进记录，点击上方按钮添加
          </div>
        ) : (
          <div className="space-y-3">
            {clientFollowUps.map((followUp) => {
              const designer = getDesigner(followUp.designerId);
              const typeInfo = FOLLOW_UP_TYPES[followUp.type];

              return (
                <div
                  key={followUp.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-accent/30 transition-colors"
                >
                  {/* 头部：类型和日期 */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        {getTypeIcon(followUp.type)}
                        {typeInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {followUp.createdAt}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (confirm('确定要删除这条跟进记录吗？')) {
                          deleteFollowUp(followUp.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* 跟进内容 */}
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {followUp.content}
                  </p>

                  {/* 跟进人 */}
                  {designer && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {designer.name}
                    </div>
                  )}

                  {/* 下一步计划 */}
                  {(followUp.nextAction || followUp.nextDate) && (
                    <div className="pt-2 border-t space-y-2">
                      {followUp.nextAction && (
                        <div className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                          <span className="text-muted-foreground">下一步：</span>
                          <span>{followUp.nextAction}</span>
                        </div>
                      )}
                      {followUp.nextDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>计划日期：{followUp.nextDate}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
