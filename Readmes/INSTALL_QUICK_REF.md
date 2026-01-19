# 🚀 QUICK INSTALLATION REFERENCE

## One-Command Install

```powershell
.\install_dependencies.ps1
```

## What Gets Installed

- ✅ Flask (Web API)
- ✅ face_recognition (Face detection)
- ✅ OpenCV (Image processing)
- ✅ dlib (Facial landmarks)
- ✅ psycopg2 (PostgreSQL connector)
- ✅ NumPy, SciPy, Pillow (Math/Image libs)

## Installation Time

⏱️ 10-15 minutes (dlib takes longest)

## After Installation

### 1. Setup Database

```powershell
.\setup_database.ps1
```

Credentials needed:

- Host: localhost
- Port: 5432
- User: postgres
- Password: [your password]
- Database: voting_system_db

### 2. Run Migration

```powershell
cd backend
node migrations\removePasportAddFaceData.js
```

### 3. Download Liveness Model (Optional)

```powershell
.\download_liveness_model.ps1
```

### 4. Start Everything

```powershell
# Terminal 1
cd face_recognition_using_Opencv
python face_recognition_api.py

# Terminal 2
cd backend
npm start
```

## Verify Installation

```powershell
# Test Python packages
python -c "import flask, face_recognition, cv2, psycopg2, dlib; print('OK')"

# Test database
psql -U postgres -d voting_system_db -c "SELECT 1"
```

## Common Issues

### dlib won't install?

→ Install Visual C++ Build Tools
→ https://visualstudio.microsoft.com/visual-cpp-build-tools/

### psycopg2 fails?

→ Use: `pip install psycopg2-binary`

### Database connection refused?

→ Check service: `Get-Service postgresql*`
→ Start if needed: `Start-Service postgresql-x64-14`

### Port 5432 in use?

→ Check: `netstat -ano | findstr :5432`

## URLs After Setup

- Face API: http://localhost:5001
- Backend: http://localhost:3000
- Login: frontend/pages/voter-login.html
- Face Registration: frontend/pages/face-registration.html

## Files to Configure

📝 `face_recognition_using_Opencv/face_recognition_api.py`
→ Update DB_CONFIG password

📝 `backend/config/database.js`
→ Update database password

## Full Documentation

- 📖 INSTALLATION_GUIDE.md (Complete guide)
- 📖 FACE_RECOGNITION_INTEGRATION_GUIDE.md
- 📖 LIVENESS_DETECTION_GUIDE.md

## Support

Run verification: `.\verify_setup.ps1`
