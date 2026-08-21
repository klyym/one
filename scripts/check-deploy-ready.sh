#!/bin/bash

# 部署前状态检查脚本
# 用于验证项目是否准备好部署到 Vercel

echo "======================================"
echo "  部署前状态检查"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 统计变量
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# 检查函数
check_item() {
    local name=$1
    local command=$2
    local critical=$3

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -n "检查 $name... "

    if eval $command &> /dev/null; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        if [ "$critical" = "true" ]; then
            echo -e "${RED}❌ 失败${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        else
            echo -e "${YELLOW}⚠️  警告${NC}"
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
        fi
        return 1
    fi
}

echo "📋 环境检查"
echo "--------------------------------------"

check_item "Node.js" "command -v node" "true"
check_item "pnpm" "command -v pnpm" "true"
check_item "Git" "command -v git" "true"
check_item "Git 仓库" "test -d .git" "false"
check_item ".env.local 文件" "test -f .env.local" "true"
check_item "vercel.json 配置" "test -f vercel.json" "true"

echo ""
echo "📋 文件检查"
echo "--------------------------------------"

check_item "package.json" "test -f package.json" "true"
check_item "tsconfig.json" "test -f tsconfig.json" "true"
check_item "next.config.ts" "test -f next.config.ts" "true"
check_item ".vercelignore" "test -f .vercelignore" "false"

echo ""
echo "📋 代码检查"
echo "--------------------------------------"

check_item "src 目录" "test -d src" "true"
check_item "app 目录" "test -d src/app" "true"
check_item "components 目录" "test -d src/components" "true"

echo ""
echo "📋 数据库配置检查"
echo "--------------------------------------"

if [ -f .env.local ]; then
    check_item "NEXT_PUBLIC_SUPABASE_URL" "grep -q NEXT_PUBLIC_SUPABASE_URL .env.local" "true"
    check_item "NEXT_PUBLIC_SUPABASE_ANON_KEY" "grep -q NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local" "true"
    check_item "SUPABASE_SERVICE_ROLE_KEY" "grep -q SUPABASE_SERVICE_ROLE_KEY .env.local" "true"
else
    echo -e "${RED}❌ .env.local 文件不存在，跳过环境变量检查${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 3))
fi

echo ""
echo "📋 构建测试"
echo "--------------------------------------"

echo "正在运行构建测试..."
if pnpm run build &> /tmp/build-test.log 2>&1; then
    echo -e "${GREEN}✅ 构建成功${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -e "${RED}❌ 构建失败${NC}"
    echo ""
    echo "构建日志："
    tail -n 20 /tmp/build-test.log
    echo ""
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

echo ""
echo "======================================"
echo "  检查结果汇总"
echo "======================================"
echo ""
echo "总检查项: $TOTAL_CHECKS"
echo -e "${GREEN}✅ 通过: $PASSED_CHECKS${NC}"
echo -e "${YELLOW}⚠️  警告: $WARNING_CHECKS${NC}"
echo -e "${RED}❌ 失败: $FAILED_CHECKS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有必需检查通过！项目已准备好部署。${NC}"
    echo ""
    echo "下一步："
    echo "  1. 运行部署脚本: pnpm deploy"
    echo "  2. 或手动部署: vercel"
    echo ""
    exit 0
else
    echo -e "${RED}❌ 发现 $FAILED_CHECKS 个问题，请修复后再部署。${NC}"
    echo ""
    echo "解决方案："
    echo "  1. 查看上面的检查结果"
    echo "  2. 修复所有失败项"
    echo "  3. 重新运行此脚本验证"
    echo ""
    exit 1
fi
