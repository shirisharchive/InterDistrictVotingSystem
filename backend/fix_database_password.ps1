# Fix PostgreSQL Password Configuration
# Run this to update your database password

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Fix PostgreSQL Password Configuration" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current Error: password authentication failed for user 'postgres'" -ForegroundColor Red
Write-Host ""
Write-Host "Let's fix this by setting the correct PostgreSQL password." -ForegroundColor Yellow
Write-Host ""

# Test current configuration first
Write-Host "Testing current PostgreSQL connection..." -ForegroundColor Yellow
Write-Host ""

$testScript = @"
import psycopg2
import sys

configs_to_try = [
    {'password': 'postgres', 'label': 'Default (postgres)'},
    {'password': 'password', 'label': 'Current backend config'},
    {'password': 'admin', 'label': 'Common default (admin)'},
    {'password': '', 'label': 'Empty password'},
]

print('Trying common PostgreSQL passwords...')
print()

for config in configs_to_try:
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='postgres',
            user='postgres',
            password=config['password'],
            port=5432
        )
        print(f'✓ SUCCESS! Password is: {config[\"password\"]}')
        print(f'  ({config[\"label\"]})')
        conn.close()
        sys.exit(0)
    except:
        print(f'✗ {config[\"label\"]}: {config[\"password\"]} - Failed')

print()
print('None of the common passwords worked.')
print('You need to enter your PostgreSQL password manually.')
"@

$testScript | python 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Great! Found a working password." -ForegroundColor Green
    Write-Host ""
    $useFound = Read-Host "Use this password for configuration? (Y/N)"
    
    if ($useFound -eq "Y" -or $useFound -eq "y") {
        # Password will be entered below
        Write-Host "Proceeding with configuration update..." -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "Could not auto-detect password." -ForegroundColor Yellow
    Write-Host ""
}

# Get the correct password from user
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Enter PostgreSQL Password" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "If you don't know your PostgreSQL password:" -ForegroundColor Yellow
Write-Host "  1. Open pgAdmin (PostgreSQL management tool)" -ForegroundColor White
Write-Host "  2. Or check your installation notes" -ForegroundColor White
Write-Host "  3. Or reset it using:" -ForegroundColor White
Write-Host "     psql -U postgres -c " -NoNewline -ForegroundColor Cyan
Write-Host '"ALTER USER postgres PASSWORD ' -NoNewline
Write-Host "'newpassword'" -NoNewline
Write-Host ';"' -ForegroundColor Cyan
Write-Host ""

$pgPassword = Read-Host "Enter PostgreSQL password for user 'postgres'"

if ([string]::IsNullOrWhiteSpace($pgPassword)) {
    Write-Host ""
    Write-Host "❌ Password cannot be empty!" -ForegroundColor Red
    exit 1
}

# Test the password
Write-Host ""
Write-Host "Testing password..." -ForegroundColor Yellow

$validateScript = @"
import psycopg2
import sys

try:
    conn = psycopg2.connect(
        host='localhost',
        database='postgres',
        user='postgres',
        password='$pgPassword',
        port=5432
    )
    print('✓ Password is correct!')
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f'✗ Password is incorrect: {e}')
    sys.exit(1)
"@

$validateScript | python

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ The password you entered is incorrect." -ForegroundColor Red
    Write-Host "Please try again or reset your PostgreSQL password." -ForegroundColor Yellow
    exit 1
}

# Update backend database.js
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Updating Configuration Files" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$backendDbPath = "config\database.js"

if (Test-Path $backendDbPath) {
    Write-Host "Updating $backendDbPath..." -ForegroundColor White
    
    $content = Get-Content $backendDbPath -Raw
    
    # Update the default password
    $content = $content -replace 'DB_PASSWORD \|\| "password"', "DB_PASSWORD || `"$pgPassword`""
    
    Set-Content -Path $backendDbPath -Value $content -NoNewline
    
    Write-Host "✓ Updated $backendDbPath" -ForegroundColor Green
} else {
    Write-Host "⚠ $backendDbPath not found" -ForegroundColor Yellow
}

# Update face_recognition_api.py
Write-Host ""
$apiPath = "..\face_recognition_using_Opencv\face_recognition_api.py"

if (Test-Path $apiPath) {
    Write-Host "Updating face_recognition_api.py..." -ForegroundColor White
    
    $content = Get-Content $apiPath -Raw
    
    # Update DB_CONFIG password
    $content = $content -replace "'password': 'postgres'", "'password': '$pgPassword'"
    $content = $content -replace "'password': 'password'", "'password': '$pgPassword'"
    
    Set-Content -Path $apiPath -Value $content -NoNewline
    
    Write-Host "✓ Updated face_recognition_api.py" -ForegroundColor Green
} else {
    Write-Host "⚠ face_recognition_api.py not found at expected location" -ForegroundColor Yellow
}

# Create .env file for backend
Write-Host ""
Write-Host "Creating .env file for backend..." -ForegroundColor White

$envContent = @"
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=voting_system_db
DB_USER=postgres
DB_PASSWORD=$pgPassword

# Server Configuration
PORT=3000
NODE_ENV=development
"@

Set-Content -Path ".env" -Value $envContent

Write-Host "✓ Created .env file" -ForegroundColor Green

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "✓ Configuration Updated Successfully!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Updated files:" -ForegroundColor Yellow
Write-Host "  ✓ config\database.js" -ForegroundColor Green
Write-Host "  ✓ .env (created)" -ForegroundColor Green
if (Test-Path $apiPath) {
    Write-Host "  ✓ face_recognition_api.py" -ForegroundColor Green
}

Write-Host ""
Write-Host "Now try running the migration again:" -ForegroundColor Yellow
Write-Host "  node migrations\removePasportAddFaceData.js" -ForegroundColor Cyan
Write-Host ""

# Offer to run migration now
$runMigration = Read-Host "Run migration now? (Y/N)"

if ($runMigration -eq "Y" -or $runMigration -eq "y") {
    Write-Host ""
    Write-Host "Running migration..." -ForegroundColor Yellow
    Write-Host ""
    node migrations\removePasportAddFaceData.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Start Face API: cd ..\face_recognition_using_Opencv; python face_recognition_api.py" -ForegroundColor White
        Write-Host "  2. Start Backend: npm start" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "⚠ Migration had issues. Check the error above." -ForegroundColor Yellow
    }
}

Write-Host ""
