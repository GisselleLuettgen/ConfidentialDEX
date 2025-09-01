@echo off
echo Starting DeFi Platform on port 3022...
cd /d "%~dp0frontend"

echo Starting simple HTTP server on port 3022...
start http://localhost:3022
node server.js

pause