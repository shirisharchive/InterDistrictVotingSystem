# 📦 Complete Installation Guide - Face Recognition System

## 🚀 Quick Installation (3 Commands)

```powershell
# 1. Install Python dependencies
.\install_dependencies.ps1

# 2. Setup PostgreSQL database
.\setup_database.ps1

# 3. Download face landmark model (optional, for liveness detection)
.\download_liveness_model.ps1
```

---

## 📋 Prerequisites

### Required Software

| Software                   | Version    | Download Link                                              |
| -------------------------- | ---------- | ---------------------------------------------------------- |
| **Python**                 | 3.8 - 3.11 | https://www.python.org/downloads/                          |
| **PostgreSQL**             | 12+        | https://www.postgresql.org/download/                       |
| **Node.js**                | 16+        | https://nodejs.org/                                        |
| **Visual C++ Build Tools** | Latest     | https://visualstudio.microsoft.com/visual-cpp-build-tools/ |

### Installation Notes

**Python:**

- ✓ Check "Add Python to PATH" during installation
- ✓ Install for all users (recommended)

**PostgreSQL:**

- ✓ Remember your postgres user password
- ✓ Default port: 5432
- ✓ Install Stack Builder (optional)

**Visual C++ Build Tools:**

- ✓ Required for compiling dlib
- ✓ Select "Desktop development with C++"

---

## 🔧 Step-by-Step Installation

### Step 1: Install Python Dependencies

Run the automated installer:

```powershell
.\install_dependencies.ps1
```

**What this installs:**

- Flask & Flask-CORS (Web framework)
- face_recognition (Face detection & recognition)
- OpenCV (Image processing)
- dlib (Facial landmarks)
- NumPy, Pillow, SciPy (Math & image libraries)
- psycopg2-binary (PostgreSQL connector)
- CMake (Build tool for dlib)

**Installation Time:** ~10-15 minutes

#### Manual Installation (if script fails)

```powershell
# Upgrade pip
python -m pip install --upgrade pip setuptools wheel

# Install CMake (needed for dlib)
pip install cmake

# Install core dependencies
pip install numpy==1.24.3
pip install Pillow==10.0.0
pip install scipy==1.11.2

# Install OpenCV
pip install opencv-python==4.8.0.76

# Install dlib (this takes 5-10 minutes)
pip install dlib==19.24.2

# Install face_recognition
pip install face_recognition==1.3.0

# Install web framework
pip install flask==2.3.3
pip install flask-cors==4.0.0

# Install PostgreSQL connector
pip install psycopg2-binary==2.9.7
```

#### Troubleshooting dlib Installation

If dlib fails to install:

**Option 1: Install Visual C++ Build Tools**

1. Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Install "Desktop development with C++"
3. Restart terminal and try again

**Option 2: Use Pre-built Wheel (Windows)**

```powershell
# Download pre-built dlib wheel for your Python version
# From: https://github.com/sachadee/Dlib/tree/master/dlib-19.24.2

# For Python 3.9 (64-bit):
pip install dlib-19.24.2-cp39-cp39-win_amd64.whl

# For Python 3.10 (64-bit):
pip install dlib-19.24.2-cp310-cp310-win_amd64.whl

# For Python 3.11 (64-bit):
pip install dlib-19.24.2-cp311-cp311-win_amd64.whl
```

### Step 2: Setup PostgreSQL Database

Run the automated setup:

```powershell
.\setup_database.ps1
```

**What this does:**

- Connects to PostgreSQL
- Creates `voting_system_db` database
- Updates configuration in face_recognition_api.py
- Verifies connection

**You'll be asked for:**

- PostgreSQL host (default: localhost)
- PostgreSQL port (default: 5432)
- PostgreSQL username (default: postgres)
- PostgreSQL password

#### Manual Database Setup

```powershell
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE voting_system_db;

# Verify
\l

# Exit
\q
```

Then edit `face_recognition_using_Opencv/face_recognition_api.py`:

```python
DB_CONFIG = {
    'host': 'localhost',
    'database': 'voting_system_db',
    'user': 'postgres',
    'password': 'your_password_here',  # ⚠️ UPDATE THIS
    'port': 5432
}
```

### Step 3: Download Facial Landmark Model (Optional)

For advanced liveness detection:

```powershell
.\download_liveness_model.ps1
```

**Or download manually:**

1. Download: http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2
2. Extract the .bz2 file (using 7-Zip)
3. Place `shape_predictor_68_face_landmarks.dat` in `face_recognition_using_Opencv/`

**Note:** System works without this file using basic liveness checks. Advanced checks provide higher accuracy.

### Step 4: Run Database Migration

```powershell
cd backend
node migrations\removePasportAddFaceData.js
```

**What this does:**

- Removes PassportNo column
- Adds FaceData column
- Adds FaceRegisteredAt column

### Step 5: Install Node.js Dependencies

```powershell
cd backend
npm install
```

---

## ✅ Verify Installation

### Test Python Packages

```powershell
python -c "import flask, face_recognition, cv2, psycopg2, dlib, scipy; print('✓ All packages OK')"
```

### Test PostgreSQL Connection

```powershell
cd face_recognition_using_Opencv
python -c "import psycopg2; conn = psycopg2.connect(host='localhost', database='voting_system_db', user='postgres', password='your_password'); print('✓ Database OK')"
```

### Test Face Recognition API

```powershell
cd face_recognition_using_Opencv
python face_recognition_api.py
```

Expected output:

```
* Running on http://0.0.0.0:5001
✓ Liveness detection enabled
```

### Test Backend Server

```powershell
cd backend
npm start
```

