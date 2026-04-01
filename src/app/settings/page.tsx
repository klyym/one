'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">系统设置</h1>
        <p className="text-muted-foreground mt-1">管理工作室系统配置</p>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="studio-name">工作室名称</Label>
              <Input id="studio-name" defaultValue="室内设计工作室" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="studio-address">工作室地址</Label>
              <Input id="studio-address" placeholder="请输入工作室地址" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-phone">联系电话</Label>
                <Input id="contact-phone" placeholder="请输入联系电话" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="contact-email">联系邮箱</Label>
                <Input id="contact-email" type="email" placeholder="请输入联系邮箱" className="mt-1.5" />
              </div>
            </div>
          </div>
          <Button>保存更改</Button>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            通知设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">项目到期提醒</p>
                <p className="text-sm text-muted-foreground">项目即将到期时发送通知</p>
              </div>
              <Badge variant="secondary">已开启</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">新客户通知</p>
                <p className="text-sm text-muted-foreground">有新客户咨询时发送通知</p>
              </div>
              <Badge variant="secondary">已开启</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">周报汇总</p>
                <p className="text-sm text-muted-foreground">每周发送项目进度汇总</p>
              </div>
              <Badge variant="outline">已关闭</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 安全设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            安全设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="current-password">当前密码</Label>
              <Input id="current-password" type="password" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-password">新密码</Label>
                <Input id="new-password" type="password" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input id="confirm-password" type="password" className="mt-1.5" />
              </div>
            </div>
          </div>
          <Button variant="outline">修改密码</Button>
        </CardContent>
      </Card>

      {/* 主题设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            主题设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">界面主题</p>
              <p className="text-sm text-muted-foreground">选择适合您的界面主题</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">浅色</Button>
              <Button size="sm">深色</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 系统信息 */}
      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">系统版本：</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div>
              <span className="text-muted-foreground">最后更新：</span>
              <span className="font-medium">2024-12-15</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
