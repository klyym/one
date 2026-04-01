'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Calendar, Award, Briefcase, Star } from 'lucide-react';

export default function DesignersPage() {
  const { designers, projects } = useStore();

  const getDesignerProjects = (designerId: string) => {
    return projects.filter(p => p.designerId === designerId);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">设计师团队</h1>
        <p className="text-muted-foreground mt-1">管理工作室设计师信息</p>
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
              {(designers.reduce((sum, d) => sum + d.rating, 0) / designers.length).toFixed(1)}
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
                          <Badge variant="outline" className="ml-2 text-xs">
                            {project.progress}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 入职时间 */}
                <div className="flex items-center text-xs text-muted-foreground pt-4 border-t">
                  <Calendar className="h-3 w-3 mr-1" />
                  入职时间：{designer.joinedAt}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
