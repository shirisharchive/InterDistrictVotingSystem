# System Verification Script
# Checks if face recognition integration is ready

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Face Recognition Integration Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Python
Write-Host "[1/8] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found" -ForegroundColor Red
    $allGood = $false
}

# Check Node.js
Write-Host "[2/8] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "[3/8] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "  ✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check PostgreSQL
Write-Host "[4/8] Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>&1
    Write-Host "  ✓ PostgreSQL installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ PostgreSQL CLI not found (may be OK if service is running)" -ForegroundColor Yellow
}

# Check required files
Write-Host "[5/8] Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "face_recognition_using_Opencv\face_recognition_api.py",
    "face_recognition_using_Opencv\requirements.txt",
    "backend\migrations\removePasportAddFaceData.js",
    "backend\electionModel\VoterInfo.js",
    "backend\Controller\voterController.js",
    "backend\Routes\index.js",
    "frontend\pages\voter-login.html",
    "frontend\pages\face-registration.html"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
        $allGood = $false
    }
}

# Check Python packages
Write-Host "[6/8] Checking Python packages..." -ForegroundColor Yellow
$requiredPackages = @("flask", "face_recognition", "opencv-python", "psycopg2")
foreach ($package in $requiredPackages) {
    $installed = pip show $package 2>&1 | Select-String "Name:"
    if ($installed) {
        Write-Host "  ✓ $package installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $package not installed" -ForegroundColor Red
        Write-Host "    Run: pip install $package" -ForegroundColor Yellow
        $allGood = $false
    }
}

# Check Node modules
Write-Host "[7/8] Checking Node.js dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "  ✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠ node_modules not found" -ForegroundColor Yellow
    Write-Host "    Run: cd backend && npm install" -ForegroundColor Yellow
}

# Check documentation
Write-Host "[8/8] Checking documentation..." -ForegroundColor Yellow
$docs = @(
    "FACE_RECOGNITION_INTEGRATION_GUIDE.md",
    "FACE_RECOGNITION_SUMMARY.md",
    "QUICK_START_FACE_RECOGNITION.md"
)
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "  ✓ $doc" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing: $doc" -ForegroundColor Red
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  ✓ System Ready!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Configure database in face_recognition_api.py" -ForegroundColor White
    Write-Host "  2. Run: node backend\migrations\removePasportAddFaceData.js" -ForegroundColor White
    Write-Host "  3. Run: .\start_face_recognition.ps1" -ForegroundColor White
    Write-Host "  4. Register faces at face-registration.html" -ForegroundColor White
    Write-Host "  5. Test login at voter-login.html" -ForegroundColor White
} else {
    Write-Host "  ⚠ Issues Found!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please fix the issues above before proceeding." -ForegroundColor Yellow
    Write-Host "Refer to FACE_RECOGNITION_INTEGRATION_GUIDE.md for help." -ForegroundColor White
}
Write-Host ""
