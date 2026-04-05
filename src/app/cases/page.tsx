'use client';

import { useState, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Eye, Heart, Star, MapPin, Ruler, Plus, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import type { DesignCase } from '@/types';

interface UploadedImage {
  key: string;
  url: string;
  name: string;
}

export default function CasesPage() {
  const { cases, designers, projects, addCase, updateCase, deleteCase } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<DesignCase | null>(null);
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<DesignCase | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取所有风格
  const allStyles = Array.from(new Set(cases.map(c => c.style)));

  // 过滤案例
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = styleFilter === 'all' || caseItem.style === styleFilter;
    return matchesSearch && matchesStyle;
  });

  const getDesigner = (designerId: string) => {
    return designers.find(d => d.id === designerId);
  };

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/cases/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('上传失败');
        }

        const result = await response.json();
        return result.data as UploadedImage;
      });

      const uploadedResults = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...uploadedResults]);
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请重试');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 移除已上传的图片
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 保存案例
  const handleSaveCase = (formData: FormData) => {
    const tagsStr = formData.get('tags') as string;
    const tags = tagsStr.split(/[,，]/).map(s => s.trim()).filter(Boolean);

    const caseData = {
      name: formData.get('name') as string,
      projectId: formData.get('projectId') as string || '',
      designerId: formData.get('designerId') as string,
      style: formData.get('style') as string,
      location: formData.get('location') as string,
      area: Number(formData.get('area')),
      description: formData.get('description') as string,
      images: uploadedImages.map(img => img.url),
      tags,
      featured: formData.get('featured') === 'true',
    };

    if (editingCase) {
      updateCase(editingCase.id, caseData);
    } else {
      addCase(caseData);
    }

    setIsDialogOpen(false);
    setEditingCase(null);
    setUploadedImages([]);
  };

  // 打开编辑对话框
  const openEditDialog = (caseItem: DesignCase) => {
    setEditingCase(caseItem);
    setUploadedImages(caseItem.images.map((url, index) => ({
      key: `existing-${index}`,
      url,
      name: `图片 ${index + 1}`,
    })));
    setIsDialogOpen(true);
  };

  // 打开新建对话框
  const openNewDialog = () => {
    setEditingCase(null);
    setUploadedImages([]);
    setIsDialogOpen(true);
  };

  // 删除案例
  const handleDeleteCase = (id: string) => {
    if (confirm('确定要删除这个案例吗？')) {
      deleteCase(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">案例展示</h1>
          <p className="text-muted-foreground mt-1">展示工作室优秀设计作品</p>
        </div>

        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          新建案例
        </Button>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索案例名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={styleFilter} onValueChange={setStyleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="风格筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部风格</SelectItem>
            {allStyles.map(style => (
              <SelectItem key={style} value={style}>{style}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 案例网格 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCases.map((caseItem) => {
          const designer = getDesigner(caseItem.designerId);
          
          return (
            <Card
              key={caseItem.id}
              className="overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* 图片区域 */}
              <div className="relative h-64 bg-muted">
                <Image
                  src={caseItem.images[0]}
                  alt={caseItem.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {caseItem.featured && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      精选
                    </Badge>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    <Eye className="h-3 w-3" />
                    {caseItem.views}
                  </div>
                  <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    <Heart className="h-3 w-3" />
                    {caseItem.likes}
                  </div>
                </div>
              </div>

              {/* 内容区域 */}
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {caseItem.name}
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{caseItem.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 mr-1" />
                    {caseItem.area}㎡ · {caseItem.style}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">设计师：</span>
                    <span className="font-medium">{designer?.name}</span>
                  </div>
                  <Badge variant="outline">{caseItem.style}</Badge>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {caseItem.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedCase(caseItem)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    查看
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(caseItem)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCase(caseItem.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            没有找到匹配的案例，点击&ldquo;新建案例&rdquo;添加
          </div>
        )}
      </div>

      {/* 案例详情弹窗 */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCase && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCase.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* 图片展示 */}
                <div className="grid grid-cols-2 gap-2">
                  {selectedCase.images.map((image, index) => (
                    <div key={index} className="relative h-64 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${selectedCase.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* 基本信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">设计风格</p>
                    <p className="font-medium">{selectedCase.style}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">面积</p>
                    <p className="font-medium">{selectedCase.area}㎡</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">位置</p>
                    <p className="font-medium">{selectedCase.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">设计师</p>
                    <p className="font-medium">
                      {getDesigner(selectedCase.designerId)?.name}
                    </p>
                  </div>
                </div>

                {/* 描述 */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">设计说明</p>
                  <p className="text-foreground leading-relaxed">
                    {selectedCase.description}
                  </p>
                </div>

                {/* 标签 */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">标签</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedCase.views} 浏览</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedCase.likes} 喜欢</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    发布于 {selectedCase.createdAt}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 新建/编辑案例弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingCase ? '编辑案例' : '新建案例'}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 -mx-6 px-6">
            <form action={handleSaveCase} className="space-y-4 py-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">案例名称 *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCase?.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="designer">设计师 *</Label>
                  <Select name="designerId" defaultValue={editingCase?.designerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择设计师" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="style">设计风格 *</Label>
                  <Input
                    id="style"
                    name="style"
                    defaultValue={editingCase?.style}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">面积（㎡）*</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    defaultValue={editingCase?.area}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">项目地址 *</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingCase?.location}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="featured">是否精选</Label>
                  <Select name="featured" defaultValue={editingCase?.featured ? 'true' : 'false'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">是</SelectItem>
                      <SelectItem value="false">否</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">标签（用逗号分隔）</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={editingCase?.tags.join('，')}
                  placeholder="如：住宅，现代简约，大户型"
                />
              </div>

              <div>
                <Label htmlFor="description">设计说明</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingCase?.description}
                  rows={4}
                  placeholder="详细描述这个设计案例的特点和亮点"
                />
              </div>

              {/* 图片上传 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>案例图片（支持多图上传）</Label>
                  <span className="text-xs text-muted-foreground">
                    支持 JPG、PNG、GIF、WebP，单文件最大 10MB
                  </span>
                </div>

                {/* 上传按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        选择图片
                      </>
                    )}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    已选择 {uploadedImages.length} 张图片
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* 已上传图片预览 */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={image.key}
                        className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                      >
                        <Image
                          src={image.url}
                          alt={image.name}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full 
                            opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center">
                            封面
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 空状态提示 */}
                {uploadedImages.length === 0 && (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      点击上方按钮选择图片
                    </p>
                    <p className="text-xs text-muted-foreground">
                      第一张图片将作为封面展示
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingCase(null);
                    setUploadedImages([]);
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  disabled={uploadedImages.length === 0}
                >
                  保存
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
