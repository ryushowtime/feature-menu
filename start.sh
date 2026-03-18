#!/bin/bash

# Feature Menu - 一键启动脚本 (macOS/Linux)
# 使用方法: ./start.sh

set -e

echo "🔮 Feature Menu 启动中..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    npm install
fi

# 启动服务
echo "🚀 启动服务..."
npm run dev &

# 等待服务启动
sleep 3

# 自动打开浏览器
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:3000
elif command -v start &> /dev/null; then
    # Windows (通过 cmd)
    cmd //c start http://localhost:3000
fi

echo "✅ Feature Menu 已启动!"
echo "📍 访问 http://localhost:3000"
echo "按 Ctrl+C 停止服务"
