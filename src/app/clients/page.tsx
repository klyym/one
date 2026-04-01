'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, Phone, Mail, MapPin, Building, Calendar, MessageCircle } from 'lucide-react';
import { FollowUpList } from '@/components/client/follow-up-list';
import type { Client } from '@/types';

export default function ClientsPage() {
  const { clients, projects, followUps, addClient, updateClient, deleteClient } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [followUpClientId, setFollowUpClientId] = useState<string | null>(null);

  // 过滤客户
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveClient = (formData: FormData) => {
    const clientData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      company: formData.get('company') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    if (editingClient) {
      updateClient(editingClient.id, clientData);
    } else {
      addClient(clientData);
    }

    setIsDialogOpen(false);
    setEditingClient(null);
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  };

  const getClientFollowUps = (clientId: string) => {
    return followUps.filter(f => f.clientId === clientId);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">客户管理</h1>
          <p className="text-muted-foreground mt-1">管理所有客户信息和合作记录</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingClient(null)}>
              <Plus className="h-4 w-4 mr-2" />
              新建客户
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? '编辑客户' : '新建客户'}
              </DialogTitle>
            </DialogHeader>
            <form action={handleSaveClient} className="space-y-4">
              <div>
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingClient?.name}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">电话 *</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editingClient?.phone}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">邮箱 *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingClient?.email}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">地址 *</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={editingClient?.address}
                  required
                />
              </div>

              <div>
                <Label htmlFor="company">公司</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={editingClient?.company}
                />
              </div>

              <div>
                <Label htmlFor="notes">备注</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingClient?.notes}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingClient(null);
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

      {/* 搜索 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索客户姓名、电话或邮箱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 客户列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => {
          const clientProjects = getClientProjects(client.id);
          const clientFollowUps = getClientFollowUps(client.id);
          
          return (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {client.company && (
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Building className="h-3 w-3 mr-1" />
                        {client.company}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingClient(client);
                        setIsDialogOpen(true);
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteClient(client.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {client.phone}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {client.email}
                  </div>
                  <div className="flex items-start text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">合作项目</span>
                    <span className="font-medium">{client.totalProjects} 个</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">累计消费</span>
                    <span className="font-medium text-green-600">
                      ¥{(client.totalSpent / 10000).toFixed(0)}万
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">跟进记录</span>
                    <Badge variant="secondary">{clientFollowUps.length} 条</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      首次合作
                    </span>
                    <span className="text-xs">{client.createdAt}</span>
                  </div>
                </div>

                {clientProjects.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">最近项目：</p>
                    <div className="space-y-1">
                      {clientProjects.slice(0, 2).map(project => (
                        <div
                          key={project.id}
                          className="text-xs bg-muted rounded px-2 py-1 truncate"
                        >
                          {project.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {client.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">{client.notes}</p>
                  </div>
                )}

                {/* 查看跟进按钮 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setFollowUpClientId(client.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  查看跟进记录
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            没有找到匹配的客户
          </div>
        )}
      </div>

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
