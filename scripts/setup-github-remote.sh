#!/bin/bash

# 简化的 GitHub 推送脚本

echo "======================================"
echo "  GitHub 代码推送助手"
echo "======================================"
echo ""

# 检查远程仓库
if git remote get-url origin &> /dev/null; then
    CURRENT_URL=$(git remote get-url origin)
    echo "当前远程仓库：$CURRENT_URL"
    echo ""
fi

# 配置远程仓库
echo "配置远程仓库..."
git remote set-url origin https://github.com/klyym/Interior-Design-Studio-Management-System.git
echo "✅ 远程仓库已配置"
echo ""

# 显示推送命令
echo "======================================"
echo "  推送代码到 GitHub"
echo "======================================"
echo ""
echo "请在本地终端执行以下命令："
echo ""
echo "# 1. 进入项目目录"
echo "cd /workspace/projects"
echo ""
echo "# 2. 获取 GitHub Token（访问 https://github.com/settings/tokens）"
echo ""
echo "# 3. 使用 Token 推送（替换 YOUR_USERNAME 和 YOUR_TOKEN）"
echo "git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/klyym/Interior-Design-Studio-Management-System.git"
echo "git push -u origin main"
echo "git remote set-url origin https://github.com/klyym/Interior-Design-Studio-Management-System.git"
echo ""
echo "或者使用交互式脚本："
echo "bash scripts/push-to-github.sh"
echo ""
echo "详细指南：docs/github-push-guide.md"
echo ""
