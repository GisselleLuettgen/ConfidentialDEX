@echo off
echo Opening DeFi Platform directly...
cd /d "%~dp0frontend"

echo Opening standalone HTML file...
start "" "%CD%\standalone.html"

echo Opening main index file...
start "" "%CD%\index.html"

echo Files opened directly in browser
pause