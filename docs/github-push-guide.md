# 🚀 推送代码到 GitHub - 完整指南

## 📋 情况说明

远程仓库已配置：`https://github.com/klyym/Interior-Design-Studio-Management-System.git`

当前代码已经准备好，需要推送到 GitHub，然后 Vercel 才能获取最新代码。

## 🔑 推送方式（选择一种）

### 方式一：使用 Personal Access Token（推荐）

#### 步骤 1：获取 GitHub Token

1. 访问 https://github.com/settings/tokens
2. 点击 **"Generate new token (classic)"**
3. 勾选以下权限：
   - ✅ `repo` - 完整的仓库访问权限
   - ✅ `workflow` - GitHub Actions 权限（可选）
4. 点击 **"Generate token"**
5. **立即复制**生成的 token（注意：只显示一次！）

#### 步骤 2：推送代码

在本地终端执行：

```bash
# 进入项目目录
cd /workspace/projects

# 使用 Token 推送（替换 YOUR_USERNAME 和 YOUR_TOKEN）
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/klyym/Interior-Design-Studio-Management-System.git
git push -u origin main

# 推送完成后，恢复原始 URL
git remote set-url origin https://github.com/klyym/Interior-Design-Studio-Management-System.git
```

**示例**：
```bash
git remote set-url origin https://klyym:ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/klyym/Interior-Design-Studio-Management-System.git
git push -u origin main
git remote set-url origin https://github.com/klyym/Interior-Design-Studio-Management-System.git
```

---

### 方式二：使用 SSH 密钥

#### 步骤 1：生成 SSH 密钥

```bash
# 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "git@github.com"

# 查看公钥
cat ~/.ssh/id_rsa.pub
```

#### 步骤 2：添加 SSH 密钥到 GitHub

1. 访问 https://github.com/settings/keys
2. 点击 **"New SSH key"**
3. 粘贴公钥内容（`~/.ssh/id_rsa.pub` 的内容）
4. 点击 **"Add SSH key"**

#### 步骤 3：推送代码

```bash
# 切换到 SSH URL
git remote set-url origin git@github.com:klyym/Interior-Design-Studio-Management-System.git

# 推送代码
git push -u origin main
```

---

### 方式三：使用 GitHub CLI

#### 步骤 1：安装 GitHub CLI

```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# 或下载：https://cli.github.com/
```

#### 步骤 2：登录

```bash
gh auth login
```

按照提示完成登录。

#### 步骤 3：推送代码

```bash
git push -u origin main
```

---

## ✅ 推送成功后的步骤

### 1. 验证推送

访问 https://github.com/klyym/Interior-Design-Studio-Management-System

你应该看到：
- 代码文件
- 提交历史
- README.md

### 2. 在 Vercel 中重新连接

#### 方式 A：如果 Vercel 已连接仓库

1. 登录 Vercel Dashboard
2. 进入你的项目
3. 点击 **"Deployments"** 标签
4. 找到最新的部署，点击右侧的 **"..."** 菜单
5. 选择 **"Redeploy"**
6. **勾选 "Skip Build Cache"** 选项
7. 点击 **"Redeploy"**

#### 方式 B：如果 Vercel 未连接仓库

1. 在 Vercel Dashboard 中删除当前项目
2. 重新创建项目，连接 GitHub 仓库
3. 选择 `klyym/Interior-Design-Studio-Management-System`
4. 配置环境变量
5. 点击 **Deploy**

### 3. 配置环境变量（重要！）

在 **Vercel Dashboard** → **Settings** → **Environment Variables** 中添加：

| 名称 | 值 | 环境 |
|------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://你的项目ID.supabase.co` | ✅Prod ✅Prev ✅Dev |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 anon key | ✅Prod ✅Prev ✅Dev |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 service_role key | ✅Prod ✅Prev ✅Dev |

添加后点击 **Save**，然后重新部署。

---

## 🐛 常见问题

### 问题 1：推送失败 - Authentication failed

**解决方案**：
- 检查 Token 是否正确
- 确认 Token 有 `repo` 权限
- 尝试重新生成 Token

### 问题 2：推送失败 - remote origin already exists

**解决方案**：
```bash
# 更新远程仓库 URL
git remote set-url origin https://github.com/klyym/Interior-Design-Studio-Management-System.git

# 重新推送
git push -u origin main
```

### 问题 3：推送失败 - fatal: not a git repository

**解决方案**：
```bash
# 确保在项目根目录
cd /workspace/projects

# 检查 Git 状态
git status
```

---

## 📊 推送成功标志

推送成功后，你会看到：

```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (130/130), 1.2 MiB | 2.5 MiB/s, done.
Total 130 (delta 50), reused 0 (delta 0)
To https://github.com/klyym/Interior-Design-Studio-Management-System.git
   a1b2c3d..e4f5g6h  main -> main
```

---

## 🎯 推送后的完整流程

```
1. 推送代码到 GitHub
   ↓
2. Vercel 自动检测到新代码
   ↓
3. 自动触发构建
   ↓
4. 构建成功（约 2-3 分钟）
   ↓
5. 部署完成，获得预览链接
   ↓
6. 测试功能
   ↓
7. 配置环境变量（如果需要）
   ↓
8. 重新部署
   ↓
9. 🎉 应用上线！
```

---

**选择一种方式推送代码，完成后告诉我结果！** 🚀
