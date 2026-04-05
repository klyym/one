# Supabase 数据库初始化指南

## 快速开始

### 步骤 1：打开 Supabase Dashboard

访问：https://supabase.com/dashboard/project/tqevyjsgvoqfvzougeuc

### 步骤 2：打开 SQL Editor

1. 点击左侧菜单的 **SQL Editor**（图标是 `< >`）
2. 点击 **New query** 按钮

### 步骤 3：执行初始化脚本

有两种方式：

#### 方式 1：直接复制粘贴（推荐）

1. 打开文件：`/workspace/projects/scripts/init-database.sql`
2. 复制全部内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 按钮（或按 Ctrl+Enter）

#### 方式 2：使用快速命令

```bash
# 查看初始化脚本
cat /workspace/projects/scripts/init-database.sql

# 或者直接复制
cat /workspace/projects/scripts/init-database.sql | pbcopy  # macOS
cat /workspace/projects/scripts/init-database.sql | xclip -sel clip  # Linux
```

### 步骤 4：验证表创建成功

执行完成后，你应该看到类似这样的输出：

```
Success. No rows returned
```

然后在左侧菜单的 **Table Editor** 中，你应该能看到以下 9 张表：

```
✅ studio_info       - 工作室信息
✅ users             - 用户
✅ clients           - 客户
✅ designers         - 设计师
✅ projects          - 项目
✅ project_phases    - 项目阶段
✅ design_cases      - 设计案例
✅ follow_ups        - 跟进记录
✅ health_check      - 健康检查
```

### 步骤 5：刷新应用

执行完 SQL 脚本后：

1. 回到你的应用页面：`http://localhost:5000`
2. 按 **F5** 刷新页面
3. 打开浏览器控制台（F12），查看日志

**成功的日志**：
```
✅ 数据库初始化成功
✅ 工作室信息已从数据库加载
✅ 用户数据已从数据库加载
```

**失败的日志**：
```
❌ 数据库初始化失败，使用本地存储
```

### 步骤 6：测试数据库连接

访问测试接口：

```bash
curl http://localhost:5000/api/debug
```

**成功响应**：
```json
{
  "success": true,
  "message": "数据库连接成功",
  "database": {
    "healthCheck": [{"id": 1, "updated_at": "..."}],
    "studioInfo": [{
      "id": 1,
      "name": "室内设计工作室",
      "address": "北京市朝阳区",
      ...
    }]
  }
}
```

## 初始化脚本说明

`scripts/init-database.sql` 包含：

### 创建的表（9张）

1. **studio_info** - 工作室基本信息
2. **users** - 用户（管理员、设计师）
3. **clients** - 客户信息
4. **designers** - 设计师信息
5. **projects** - 项目信息
6. **project_phases** - 项目阶段进度
7. **design_cases** - 设计案例
8. **follow_ups** - 跟进记录
9. **health_check** - 系统健康检查

### 初始数据

脚本会自动插入：
- 健康检查记录
- 默认工作室信息（可在应用中修改）

### 索引

为常用查询字段创建索引，优化性能。

## 常见问题

### Q1: 执行 SQL 脚本时报错怎么办？

**A**: 检查错误信息：
- 如果是 "table already exists" - 没问题，脚本会跳过已存在的表
- 如果是 "permission denied" - 检查你的 Supabase 账号权限
- 如果是 "syntax error" - 确保复制了完整的脚本

### Q2: 如何确认表创建成功？

**A**: 三种方法：

**方法 1：在 Supabase Dashboard 查看**
- 左侧菜单 → Table Editor
- 应该能看到 9 张表

**方法 2：执行查询 SQL**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**方法 3：在应用中测试**
- 访问 `http://localhost:5000/api/debug`
- 查看是否返回成功

### Q3: 执行后应用还是显示"数据库初始化失败"？

**A**: 检查以下几点：

1. **刷新页面**：按 F5 或 Ctrl+R
2. **清除缓存**：
   - 打开浏览器控制台（F12）
   - 右键点击刷新按钮
   - 选择"清空缓存并硬性重新加载"
3. **检查环境变量**：
   ```bash
   cat /workspace/projects/.env.local | grep SUPABASE
   ```
4. **重启应用**：
   ```bash
   Ctrl + C
   rm -rf .next
   coze dev
   ```

### Q4: 需要重新执行脚本吗？

**A**: 不需要。脚本使用了 `IF NOT EXISTS` 语法，可以重复执行而不会报错。

### Q5: 如何清空所有数据重新开始？

**A**: 在 SQL Editor 中执行：

```sql
-- 警告：这将删除所有数据！
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS design_cases CASCADE;
DROP TABLE IF EXISTS project_phases CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS designers CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS studio_info CASCADE;
DROP TABLE IF EXISTS health_check CASCADE;

-- 然后重新执行初始化脚本
```

## 配置总结

### 已完成的配置 ✅

1. ✅ 环境变量已配置（.env.local）
2. ✅ Supabase 凭证已填写
3. ✅ 应用已重启
4. ✅ 初始化脚本已准备

### 待完成的操作 ⏳

1. ⏳ 在 Supabase Dashboard 中执行初始化脚本
2. ⏳ 验证表创建成功
3. ⏳ 刷新应用页面
4. ⏳ 测试数据库连接

### 配置信息

```bash
# Supabase 项目 URL
https://tqevyjsgvoqfvzougeuc.supabase.co

# Supabase Dashboard
https://supabase.com/dashboard/project/tqevyjsgvoqfvzougeuc

# 应用访问地址
http://localhost:5000

# 测试接口
http://localhost:5000/api/debug
```

## 下一步

完成数据库初始化后：

1. **登录系统**
   - 邮箱：admin@studio.com
   - 密码：admin123

2. **修改工作室信息**
   - 进入"系统设置"
   - 修改工作室名称、地址、联系方式等

3. **添加数据**
   - 添加客户
   - 添加设计师
   - 创建项目

## 获取帮助

如果遇到问题：

1. 查看浏览器控制台日志（F12）
2. 查看应用日志：`tail -f /app/work/logs/bypass/app.log`
3. 检查 Supabase Dashboard 中的表结构
4. 参考其他文档：
   - `docs/supabase-setup.md`
   - `docs/database-write-guide.md`
   - `docs/how-to-configure-env.md`

---

**提示**: 只需执行一次初始化脚本，之后应用就会自动连接数据库！
