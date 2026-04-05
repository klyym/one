# 数据库联动同步机制

## 概述

系统实现了**数据库 + localStorage 双向同步**机制，确保在数据库可用时自动同步数据，在数据库不可用时降级到本地存储。

## 同步策略

### 1. 工作室信息 (StudioInfo)

**数据流**：
```
数据库 ←→ localStorage ←→ 界面
```

**同步时机**：
- **初始化时**：优先从 localStorage 读取（快速展示），然后异步从数据库同步
- **修改时**：同时更新 localStorage 和数据库

**代码位置**：
- 状态管理: `src/lib/studio.tsx`
- 数据库服务: `src/storage/database/services.ts` (studioInfoService)

**降级策略**：
- 数据库不可用时，仅使用 localStorage
- 用户无感知，界面功能正常

### 2. 用户认证 (Auth)

**数据流**：
```
数据库 ←→ localStorage ←→ 登录会话
```

**同步时机**：
- **登录时**：优先使用数据库验证，降级到本地验证
- **修改密码**：同步到数据库和本地存储
- **修改个人信息**：同步到数据库和本地存储

**代码位置**：
- 状态管理: `src/lib/auth.tsx`
- 数据库服务: `src/storage/database/services.ts` (userService)

**降级策略**：
- 数据库不可用时，使用本地存储（DEMO_USERS）
- 支持自定义用户名和邮箱

## 数据库架构

### 表结构

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| studio_info | 工作室基本信息 | name, address, phone, email |
| users | 用户认证 | email, name, role, password_hash |

### RLS 策略

所有表配置为**公开读写**（场景 A），权限控制在应用层实现。

## 使用示例

### 修改工作室信息

```typescript
import { useStudio } from '@/lib/studio';

function SettingsPage() {
  const { studioInfo, updateStudioInfo } = useStudio();
  
  const handleSave = async () => {
    const result = await updateStudioInfo({
      name: '新工作室名称',
      phone: '1234567890'
    });
    
    if (result.success) {
      alert('保存成功！已同步到数据库');
    }
  };
  
  return <button onClick={handleSave}>保存</button>;
}
```

### 用户登录

```typescript
import { useAuth } from '@/lib/auth';

function LoginPage() {
  const { login } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    
    if (result.success) {
      console.log('登录成功，已从数据库验证');
      // 数据库不可用时也会成功（降级到本地验证）
    } else {
      alert(result.message);
    }
  };
  
  return <button onClick={() => handleLogin('admin@studio.com', 'admin123')}>
    登录
  </button>;
}
```

## 迁移指南

### 从 localStorage 迁移到数据库

系统已实现自动迁移，无需手动操作：

1. **首次使用**：应用启动时自动初始化数据库
2. **现有数据**：自动从 localStorage 同步到数据库
3. **增量同步**：后续修改自动双向同步

### 查看同步状态

```typescript
import { useStudio } from '@/lib/studio';

function Component() {
  const { studioInfo, isLoading, error } = useStudio();
  
  if (isLoading) {
    return <div>正在从数据库同步数据...</div>;
  }
  
  if (error) {
    return <div>数据库不可用，使用本地存储</div>;
  }
  
  return <div>{studioInfo.name}</div>;
}
```

## 注意事项

1. **密码安全**：当前密码以明文存储，生产环境应使用 bcrypt 哈希
2. **数据一致性**：数据库和 localStorage 保持同步，优先以数据库为准
3. **离线支持**：数据库不可用时，系统自动降级到本地存储
4. **错误处理**：所有数据库操作都有完善的错误处理和降级策略

## 故障排查

### 数据未同步

1. 检查浏览器控制台是否有错误日志
2. 检查 Supabase 连接是否正常
3. 查看数据库服务日志：`tail -n 50 /app/work/logs/bypass/app.log`

### 降级到本地存储

这是正常行为，不影响使用：

- 应用启动时会尝试连接数据库
- 失败时自动降级到 localStorage
- 用户无感知，所有功能正常

### 手动初始化数据库

```typescript
import { initAppDatabase } from '@/storage/database/init';

// 在控制台或代码中执行
await initAppDatabase();
```
