'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Bell, Shield, Palette, CheckCircle, AlertCircle, Eye, EyeOff, Key, User, Mail, Save, RefreshCw, Building2, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useStudio } from '@/lib/studio';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { user, changePassword, updateProfile } = useAuth();
  const { studioInfo, updateStudioInfo } = useStudio();
  
  // 用户信息修改状态
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [profileResult, setProfileResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hasProfileChanges, setHasProfileChanges] = useState(false);

  // 密码修改状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [passwordResult, setPasswordResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 工作室信息修改状态
  const [editStudioName, setEditStudioName] = useState('');
  const [editStudioAddress, setEditStudioAddress] = useState('');
  const [editStudioPhone, setEditStudioPhone] = useState('');
  const [editStudioEmail, setEditStudioEmail] = useState('');
  const [isStudioSubmitting, setIsStudioSubmitting] = useState(false);
  const [studioResult, setStudioResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hasStudioChanges, setHasStudioChanges] = useState(false);

  // 初始化用户信息
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  // 初始化工作室信息
  useEffect(() => {
    setEditStudioName(studioInfo.name);
    setEditStudioAddress(studioInfo.address);
    setEditStudioPhone(studioInfo.phone);
    setEditStudioEmail(studioInfo.email);
  }, [studioInfo]);

  // 检测用户信息变更
  useEffect(() => {
    if (user) {
      setHasProfileChanges(editName !== user.name || editEmail !== user.email);
    }
  }, [editName, editEmail, user]);

  // 检测工作室信息变更
  useEffect(() => {
    setHasStudioChanges(
      editStudioName !== studioInfo.name ||
      editStudioAddress !== studioInfo.address ||
      editStudioPhone !== studioInfo.phone ||
      editStudioEmail !== studioInfo.email
    );
  }, [editStudioName, editStudioAddress, editStudioPhone, editStudioEmail, studioInfo]);

  // 密码强度检测
  const getPasswordStrength = (password: string): { level: string; color: string; percentage: number } => {
    if (!password) return { level: '', color: '', percentage: 0 };
    
    let score = 0;
    if (password.length >= 6) score += 20;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;

    if (score < 40) return { level: '弱', color: 'bg-red-500', percentage: score };
    if (score < 70) return { level: '中', color: 'bg-yellow-500', percentage: score };
    return { level: '强', color: 'bg-green-500', percentage: score };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // 处理用户信息修改
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileResult(null);

    if (!editName.trim()) {
      setProfileResult({ type: 'error', message: '用户名不能为空' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      setProfileResult({ type: 'error', message: '请输入有效的邮箱地址' });
      return;
    }

    setIsProfileSubmitting(true);

    try {
      const result = await updateProfile(editName, editEmail);
      setProfileResult({
        type: result.success ? 'success' : 'error',
        message: result.message,
      });
    } catch {
      setProfileResult({ type: 'error', message: '修改失败，请稍后重试' });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handleResetProfile = () => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
    setProfileResult(null);
  };

  // 处理密码修改
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordResult(null);

    // 前端验证
    if (!currentPassword) {
      setPasswordResult({ type: 'error', message: '请输入当前密码' });
      return;
    }

    if (!newPassword) {
      setPasswordResult({ type: 'error', message: '请输入新密码' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordResult({ type: 'error', message: '新密码长度不能少于6位' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordResult({ type: 'error', message: '两次输入的新密码不一致' });
      return;
    }

    setIsPasswordSubmitting(true);

    try {
      const result = await changePassword(currentPassword, newPassword);
      setPasswordResult({
        type: result.success ? 'success' : 'error',
        message: result.message,
      });

      if (result.success) {
        // 清空表单
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordResult({ type: 'error', message: '密码修改失败，请稍后重试' });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleResetPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordResult(null);
  };

  // 处理工作室信息修改
  const handleStudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudioResult(null);

    if (!editStudioName.trim()) {
      setStudioResult({ type: 'error', message: '工作室名称不能为空' });
      return;
    }

    setIsStudioSubmitting(true);

    try {
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      updateStudioInfo({
        name: editStudioName.trim(),
        address: editStudioAddress.trim(),
        phone: editStudioPhone.trim(),
        email: editStudioEmail.trim(),
      });

      setStudioResult({ type: 'success', message: '工作室信息保存成功' });
    } catch {
      setStudioResult({ type: 'error', message: '保存失败，请稍后重试' });
    } finally {
      setIsStudioSubmitting(false);
    }
  };

  const handleResetStudio = () => {
    setEditStudioName(studioInfo.name);
    setEditStudioAddress(studioInfo.address);
    setEditStudioPhone(studioInfo.phone);
    setEditStudioEmail(studioInfo.email);
    setStudioResult(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">系统设置</h1>
        <p className="text-muted-foreground mt-1">管理工作室系统配置</p>
      </div>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            个人信息
          </CardTitle>
          <CardDescription>修改您的用户名和登录邮箱</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* 修改结果提示 */}
            {profileResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  profileResult.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {profileResult.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {profileResult.message}
              </div>
            )}

            <div className="grid gap-6">
              {/* 用户名 */}
              <div>
                <Label htmlFor="edit-name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  用户名
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setProfileResult(null);
                  }}
                  placeholder="请输入用户名"
                  className="mt-1.5"
                />
              </div>

              {/* 邮箱 */}
              <div>
                <Label htmlFor="edit-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  登录邮箱
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    setProfileResult(null);
                  }}
                  placeholder="请输入邮箱"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  修改邮箱后，下次登录请使用新邮箱
                </p>
              </div>

              <Separator />

              {/* 用户角色（只读） */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">用户角色</p>
                  <p className="text-sm text-muted-foreground">当前账户的权限角色（不可修改）</p>
                </div>
                <Badge variant={user?.role === '管理员' ? 'default' : 'secondary'}>
                  {user?.role || '-'}
                </Badge>
              </div>

              {/* 提示信息 */}
              {hasProfileChanges && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
                  <p className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    您有未保存的更改
                  </p>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isProfileSubmitting || !hasProfileChanges}>
                {isProfileSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存更改
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetProfile}
                disabled={!hasProfileChanges}
              >
                重置
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 安全设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            安全设置
          </CardTitle>
          <CardDescription>管理您的账户安全</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* 密码修改结果提示 */}
            {passwordResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  passwordResult.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {passwordResult.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {passwordResult.message}
              </div>
            )}

            <div className="grid gap-6">
              {/* 当前密码 */}
              <div>
                <Label htmlFor="current-password" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  当前密码
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordResult(null);
                    }}
                    placeholder="请输入当前密码"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 新密码 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordResult(null);
                      }}
                      placeholder="请输入新密码"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {/* 密码强度指示器 */}
                  {newPassword && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">密码强度</span>
                        <span className={`font-medium ${
                          passwordStrength.level === '强' ? 'text-green-600' :
                          passwordStrength.level === '中' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {passwordStrength.level}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 确认新密码 */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordResult(null);
                      }}
                      placeholder="请再次输入新密码"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {/* 密码匹配提示 */}
                  {confirmPassword && (
                    <p className={`text-xs ${
                      newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {newPassword === confirmPassword ? '密码匹配' : '密码不匹配'}
                    </p>
                  )}
                </div>
              </div>

              {/* 密码规则提示 */}
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">密码要求：</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>密码长度至少6位</li>
                  <li>建议使用字母、数字和特殊字符的组合</li>
                  <li>新密码不能与当前密码相同</li>
                </ul>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    修改中...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    修改密码
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleResetPassword}>
                重置
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            基本信息
          </CardTitle>
          <CardDescription>工作室基本信息设置，修改后将同步更新系统显示</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStudioSubmit} className="space-y-6">
            {/* 保存结果提示 */}
            {studioResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  studioResult.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {studioResult.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {studioResult.message}
              </div>
            )}

            <div className="grid gap-6">
              {/* 工作室名称 */}
              <div>
                <Label htmlFor="studio-name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  工作室名称
                </Label>
                <Input
                  id="studio-name"
                  value={editStudioName}
                  onChange={(e) => {
                    setEditStudioName(e.target.value);
                    setStudioResult(null);
                  }}
                  placeholder="请输入工作室名称"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  此名称将显示在系统左上角
                </p>
              </div>

              {/* 工作室地址 */}
              <div>
                <Label htmlFor="studio-address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  工作室地址
                </Label>
                <Input
                  id="studio-address"
                  value={editStudioAddress}
                  onChange={(e) => {
                    setEditStudioAddress(e.target.value);
                    setStudioResult(null);
                  }}
                  placeholder="请输入工作室地址"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 联系电话 */}
                <div>
                  <Label htmlFor="contact-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    联系电话
                  </Label>
                  <Input
                    id="contact-phone"
                    value={editStudioPhone}
                    onChange={(e) => {
                      setEditStudioPhone(e.target.value);
                      setStudioResult(null);
                    }}
                    placeholder="请输入联系电话"
                    className="mt-1.5"
                  />
                </div>
                {/* 联系邮箱 */}
                <div>
                  <Label htmlFor="contact-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    联系邮箱
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={editStudioEmail}
                    onChange={(e) => {
                      setEditStudioEmail(e.target.value);
                      setStudioResult(null);
                    }}
                    placeholder="请输入联系邮箱"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* 提示信息 */}
              {hasStudioChanges && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
                  <p className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    您有未保存的更改
                  </p>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isStudioSubmitting || !hasStudioChanges}>
                {isStudioSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存更改
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetStudio}
                disabled={!hasStudioChanges}
              >
                重置
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            通知设置
          </CardTitle>
          <CardDescription>管理系统通知偏好</CardDescription>
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

      {/* 主题设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            主题设置
          </CardTitle>
          <CardDescription>自定义界面外观</CardDescription>
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
          <CardDescription>系统版本信息</CardDescription>
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
