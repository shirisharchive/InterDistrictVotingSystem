# Face Recognition Integration - Quick Start Script
# Run this script to start all services

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Voting System - Face Recognition Integration   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found! Please install Python 3.7+" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found! Please install Node.js" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Step 1: Run Database Migration" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$runMigration = Read-Host "Do you want to run database migration? (Y/N)"
if ($runMigration -eq "Y" -or $runMigration -eq "y") {
    Write-Host "Running migration..." -ForegroundColor Yellow
    Set-Location backend
    node migrations/removePasportAddFaceData.js
    Set-Location ..
    Write-Host ""
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Step 2: Install Python Dependencies" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$installPython = Read-Host "Do you want to install Python dependencies? (Y/N)"
if ($installPython -eq "Y" -or $installPython -eq "y") {
    Write-Host "Installing Python packages..." -ForegroundColor Yellow
    Set-Location face_recognition_using_Opencv
    pip install -r requirements.txt
    Set-Location ..
    Write-Host "✓ Python dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Step 3: Configure Database Connection" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Edit face_recognition_using_Opencv/face_recognition_api.py" -ForegroundColor Yellow
Write-Host "Update DB_CONFIG with your database credentials:" -ForegroundColor Yellow
Write-Host "  - database: 'voting_system_db'" -ForegroundColor White
Write-Host "  - user: 'postgres'" -ForegroundColor White
Write-Host "  - password: 'your_password'" -ForegroundColor White
Write-Host ""

$configured = Read-Host "Have you configured the database connection? (Y/N)"
if ($configured -ne "Y" -and $configured -ne "y") {
    Write-Host "Please configure the database before continuing" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Step 4: Start Services" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting services in separate terminals..." -ForegroundColor Yellow
Write-Host ""

# Start Face Recognition API
Write-Host "1. Starting Face Recognition API (Port 5001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\face_recognition_using_Opencv'; Write-Host 'Face Recognition API' -ForegroundColor Cyan; python face_recognition_api.py"

Start-Sleep -Seconds 2

# Start Backend Server
Write-Host "2. Starting Backend Server (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server' -ForegroundColor Cyan; npm start"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✓ All Services Started!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services Running:" -ForegroundColor Yellow
Write-Host "  • Face Recognition API: http://localhost:5001" -ForegroundColor White
Write-Host "  • Backend Server: http://localhost:3000" -ForegroundColor White
Write-Host "  • Frontend: Open frontend/pages/voter-login.html" -ForegroundColor White
Write-Host ""
Write-Host "Admin Tools:" -ForegroundColor Yellow
Write-Host "  • Face Registration: frontend/pages/face-registration.html" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Register voter faces using face-registration.html" -ForegroundColor White
Write-Host "  2. Test login at voter-login.html" -ForegroundColor White
Write-Host "  3. Review FACE_RECOGNITION_INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in service windows to stop them" -ForegroundColor Cyan
Write-Host ""
