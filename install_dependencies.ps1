# ============================================================
# Face Recognition System - Complete Dependency Installer
# For Windows with PostgreSQL
# ============================================================

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Face Recognition System - Dependency Installer" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check Prerequisites
Write-Host "[Step 1/6] Checking Prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Python
if (Test-CommandExists python) {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Python not found!" -ForegroundColor Red
    Write-Host "    Please install Python 3.8+ from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "    Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    exit 1
}

# Check pip
if (Test-CommandExists pip) {
    $pipVersion = pip --version 2>&1
    Write-Host "  ✓ pip installed: $pipVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ pip not found!" -ForegroundColor Red
    Write-Host "    Run: python -m ensurepip --upgrade" -ForegroundColor Yellow
    exit 1
}

# Check PostgreSQL
if (Test-CommandExists psql) {
    $pgVersion = psql --version 2>&1
    Write-Host "  ✓ PostgreSQL installed: $pgVersion" -ForegroundColor Green
} else {
    Write-Host "  ⚠ PostgreSQL CLI not found (Service may still be running)" -ForegroundColor Yellow
    Write-Host "    If PostgreSQL is not installed, download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "[Step 2/6] Upgrading pip and setuptools..." -ForegroundColor Yellow
Write-Host ""

python -m pip install --upgrade pip setuptools wheel

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ pip upgraded successfully" -ForegroundColor Green
} else {
    Write-Host "  ⚠ pip upgrade had warnings (continuing...)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "[Step 3/6] Installing CMake (required for dlib)..." -ForegroundColor Yellow
Write-Host ""

pip install cmake

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ CMake installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ CMake installation had issues" -ForegroundColor Yellow
    Write-Host "    You may need to install Visual C++ Build Tools" -ForegroundColor Yellow
    Write-Host "    Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "[Step 4/6] Installing Core Dependencies..." -ForegroundColor Yellow
Write-Host ""

$coreDeps = @(
    "numpy==1.24.3",
    "Pillow==10.0.0",
    "scipy==1.11.2"
)

foreach ($dep in $coreDeps) {
    Write-Host "  Installing $dep..." -ForegroundColor White
    pip install $dep
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $dep installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install $dep" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "[Step 5/6] Installing Computer Vision Libraries..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes. Please be patient..." -ForegroundColor Yellow
Write-Host ""

# Install OpenCV
Write-Host "  Installing OpenCV..." -ForegroundColor White
pip install opencv-python==4.8.0.76
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ OpenCV installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ OpenCV installation failed" -ForegroundColor Red
}
Write-Host ""

# Install dlib (this can take a while)
Write-Host "  Installing dlib (this may take 5-10 minutes)..." -ForegroundColor White
Write-Host "  Compiling C++ extensions..." -ForegroundColor Yellow
pip install dlib==19.24.2
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ dlib installed successfully" -ForegroundColor Green
} else {
    Write-Host "  ✗ dlib installation failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Common solutions:" -ForegroundColor Yellow
    Write-Host "  1. Install Visual C++ Build Tools:" -ForegroundColor White
    Write-Host "     https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor Cyan
    Write-Host "  2. Or use pre-built wheel from:" -ForegroundColor White
    Write-Host "     https://github.com/sachadee/Dlib" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Continue with remaining packages? (Y/N)"
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit 1
    }
}
Write-Host ""

# Install face_recognition
Write-Host "  Installing face_recognition..." -ForegroundColor White
pip install face_recognition==1.3.0
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ face_recognition installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ face_recognition installation failed" -ForegroundColor Red
}
Write-Host ""

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "[Step 6/6] Installing Web Framework & Database..." -ForegroundColor Yellow
Write-Host ""

$webDeps = @(
    "flask==2.3.3",
    "flask-cors==4.0.0",
    "psycopg2-binary==2.9.7"
)

foreach ($dep in $webDeps) {
    Write-Host "  Installing $dep..." -ForegroundColor White
    pip install $dep
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $dep installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install $dep" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Verifying Installation..." -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Test imports
$testScript = @"
try:
    import flask
    import flask_cors
    import face_recognition
    import cv2
    import numpy
    import PIL
    import psycopg2
    import dlib
    import scipy
    print('✓ All packages imported successfully!')
    print('\nPackage versions:')
    print(f'  Flask: {flask.__version__}')
    print(f'  OpenCV: {cv2.__version__}')
    print(f'  NumPy: {numpy.__version__}')
    print(f'  PIL: {PIL.__version__}')
    print(f'  psycopg2: {psycopg2.__version__}')
    print(f'  dlib: {dlib.__version__}')
    print(f'  scipy: {scipy.__version__}')
except ImportError as e:
    print(f'✗ Import failed: {e}')
    exit(1)
"@

$testScript | python

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Testing PostgreSQL Connection..." -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$dbTestScript = @"
import psycopg2
import sys

# Default PostgreSQL configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'postgres',  # Connect to default DB first
    'user': 'postgres',
    'password': 'postgres',
    'port': 5432
}

print('Testing PostgreSQL connection...')
print(f'Host: {DB_CONFIG[\"host\"]}')
print(f'Port: {DB_CONFIG[\"port\"]}')
print(f'User: {DB_CONFIG[\"user\"]}')
print()

try:
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute('SELECT version();')
    version = cursor.fetchone()[0]
    print('✓ PostgreSQL connection successful!')
    print(f'  Version: {version.split(\",\")[0]}')
    cursor.close()
    conn.close()
except Exception as e:
    print(f'✗ PostgreSQL connection failed: {e}')
    print()
    print('Please check:')
    print('  1. PostgreSQL service is running')
    print('  2. Default username/password is correct')
    print('  3. Port 5432 is not blocked')
    print()
    print('To check service status:')
    print('  Get-Service postgresql*')
    print()
    sys.exit(1)
"@

$dbTestScript | python

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Installation Summary" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# List installed packages
Write-Host "Installed packages:" -ForegroundColor Yellow
pip list | Select-String -Pattern "flask|face-recognition|opencv|numpy|pillow|psycopg2|dlib|scipy|cmake"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "✓ Installation Complete!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure Database Connection:" -ForegroundColor White
Write-Host "   Edit: face_recognition_using_Opencv\face_recognition_api.py" -ForegroundColor Cyan
Write-Host "   Update DB_CONFIG with your PostgreSQL credentials" -ForegroundColor White
Write-Host ""
Write-Host "2. Download Facial Landmark Model (for liveness detection):" -ForegroundColor White
Write-Host "   Run: .\download_liveness_model.ps1" -ForegroundColor Cyan
Write-Host "   Or download manually from:" -ForegroundColor White
Write-Host "   http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Create Database:" -ForegroundColor White
Write-Host "   psql -U postgres" -ForegroundColor Cyan
Write-Host "   CREATE DATABASE voting_system_db;" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Run Database Migration:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   node migrations\removePasportAddFaceData.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Start Face Recognition API:" -ForegroundColor White
Write-Host "   cd face_recognition_using_Opencv" -ForegroundColor Cyan
Write-Host "   python face_recognition_api.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. Start Backend Server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  • FACE_RECOGNITION_INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host "  • LIVENESS_DETECTION_GUIDE.md" -ForegroundColor White
Write-Host "  • QUICK_START_FACE_RECOGNITION.md" -ForegroundColor White
Write-Host ""
