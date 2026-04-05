#!/bin/bash

# GitHub 代码推送辅助脚本

echo "======================================"
echo "  GitHub 代码推送"
echo "======================================"
echo ""

# 检查远程仓库
if ! git remote get-url origin &> /dev/null; then
    echo "正在配置远程仓库..."
    git remote add origin https://github.com/klyym/Interior-Design-Studio-Management-System.git
    echo "✅ 远程仓库已配置"
fi

echo ""
echo "当前远程仓库："
git remote -v

echo ""
echo "======================================"
echo "  推送代码到 GitHub"
echo "======================================"
echo ""
echo "请选择身份验证方式："
echo "  1) 使用 Personal Access Token (推荐)"
echo "  2) 使用 SSH 密钥"
echo "  3) 使用 GitHub CLI"
echo ""
read -p "请选择方式 (1/2/3): " auth_method

if [ "$auth_method" = "1" ]; then
    echo ""
    echo "======================================"
    echo "  使用 Personal Access Token"
    echo "======================================"
    echo ""
    echo "请按照以下步骤获取 GitHub Token："
    echo ""
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token (classic)'"
    echo "3. 勾选 'repo' 权限"
    echo "4. 点击 'Generate token'"
    echo "5. 复制生成的 token（注意：只显示一次）"
    echo ""
    read -p "请输入你的 GitHub Token: " github_token
    read -p "请输入你的 GitHub 用户名: " github_username

    echo ""
    echo "正在推送代码..."
    echo ""

    # 使用 token 推送
    git remote set-url origin https://${github_username}:${github_token}@github.com/klyym/Interior-Design-Studio-Management-System.git
    git push -u origin main

    # 恢复原始 URL
    git remote set-url origin https://github.com/klyym/Interior-Design-Studio-Management-System.git

elif [ "$auth_method" = "2" ]; then
    echo ""
    echo "======================================"
    echo "  使用 SSH 密钥"
    echo "======================================"
    echo ""
    echo "检查 SSH 密钥..."

    if [ ! -f ~/.ssh/id_rsa ]; then
        echo "未找到 SSH 密钥，正在生成..."
        ssh-keygen -t rsa -b 4096 -C "git@github.com" -f ~/.ssh/id_rsa -N ""
        echo ""
        echo "✅ SSH 密钥已生成"
        echo ""
        echo "请将以下公钥添加到 GitHub："
        echo "--------------------------------------"
        cat ~/.ssh/id_rsa.pub
        echo "--------------------------------------"
        echo ""
        echo "添加步骤："
        echo "1. 访问 https://github.com/settings/keys"
        echo "2. 点击 'New SSH key'"
        echo "3. 粘贴上面的公钥"
        echo "4. 点击 'Add SSH key'"
        echo ""
        read -p "添加完成后按回车继续..." dummy
    fi

    echo ""
    echo "切换到 SSH URL..."
    git remote set-url origin git@github.com:klyym/Interior-Design-Studio-Management-System.git

    echo ""
    echo "正在推送代码..."
    git push -u origin main

elif [ "$auth_method" = "3" ]; then
    echo ""
    echo "======================================"
    echo "  使用 GitHub CLI"
    echo "======================================"
    echo ""

    if ! command -v gh &> /dev/null; then
        echo "未找到 GitHub CLI，正在安装..."
        echo "请参考：https://cli.github.com/"
        exit 1
    fi

    if ! gh auth status &> /dev/null; then
        echo "需要登录 GitHub..."
        gh auth login
    fi

    echo ""
    echo "正在推送代码..."
    git push -u origin main
else
    echo "无效选项"
    exit 1
fi

echo ""
if [ $? -eq 0 ]; then
    echo "======================================"
    echo "  ✅ 代码推送成功！"
    echo "======================================"
    echo ""
    echo "下一步："
    echo "  1. 访问 https://github.com/klyym/Interior-Design-Studio-Management-System"
    echo "  2. 在 Vercel 中重新连接仓库或等待自动部署"
    echo "  3. 配置 Vercel 环境变量（NEXT_PUBLIC_SUPABASE_URL 等）"
    echo ""
else
    echo "======================================"
    echo "  ❌ 代码推送失败"
    echo "======================================"
    echo ""
    echo "请检查："
    echo "  1. GitHub Token 是否正确"
    echo "  2. 网络连接是否正常"
    echo "  3. 仓库地址是否正确"
    echo ""
    exit 1
fi
