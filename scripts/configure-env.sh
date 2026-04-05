#!/bin/bash

# 环境变量快速配置脚本
# 用途：快速检查和配置 Supabase 环境变量

set -e

echo "========================================="
echo "  环境变量快速配置工具"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查环境变量
check_env_var() {
    local var_name=$1
    if [ -z "${!var_name}" ]; then
        echo -e "${RED}❌ $var_name 未配置${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $var_name 已配置${NC}"
        return 0
    fi
}

echo "1. 检查当前环境变量..."
echo "-----------------------------------"
check_env_var "COZE_SUPABASE_URL"
check_env_var "COZE_SUPABASE_ANON_KEY"
check_env_var "COZE_SUPABASE_SERVICE_ROLE_KEY"
echo ""

echo "2. 检查 .env.local 文件..."
echo "-----------------------------------"
if [ -f "/workspace/projects/.env.local" ]; then
    echo -e "${GREEN}✅ .env.local 文件存在${NC}"
    echo ""
    echo "当前配置："
    grep -E "SUPABASE" /workspace/projects/.env.local || echo "（无 Supabase 配置）"
else
    echo -e "${YELLOW}⚠️  .env.local 文件不存在${NC}"
fi
echo ""

echo "3. 环境变量配置选项..."
echo "-----------------------------------"
echo "请选择配置方式："
echo ""
echo "  1) 在 Coze 平台开通 Supabase 服务（推荐）"
echo "     - 环境变量自动注入"
echo "     - 无需手动配置"
echo "     - 生产环境自动同步"
echo ""
echo "  2) 手动配置 Supabase 环境变量"
echo "     - 需要提供 Supabase 凭证"
echo "     - 适合本地开发"
echo ""
echo "  3) 创建免费的 Supabase 项目"
echo "     - 在 Supabase.com 上创建项目"
echo "     - 适合个人开发者"
echo ""
echo "  4) 跳过，使用 localStorage 模式"
echo "     - 数据保存在浏览器本地"
echo "     - 无需数据库配置"
echo ""
read -p "请输入选项 (1/2/3/4): " choice