Expected output:

```
Server running on port 3000
Connected to PostgreSQL
```

---

## 📦 Complete Dependency List

### Python Packages

| Package          | Version  | Purpose                      |
| ---------------- | -------- | ---------------------------- |
| flask            | 2.3.3    | Web framework for API        |
| flask-cors       | 4.0.0    | Cross-origin requests        |
| face_recognition | 1.3.0    | Face detection & recognition |
| opencv-python    | 4.8.0.76 | Image processing             |
| dlib             | 19.24.2  | Facial landmarks             |
| numpy            | 1.24.3   | Numerical computing          |
| Pillow           | 10.0.0   | Image handling               |
| scipy            | 1.11.2   | Scientific computing         |
| psycopg2-binary  | 2.9.7    | PostgreSQL connector         |
| cmake            | Latest   | Build tool                   |

### System Requirements

- **Python:** 3.8 - 3.11 (64-bit)
- **RAM:** Minimum 4GB (8GB recommended)
- **Disk Space:** ~2GB for all dependencies
- **OS:** Windows 10/11, Linux, or macOS

---

## 🐛 Common Issues & Solutions

### Issue 1: "pip is not recognized"

**Solution:**

```powershell
python -m pip install --upgrade pip
```

### Issue 2: "cmake is not found"

**Solution:**

```powershell
pip install cmake
# Or download from: https://cmake.org/download/
```

### Issue 3: "error: Microsoft Visual C++ 14.0 is required"

**Solution:**
Install Visual C++ Build Tools:

1. Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Select "Desktop development with C++"
3. Restart and try again

### Issue 4: "psycopg2 installation failed"

**Solution:**

```powershell
# Use binary version (no compilation needed)
pip install psycopg2-binary
```

### Issue 5: "face_recognition won't install"

**Solution:**

```powershell
# Install dependencies first
pip install cmake dlib
pip install face_recognition
```

### Issue 6: "PostgreSQL connection refused"

**Solution:**

```powershell
# Check if PostgreSQL service is running
Get-Service postgresql*

# If not running, start it
Start-Service postgresql-x64-14  # Adjust version number
```

### Issue 7: "Database voting_system_db does not exist"

**Solution:**

```powershell
# Run setup script
.\setup_database.ps1

# Or create manually
psql -U postgres -c "CREATE DATABASE voting_system_db;"
```

### Issue 8: "Port 5432 already in use"

**Solution:**

```powershell
# Check what's using the port
netstat -ano | findstr :5432

# Stop the process or change PostgreSQL port
```

---

## 🚀 Quick Start After Installation

```powershell
# Terminal 1: Start Face Recognition API
cd face_recognition_using_Opencv
python face_recognition_api.py

# Terminal 2: Start Backend Server
cd backend
npm start

# Terminal 3 (optional): Open frontend
cd frontend
explorer pages\voter-login.html
```

---

## 📚 Configuration Files

### Database Configuration

**File:** `face_recognition_using_Opencv/face_recognition_api.py`

```python
DB_CONFIG = {
    'host': 'localhost',        # PostgreSQL host
    'database': 'voting_system_db',  # Database name
    'user': 'postgres',         # PostgreSQL username
    'password': 'your_password', # ⚠️ UPDATE THIS
    'port': 5432               # PostgreSQL port
}
```

### Backend Configuration

**File:** `backend/config/database.js`

```javascript
module.exports = {
  host: "localhost",
  database: "voting_system_db",
  user: "postgres",
  password: "your_password", // ⚠️ UPDATE THIS
  port: 5432,
};
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (HTML/CSS/JS)                     │
│  - voter-login.html                         │
│  - face-registration.html                   │
└────────────┬────────────────────────────────┘
             │
             ├──► Face Recognition API (Python Flask)
             │    Port: 5001
             │    - Face detection
             │    - Liveness detection
             │    - Face matching
             │
             └──► Backend API (Node.js)
                  Port: 3000
                  - Voter management
                  - Authentication
                  - Blockchain integration
                  │
                  └──► PostgreSQL Database
                       Port: 5432
                       - VoterInfo table
                       - Face data storage
```

---

## 🎯 Next Steps

After successful installation:

1. **Register Faces:**

   - Open `frontend/pages/face-registration.html`
   - Register test voter faces

2. **Test Login:**

   - Open `frontend/pages/voter-login.html`
   - Test face recognition login

3. **Review Documentation:**

   - `FACE_RECOGNITION_INTEGRATION_GUIDE.md`
   - `LIVENESS_DETECTION_GUIDE.md`
   - `QUICK_START_FACE_RECOGNITION.md`

4. **Configure for Production:**
   - Change default passwords
   - Enable HTTPS
   - Configure firewall rules

---

## 📞 Support

**Installation Issues?**

- Check logs for detailed error messages
- Verify all prerequisites are installed
- Review troubleshooting section above

**Still stuck?**

- Review complete documentation in project root
- Check Python/PostgreSQL versions
- Ensure sufficient disk space and RAM

---

## ✅ Installation Checklist

- [ ] Python 3.8-3.11 installed
- [ ] PostgreSQL installed and running
- [ ] Visual C++ Build Tools installed (Windows)
- [ ] All Python packages installed (run `install_dependencies.ps1`)
- [ ] Database created (run `setup_database.ps1`)
- [ ] Database migration completed
- [ ] Face landmark model downloaded (optional)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Configuration files updated with credentials
- [ ] Face Recognition API starts successfully
- [ ] Backend server starts successfully
- [ ] Can access frontend pages

---

**🎉 Installation complete! Your face recognition system is ready to use!**
