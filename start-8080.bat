@echo off
echo Starting DeFi Platform on port 8080...
cd /d "%~dp0frontend"

echo Starting HTTP server on port 8080...
echo Open your browser and go to: http://localhost:8080
start http://localhost:8080
python -m http.server 8080

pause