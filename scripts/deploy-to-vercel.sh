#!/bin/bash

# Vercel 部署脚本
# 用于快速部署室内设计工作室管理系统到 Vercel

set -e

echo "======================================"
echo "  室内设计工作室管理系统 - Vercel 部署"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ 错误: 未找到 $1 命令${NC}"
        echo -e "${YELLOW}请先安装 $1${NC}"
        exit 1
    fi
}

# 检查必需命令
echo "📋 检查必需工具..."
check_command "node"
check_command "pnpm"
check_command "git"

echo -e "${GREEN}✅ 所有必需工具已安装${NC}"
echo ""

# 检查环境变量
echo "📋 检查环境变量..."
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  警告: 未找到 .env.local 文件${NC}"
    echo ""
    echo "请先创建 .env.local 文件并配置以下环境变量："
    echo "  NEXT_PUBLIC_SUPABASE_URL"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    read -p "是否继续部署？(y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ 环境变量文件已找到${NC}"
fi
echo ""

# 检查 Git 仓库
echo "📋 检查 Git 仓库..."
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  警告: 未找到 .git 目录${NC}"
    echo ""
    echo "正在初始化 Git 仓库..."
    git init
    git add .
    git commit -m "feat: 初始化项目"
    echo -e "${GREEN}✅ Git 仓库已初始化${NC}"
else
    echo -e "${GREEN}✅ Git 仓库已存在${NC}"
fi
echo ""

# 运行构建测试
echo "📋 运行构建测试..."
echo "这可能需要几分钟，请耐心等待..."
echo ""
if pnpm run build; then
    echo -e "${GREEN}✅ 构建成功${NC}"
else
    echo -e "${RED}❌ 构建失败${NC}"
    echo "请检查错误信息并修复后重试"
    exit 1
fi
echo ""

# 检查 Vercel CLI
echo "📋 检查 Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  未找到 Vercel CLI${NC}"
    echo ""
    read -p "是否安装 Vercel CLI？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "正在安装 Vercel CLI..."
        pnpm add -g vercel
        echo -e "${GREEN}✅ Vercel CLI 已安装${NC}"
    else
        echo "请手动安装 Vercel CLI: pnpm add -g vercel"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Vercel CLI 已安装${NC}"
fi
echo ""

# 部署到 Vercel
echo "======================================"
echo "  开始部署到 Vercel"
echo "======================================"
echo ""

# 询问部署环境
echo "请选择部署环境："
echo "  1) 预览环境 (Preview)"
echo "  2) 生产环境 (Production)"
echo ""
read -p "请输入选项 (1/2): " deploy_option

if [ "$deploy_option" = "1" ]; then
    echo ""
    echo "正在部署到预览环境..."
    vercel
elif [ "$deploy_option" = "2" ]; then
    echo ""
    echo "正在部署到生产环境..."
    vercel --prod
else
    echo -e "${RED}❌ 无效选项${NC}"
    exit 1
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "======================================"
echo ""
echo "📝 后续步骤："
echo "  1. 访问 Vercel Dashboard 配置环境变量"
echo "  2. 确保以下环境变量已配置："
echo "     - NEXT_PUBLIC_SUPABASE_URL"
echo "     - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "     - SUPABASE_SERVICE_ROLE_KEY"
echo "  3. 重新部署以应用环境变量"
echo "  4. 测试所有功能是否正常"
echo ""
echo "📚 相关文档："
echo "  - 部署检查清单: docs/vercel-deployment-checklist.md"
echo "  - 环境变量指南: docs/environment-variables-guide.md"
echo ""
