# Download Facial Landmark Model for Liveness Detection

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Downloading Facial Landmark Model" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$modelUrl = "http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"
$compressedFile = "shape_predictor_68_face_landmarks.dat.bz2"
$extractedFile = "shape_predictor_68_face_landmarks.dat"
$targetDir = "face_recognition_using_Opencv"

# Check if model already exists
if (Test-Path "$targetDir\$extractedFile") {
    Write-Host "✓ Model file already exists!" -ForegroundColor Green
    Write-Host "  Location: $targetDir\$extractedFile" -ForegroundColor White
    Write-Host ""
    $overwrite = Read-Host "Do you want to re-download? (Y/N)"
    if ($overwrite -ne "Y" -and $overwrite -ne "y") {
        Write-Host "Skipping download." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Downloading facial landmark model (99.7 MB)..." -ForegroundColor Yellow
Write-Host "This may take a few minutes depending on your connection." -ForegroundColor White
Write-Host ""

try {
    # Download the compressed file
    Invoke-WebRequest -Uri $modelUrl -OutFile $compressedFile -UseBasicParsing
    
    Write-Host "✓ Download completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Extracting file..." -ForegroundColor Yellow
    
    # Check if 7-Zip is available
    $sevenZipPaths = @(
        "C:\Program Files\7-Zip\7z.exe",
        "C:\Program Files (x86)\7-Zip\7z.exe",
        "$env:ProgramFiles\7-Zip\7z.exe"
    )
    
    $sevenZip = $null
    foreach ($path in $sevenZipPaths) {
        if (Test-Path $path) {
            $sevenZip = $path
            break
        }
    }
    
    if ($sevenZip) {
        # Extract using 7-Zip
        & $sevenZip x $compressedFile -y
        Write-Host "✓ Extraction completed!" -ForegroundColor Green
        
        # Move to target directory
        if (Test-Path $extractedFile) {
            Move-Item -Path $extractedFile -Destination "$targetDir\$extractedFile" -Force
            Write-Host "✓ Model file moved to $targetDir\" -ForegroundColor Green
        }
        
        # Clean up compressed file
        Remove-Item $compressedFile -Force
        Write-Host "✓ Cleaned up temporary files" -ForegroundColor Green
        
    } else {
        Write-Host "⚠️  7-Zip not found!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please manually extract the file:" -ForegroundColor White
        Write-Host "1. Install 7-Zip from: https://www.7-zip.org/" -ForegroundColor White
        Write-Host "2. Right-click on $compressedFile" -ForegroundColor White
        Write-Host "3. Select '7-Zip > Extract Here'" -ForegroundColor White
        Write-Host "4. Move $extractedFile to $targetDir\" -ForegroundColor White
        Write-Host ""
        Write-Host "Or use online extractor:" -ForegroundColor White
        Write-Host "https://extract.me/" -ForegroundColor Cyan
        Write-Host ""
        exit 1
    }
    
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "✓ Setup Complete!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Model file ready at:" -ForegroundColor Yellow
    Write-Host "  $targetDir\$extractedFile" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Install dependencies: pip install dlib scipy" -ForegroundColor White
    Write-Host "  2. Start API: python face_recognition_api.py" -ForegroundColor White
    Write-Host "  3. Test liveness detection at voter-login.html" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative download methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Direct download in browser" -ForegroundColor White
    Write-Host "  URL: $modelUrl" -ForegroundColor Cyan
    Write-Host "  Then extract and place in: $targetDir\" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Use wget (if available)" -ForegroundColor White
    Write-Host "  wget $modelUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 3: Use curl" -ForegroundColor White
    Write-Host "  curl -L $modelUrl -o $compressedFile" -ForegroundColor Cyan
    Write-Host ""
}