case $choice in
    1)
        echo ""
        echo "========================================="
        echo "  在 Coze 平台开通 Supabase 服务"
        echo "========================================="
        echo ""
        echo "步骤："
        echo "1. 登录 Coze 平台工作台"
        echo "2. 进入项目设置 → 集成"
        echo "3. 找到 Supabase 并点击'开通'"
        echo "4. 等待开通完成（几分钟）"
        echo "5. 重启项目"
        echo ""
        echo "开通后，环境变量会自动注入："
        echo "  - COZE_SUPABASE_URL"
        echo "  - COZE_SUPABASE_ANON_KEY"
        echo "  - COZE_SUPABASE_SERVICE_ROLE_KEY"
        echo ""
        echo "重启命令："
        echo "  Ctrl + C"
        echo "  coze dev"
        echo ""
        ;;
    2)
        echo ""
        echo "========================================="
        echo "  手动配置 Supabase 环境变量"
        echo "========================================="
        echo ""
        echo "请提供你的 Supabase 凭证："
        echo ""
        read -p "Supabase Project URL (例如: https://xxx.supabase.co): " supabase_url
        read -p "Supabase Anon Key (例如: eyJhbGc...): " anon_key
        read -p "Supabase Service Role Key (可选，按 Enter 跳过): " service_role_key

        if [ -z "$supabase_url" ] || [ -z "$anon_key" ]; then
            echo -e "${RED}错误: Project URL 和 Anon Key 是必需的${NC}"
            exit 1
        fi

        echo ""
        echo "写入配置到 .env.local..."

        # 检查文件是否存在
        if [ ! -f "/workspace/projects/.env.local" ]; then
            touch /workspace/projects/.env.local
        fi

        # 添加或更新配置
        if grep -q "COZE_SUPABASE_URL" /workspace/projects/.env.local; then
            sed -i "s|^COZE_SUPABASE_URL=.*|COZE_SUPABASE_URL=$supabase_url|" /workspace/projects/.env.local
        else
            echo "COZE_SUPABASE_URL=$supabase_url" >> /workspace/projects/.env.local
        fi

        if grep -q "NEXT_PUBLIC_SUPABASE_URL" /workspace/projects/.env.local; then
            sed -i "s|^NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$supabase_url|" /workspace/projects/.env.local
        else
            echo "NEXT_PUBLIC_SUPABASE_URL=$supabase_url" >> /workspace/projects/.env.local
        fi

        if grep -q "COZE_SUPABASE_ANON_KEY" /workspace/projects/.env.local; then
            sed -i "s|^COZE_SUPABASE_ANON_KEY=.*|COZE_SUPABASE_ANON_KEY=$anon_key|" /workspace/projects/.env.local
        else
            echo "COZE_SUPABASE_ANON_KEY=$anon_key" >> /workspace/projects/.env.local
        fi

        if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" /workspace/projects/.env.local; then
            sed -i "s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon_key|" /workspace/projects/.env.local
        else
            echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon_key" >> /workspace/projects/.env.local
        fi

        if [ -n "$service_role_key" ]; then
            if grep -q "COZE_SUPABASE_SERVICE_ROLE_KEY" /workspace/projects/.env.local; then
                sed -i "s|^COZE_SUPABASE_SERVICE_ROLE_KEY=.*|COZE_SUPABASE_SERVICE_ROLE_KEY=$service_role_key|" /workspace/projects/.env.local
            else
                echo "COZE_SUPABASE_SERVICE_ROLE_KEY=$service_role_key" >> /workspace/projects/.env.local
            fi
        fi

        echo -e "${GREEN}✅ 配置已写入 /workspace/projects/.env.local${NC}"
        echo ""
        echo "下一步："
        echo "1. 停止当前服务: Ctrl + C"
        echo "2. 清理缓存: rm -rf .next"
        echo "3. 重新启动: coze dev"
        echo ""
        ;;
    3)
        echo ""
        echo "========================================="
        echo "  创建免费的 Supabase 项目"
        echo "========================================="
        echo ""
        echo "步骤："
        echo ""
        echo "1. 访问 https://supabase.com"
        echo "2. 使用 GitHub、Google 或邮箱注册"
        echo "3. 点击 'Start your project'"
        echo "4. 填写项目信息："
        echo "   - Name: 设计工作室管理平台"
        echo "   - Database Password: 设置强密码"
        echo "   - Region: 选择最近的区域"
        echo "5. 点击 'Create new project'"
        echo "6. 等待创建完成（1-2 分钟）"
        echo "7. 进入 Settings → API"
        echo "8. 复制以下信息："
        echo "   - Project URL"
        echo "   - anon public key"
        echo "   - service_role secret（可选）"
        echo ""
        echo "获取凭证后，运行此脚本选择选项 2 进行配置"
        echo ""
        ;;
    4)
        echo ""
        echo "========================================="
        echo "  使用 localStorage 模式"
        echo "========================================="
        echo ""
        echo -e "${GREEN}✅ 系统将使用 localStorage 模式${NC}"
        echo ""
        echo "特点："
        echo "  ✅ 无需配置数据库"
        echo "  ✅ 所有功能正常使用"
        echo "  ✅ 数据保存在浏览器本地"
        echo "  ❌ 无法在多设备间同步"
        echo "  ❌ 刷新浏览器数据不会丢失"
        echo ""
        echo "当前应用已自动降级到 localStorage 模式，可以正常使用。"
        echo ""
        ;;
    *)
        echo -e "${RED}无效的选项${NC}"
        exit 1
        ;;
esac

echo "4. 验证配置..."
echo "-----------------------------------"
echo ""
echo "运行以下命令验证配置："
echo ""
echo "  # 检查环境变量"
echo "  env | grep SUPABASE"
echo ""
echo "  # 访问测试接口"
echo "  curl http://localhost:5000/api/debug"
echo ""
echo "  # 查看应用日志"
echo "  tail -f /app/work/logs/bypass/app.log"
echo ""

echo "========================================="
echo "  配置完成"
echo "========================================="
echo ""
echo "详细文档："
echo "  - docs/how-to-configure-env.md"
echo "  - docs/supabase-setup.md"
echo "  - docs/database-write-guide.md"
echo ""
