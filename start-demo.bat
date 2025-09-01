@echo off
echo ================================
echo  Zama Confidential FundPad Demo
echo ================================
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..
if errorlevel 1 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Compiling smart contracts...
call npx hardhat compile
if errorlevel 1 (
    echo Failed to compile contracts
    pause
    exit /b 1
)

echo.
echo Running tests...
call npx hardhat test
if errorlevel 1 (
    echo Tests failed
    pause
    exit /b 1
)

echo.
echo ================================
echo  Starting Zama FundPad on port 3022
echo ================================
echo.
echo Opening browser to http://localhost:3022
echo.
echo Features:
echo - Confidential fundraising with FHE
echo - Private DEX trading
echo - MetaMask integration
echo - Complete privacy protection
echo.

timeout /t 3 >nul

start "" "http://localhost:3022"

echo Starting frontend server...
call npm start