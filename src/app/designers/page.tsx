'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Calendar, Award, Briefcase, Star, Plus, Trash2 } from 'lucide-react';
import type { Designer } from '@/types';

export default function DesignersPage() {
  const { designers, projects, addDesigner, updateDesigner, deleteDesigner } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);

  const getDesignerProjects = (designerId: string) => {
    return projects.filter(p => p.designerId === designerId);
  };

  const handleSaveDesigner = (formData: FormData) => {
    const specialtyStr = formData.get('specialty') as string;
    const specialty = specialtyStr.split(/[,，]/).map(s => s.trim()).filter(Boolean);

    const designerData = {
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      specialty,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      rating: Number(formData.get('rating')) || 4.5,
      bio: formData.get('bio') as string || undefined,
    };

    if (editingDesigner) {
      updateDesigner(editingDesigner.id, designerData);
    } else {
      addDesigner(designerData);
    }

    setIsDialogOpen(false);
    setEditingDesigner(null);
  };

  const openEditDialog = (designer: Designer) => {
    setEditingDesigner(designer);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDesigner(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">设计师团队</h1>
          <p className="text-muted-foreground mt-1">管理工作室设计师信息</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              新建设计师
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDesigner ? '编辑设计师' : '新建设计师'}
              </DialogTitle>
            </DialogHeader>
            <form action={handleSaveDesigner} className="space-y-4">
              <div>
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingDesigner?.name}
                  required
                />
              </div>

              <div>
                <Label htmlFor="title">职位 *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingDesigner?.title}
                  placeholder="如：首席设计师、高级设计师"
                  required
                />
              </div>

              <div>
                <Label htmlFor="specialty">擅长风格（用逗号分隔）</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  defaultValue={editingDesigner?.specialty.join('，')}
                  placeholder="如：现代简约，北欧风格，工业风"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">电话 *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingDesigner?.phone}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">邮箱 *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingDesigner?.email}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rating">评分（1-5）</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  defaultValue={editingDesigner?.rating || 4.5}
                />
              </div>

              <div>
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={editingDesigner?.bio}
                  rows={3}
                  placeholder="设计师的个人介绍"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingDesigner(null);
                  }}
                >
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              设计师总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{designers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              进行中项目
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {designers.reduce((sum, d) => sum + d.activeProjects, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已完成项目
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {designers.reduce((sum, d) => sum + d.completedProjects, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均评分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              {designers.length > 0 
                ? (designers.reduce((sum, d) => sum + d.rating, 0) / designers.length).toFixed(1)
                : '0.0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 设计师列表 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {designers.map((designer) => {
          const designerProjects = getDesignerProjects(designer.id);
          
          return (
            <Card key={designer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {designer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{designer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {designer.title}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-medium">{designer.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 专长 */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    擅长风格
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {designer.specialty.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 联系方式 */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {designer.phone}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {designer.email}
                  </div>
                </div>

                {/* 简介 */}
                {designer.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {designer.bio}
                  </p>
                )}

                {/* 统计 */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {designer.activeProjects}
                    </div>
                    <div className="text-xs text-muted-foreground">进行中</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {designer.completedProjects}
                    </div>
                    <div className="text-xs text-muted-foreground">已完成</div>
                  </div>
                </div>

                {/* 最近项目 */}
                {designerProjects.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">最近项目：</p>
                    <div className="space-y-1">
                      {designerProjects.slice(0, 3).map(project => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between text-xs bg-muted rounded px-2 py-1"
                        >
                          <span className="truncate flex-1">{project.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">{project.currentPhase}</span>
                            <Badge variant="outline" className="text-xs">
                              {project.overallProgress}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(designer)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (confirm('确定要删除这位设计师吗？')) {
                        deleteDesigner(designer.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </div>

                {/* 入职时间 */}
                <div className="flex items-center text-xs text-muted-foreground pt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  入职时间：{designer.joinedAt}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {designers.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            暂无设计师信息，点击&ldquo;新建设计师&rdquo;添加
          </div>
        )}
      </div>
    </div>
  );
}
