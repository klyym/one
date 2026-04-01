'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Heart, Star, MapPin, Ruler } from 'lucide-react';
import Image from 'next/image';
import type { DesignCase } from '@/types';

export default function CasesPage() {
  const { cases, designers, projects } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<DesignCase | null>(null);
  const [styleFilter, setStyleFilter] = useState<string>('all');

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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">案例展示</h1>
        <p className="text-muted-foreground mt-1">展示工作室优秀设计作品</p>
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
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedCase(caseItem)}
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
              </CardContent>
            </Card>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            没有找到匹配的案例
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
    </div>
  );
}
