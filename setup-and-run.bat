@echo off
SETLOCAL

:: Colors for echo
set GREEN=[32m
set RESET=[0m

echo %GREEN%🚀 Starting FileHub Project Setup...%RESET%

:: Step 1: Backend Setup
echo %GREEN%📦 Installing backend dependencies...%RESET%
cd backend
if exist node_modules (
    echo Dependencies already installed.
) else (
    npm install
)

:: Step 2: PostgreSQL Table Info
echo %GREEN%📋 Ensure this table exists in PostgreSQL:%RESET%
echo.
echo CREATE TABLE IF NOT EXISTS files (
echo   id SERIAL PRIMARY KEY,
echo   filename TEXT NOT NULL,
echo   mimetype TEXT NOT NULL,
echo   filedata BYTEA NOT NULL
echo );
echo.

:: Step 3: Start Backend Server
echo %GREEN%⚙️  Starting backend on port 5000...%RESET%
start cmd /k "npm start"
cd ..

:: Step 4: Frontend Setup
echo %GREEN%📦 Installing frontend dependencies...%RESET%
cd frontend
if exist node_modules (
    echo Dependencies already installed.
) else (
    npm install
)

:: Step 5: Start Frontend Server
echo %GREEN%⚙️  Starting frontend on port 3000...%RESET%
start cmd /k "npm start"
cd ..

:: Done
echo.
echo %GREEN%✅ FileHub is now running!%RESET%
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo Swagger:  http://localhost:5000/api-docs

ENDLOCAL
pause
