@echo off
echo.
echo ========================================
echo    DeFi Platform - 一键启动
echo ========================================
echo.
echo 正在打开DeFi平台网页...
echo.

REM 先打开简单测试页面确认浏览器工作
start "" "%~dp0frontend\简单测试.html"
echo ✅ 简单测试页面已打开

REM 等待2秒后打开完整平台
timeout /t 2 /nobreak >nul
start "" "%~dp0frontend\完整DeFi平台.html"
echo ✅ 完整DeFi平台已打开

REM 提供备选方案
echo.
echo 如果网页无法显示，请手动尝试：
echo 1. 双击: frontend\完整DeFi平台.html
echo 2. 双击: frontend\简单测试.html
echo 3. 双击: frontend\本地版本.html
echo.

pause