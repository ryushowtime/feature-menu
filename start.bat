@echo off
chcp 65001 >nul
title Feature Menu

echo 🔮 Feature Menu 启动中...
echo.

cd /d "%~dp0"

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖
if not exist "node_modules" (
    echo 📦 首次运行，安装依赖...
    call npm install
)

echo 🚀 启动服务...
start http://localhost:3000
npm run dev

echo.
echo ✅ Feature Menu 已启动!
echo 📍 访问 http://localhost:3000
echo 按 Ctrl+C 停止服务
