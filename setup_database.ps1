# Database Setup Script for Face Recognition System
# Creates the voting_system_db database in PostgreSQL

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Database Setup" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Connect to PostgreSQL" -ForegroundColor White
Write-Host "  2. Create voting_system_db database (if not exists)" -ForegroundColor White
Write-Host "  3. Verify database connection" -ForegroundColor White
Write-Host ""

# Get database credentials
Write-Host "Enter PostgreSQL credentials:" -ForegroundColor Yellow
Write-Host ""

$pgHost = Read-Host "PostgreSQL Host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($pgHost)) { $pgHost = "localhost" }

$pgPort = Read-Host "PostgreSQL Port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($pgPort)) { $pgPort = "5432" }

$pgUser = Read-Host "PostgreSQL Username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($pgUser)) { $pgUser = "postgres" }

$pgPassword = Read-Host "PostgreSQL Password" -AsSecureString
$pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
)

$dbName = "voting_system_db"

Write-Host ""
Write-Host "Connecting to PostgreSQL..." -ForegroundColor Yellow

# Create Python script to setup database
$setupScript = @"
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

# Connection parameters
params = {
    'host': '$pgHost',
    'port': $pgPort,
    'user': '$pgUser',
    'password': '$pgPasswordPlain',
    'database': 'postgres'
}

db_name = '$dbName'

try:
    # Connect to default postgres database
    print('Connecting to PostgreSQL server...')
    conn = psycopg2.connect(**params)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f\"SELECT 1 FROM pg_database WHERE datname = '{db_name}'\")
    exists = cursor.fetchone()
    
    if exists:
        print(f'✓ Database \"{db_name}\" already exists')
    else:
        print(f'Creating database \"{db_name}\"...')
        cursor.execute(f'CREATE DATABASE {db_name}')
        print(f'✓ Database \"{db_name}\" created successfully')
    
    cursor.close()
    conn.close()
    
    # Connect to the new database to verify
    params['database'] = db_name
    conn = psycopg2.connect(**params)
    cursor = conn.cursor()
    
    cursor.execute('SELECT version();')
    version = cursor.fetchone()[0]
    
    print()
    print('✓ Database connection verified!')
    print(f'  Database: {db_name}')
    print(f'  Version: {version.split(\",\")[0]}')
    
    cursor.close()
    conn.close()
    
    print()
    print('Database setup complete!')
    
except psycopg2.Error as e:
    print(f'✗ Database error: {e}')
    print()
    print('Please check:')
    print('  1. PostgreSQL service is running:')
    print('     Get-Service postgresql*')
    print('  2. Username and password are correct')
    print('  3. PostgreSQL is accepting connections on port $pgPort')
    sys.exit(1)
except Exception as e:
    print(f'✗ Error: {e}')
    sys.exit(1)
"@

$setupScript | python

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "Updating Configuration Files..." -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Update face_recognition_api.py with database credentials
    $apiPath = "face_recognition_using_Opencv\face_recognition_api.py"
    
    if (Test-Path $apiPath) {
        Write-Host "Updating $apiPath..." -ForegroundColor White
        
        $content = Get-Content $apiPath -Raw
        
        # Update DB_CONFIG
        $newConfig = @"
DB_CONFIG = {
    'host': '$pgHost',
    'database': '$dbName',
    'user': '$pgUser',
    'password': '$pgPasswordPlain',
    'port': $pgPort
}
"@
        
        if ($content -match "DB_CONFIG\s*=\s*\{[^\}]+\}") {
            $content = $content -replace "DB_CONFIG\s*=\s*\{[^\}]+\}", $newConfig
            Set-Content -Path $apiPath -Value $content -NoNewline
            Write-Host "✓ Configuration updated in face_recognition_api.py" -ForegroundColor Green
        } else {
            Write-Host "⚠ Could not find DB_CONFIG in file. Please update manually." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ face_recognition_api.py not found. Please update manually." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "✓ Database Setup Complete!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Database Details:" -ForegroundColor Yellow
    Write-Host "  Host: $pgHost" -ForegroundColor White
    Write-Host "  Port: $pgPort" -ForegroundColor White
    Write-Host "  Database: $dbName" -ForegroundColor White
    Write-Host "  User: $pgUser" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Run database migration:" -ForegroundColor White
    Write-Host "     cd backend" -ForegroundColor Cyan
    Write-Host "     node migrations\removePasportAddFaceData.js" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  2. Start Face Recognition API:" -ForegroundColor White
    Write-Host "     cd face_recognition_using_Opencv" -ForegroundColor Cyan
    Write-Host "     python face_recognition_api.py" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Database setup failed. Please check the error messages above." -ForegroundColor Red
    Write-Host ""
}
