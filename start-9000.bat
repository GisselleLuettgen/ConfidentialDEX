@echo off
echo 🚀 Starting DeFi Platform on port 9000...
cd /d "%~dp0"

echo 📡 Starting server...
node simple-server.js

pause