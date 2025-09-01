@echo off
chcp 65001 >nul
echo 🚀 DeFi Platform - 最终解决方案
echo.
echo 正在打开本地版本...
echo.

REM 打开本地HTML文件
start "" "%~dp0frontend\本地版本.html"

echo ✅ 本地版本已打开
echo.
echo 如果需要HTTP服务器版本，请选择：
echo 1. 本地文件版本 (推荐，已打开)
echo 2. HTTP服务器版本 (端口9000)
echo.
set /p choice=请选择 (1或2): 

if "%choice%"=="2" (
    echo.
    echo 正在启动HTTP服务器...
    cd /d "%~dp0"
    start http://localhost:9000
    node simple-server.js
) else (
    echo.
    echo 使用本地文件版本完成！
    echo 网页地址: file:///%~dp0frontend/本地版本.html
)

pause