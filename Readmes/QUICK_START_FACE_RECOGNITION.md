# 🎯 QUICK START GUIDE - Face Recognition Integration

## ⚡ 60-Second Setup

### Step 1️⃣: Install Python Dependencies (30 seconds)

```powershell
cd face_recognition_using_Opencv
pip install -r requirements.txt
```

### Step 2️⃣: Configure Database (15 seconds)

Edit `face_recognition_using_Opencv/face_recognition_api.py`:

```python
DB_CONFIG = {
    'database': 'voting_system_db',  # Your DB name
    'user': 'postgres',               # Your username
    'password': 'your_password_here', # Your password ⚠️ CHANGE THIS
}
```

### Step 3️⃣: Run Migration (10 seconds)

```powershell
cd backend
node migrations/removePasportAddFaceData.js
```

### Step 4️⃣: Start Everything (5 seconds)

```powershell
.\start_face_recognition.ps1
```

OR manually:

```powershell
# Terminal 1
cd face_recognition_using_Opencv
python face_recognition_api.py

# Terminal 2
cd backend
npm start
```

---

## 🎮 How to Use

### For Admin: Register Faces

1. Open: `frontend/pages/face-registration.html`
2. Enter Voter ID → Load Info
3. Start Camera → Capture → Register
4. ✓ Done!

### For Voters: Login

1. Open: `frontend/pages/voter-login.html`
2. Start Camera → Capture Face
3. ✓ Face recognized? → Enter DOB
4. Login & Vote!

---

## 🔥 What Changed?

### ❌ REMOVED

- Passport Number field (from login & database)

### ✅ ADDED

- Face recognition authentication
- 3-attempt rate limiting (15-min lockout)
- `FaceData` column in database
- Python Flask API (port 5001)
- Camera capture interface
- Face registration tool

---

## 🚨 Important Notes

### Services Required

- ✓ PostgreSQL (database)
- ✓ Face Recognition API (port 5001)
- ✓ Backend Server (port 3000)

### Login Flow Changed

**OLD**: Voter ID + DOB + Passport → Login  
**NEW**: Face Scan → (if match) → DOB + Voter ID → Login

### Security Enhanced

- Maximum 3 face recognition attempts
- 15-minute lockout after failures
- IP-based rate limiting
- Multi-factor authentication

---

## 📱 URLs

| Service           | URL                                     |
| ----------------- | --------------------------------------- |
| Face API          | http://localhost:5001                   |
| Backend           | http://localhost:3000                   |
| Login Page        | `frontend/pages/voter-login.html`       |
| Face Registration | `frontend/pages/face-registration.html` |
| Admin Panel       | `frontend/pages/admin.html`             |

---

## 🐛 Quick Fixes

### "Camera not working"

→ Check browser permissions, use Chrome/Edge

### "Face not detected"

→ Better lighting, face camera directly

### "Module not found" error

→ `pip install face_recognition opencv-python`

### "Database connection failed"

→ Check credentials in `face_recognition_api.py`

### "Port already in use"

→ Kill process: `Stop-Process -Name python` or restart terminal

---

## 📦 What You Got

### New Files (7)

```
✓ face_recognition_api.py          - Face API server
✓ requirements.txt                 - Python dependencies
✓ removePasportAddFaceData.js      - DB migration
✓ face-registration.html           - Admin tool
✓ start_face_recognition.ps1       - Auto-start script
✓ FACE_RECOGNITION_INTEGRATION_GUIDE.md
✓ FACE_RECOGNITION_SUMMARY.md
```

### Modified Files (4)

```
✓ VoterInfo.js          - DB model updated
✓ voterController.js    - New endpoints
✓ index.js (Routes)     - New routes
✓ voter-login.html      - Face capture UI
```

---

## ✅ Test Checklist

- [ ] Run migration: `node migrations/removePasportAddFaceData.js`
- [ ] Start Face API: `python face_recognition_api.py`
- [ ] Start Backend: `npm start`
- [ ] Register test face: `face-registration.html`
- [ ] Test login: `voter-login.html`
- [ ] Verify 3-attempt limit works
- [ ] Check lockout after 3 failures

---

## 🎓 Need More Help?

Read the full guide:
→ **FACE_RECOGNITION_INTEGRATION_GUIDE.md**

For detailed information:
→ **FACE_RECOGNITION_SUMMARY.md**

---

**🎉 You're all set! Face recognition is now integrated with 3-attempt limiting and passport field removed.**
