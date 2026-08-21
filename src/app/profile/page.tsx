'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Save, Key, Building2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 密码修改相关状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setUpdateMessage({ type: 'error', text: '姓名和邮箱不能为空' });
      return;
    }

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const result = await updateProfile(name.trim(), email.trim());
      if (result.success) {
        setUpdateMessage({ type: 'success', text: '个人资料更新成功' });
      } else {
        setUpdateMessage({ type: 'error', text: result.message || '更新失败' });
      }
    } catch (error) {
      setUpdateMessage({ type: 'error', text: '更新失败，请重试' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: '请填写所有密码字段' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: '新密码至少需要 6 个字符' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);

    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setPasswordMessage({ type: 'success', text: '密码修改成功' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: result.message || '密码修改失败' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: '密码修改失败，请重试' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">个人资料</h1>
        <p className="text-muted-foreground mt-2">管理您的账户信息和安全设置</p>
      </div>

      <div className="grid gap-6">
        {/* 用户信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              基本信息
            </CardTitle>
            <CardDescription>更新您的个人信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              {/* 头像 */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                  {user.role === 'admin' ? '管理员' : '设计师'}
                </Badge>
              </div>

              {/* 信息表单 */}
              <div className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="userId">用户 ID</Label>
                  <Input
                    id="userId"
                    value={user.id}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      姓名
                    </span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入姓名"
                    disabled={isUpdating}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      邮箱
                    </span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    disabled={isUpdating}
                  />
                </div>

                {updateMessage && (
                  <div
                    className={`text-sm p-3 rounded-md ${
                      updateMessage.type === 'success'
                        ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {updateMessage.text}
                  </div>
                )}

                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="w-full md:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? '保存中...' : '保存更改'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 账户信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              账户信息
            </CardTitle>
            <CardDescription>您的账户权限和角色信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">用户角色</span>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? '管理员' : '设计师'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">权限级别</span>
                <span className="text-sm font-medium">
                  {user.role === 'admin' ? '完全访问权限' : '项目访问权限'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">所属工作室</span>
                <span className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  OneCorn Design Studio
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 修改密码卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              修改密码
            </CardTitle>
            <CardDescription>更新您的账户密码</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">当前密码</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  disabled={isChangingPassword}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="至少 6 个字符"
                  disabled={isChangingPassword}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
                  disabled={isChangingPassword}
                />
              </div>

              {passwordMessage && (
                <div
                  className={`text-sm p-3 rounded-md ${
                    passwordMessage.type === 'success'
                      ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="w-full md:w-auto"
              >
                <Key className="mr-2 h-4 w-4" />
                {isChangingPassword ? '修改中...' : '修改密码'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
