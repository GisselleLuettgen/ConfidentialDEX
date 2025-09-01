@echo off
chcp 65001 >nul
cls
echo.
echo ================================================
echo   DeFi Platform - 3022端口 Web3服务器启动
echo ================================================
echo.
echo 正在启动支持MetaMask交互的服务器...
echo 端口: 3022
echo.

cd /d "%~dp0"

REM 检查Node.js是否可用
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js
    echo 请确保已安装 Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 已找到
echo 🚀 启动Web3兼容服务器...
echo.

REM 启动服务器
node web3-server-3022.js

echo.
echo 服务器已停止
pause