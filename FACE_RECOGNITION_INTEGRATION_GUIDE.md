# Face Recognition Integration Guide

## Overview

This voting system now uses face recognition for secure voter authentication. Voters must complete face verification before accessing the voting portal.

## Features Implemented

### 1. **Database Changes**

- ✅ Removed `PassportNo` column
- ✅ Added `FaceData` column (TEXT) - stores face encoding as JSON
- ✅ Added `FaceRegisteredAt` column (TIMESTAMP) - tracks registration time

### 2. **Face Recognition API (Python Flask)**

- ✅ Face verification endpoint with 3-attempt limit
- ✅ Face registration endpoint for enrolling voters
- ✅ Rate limiting (15-minute lockout after 3 failed attempts)
- ✅ PostgreSQL database integration

### 3. **Backend Integration (Node.js)**

- ✅ Face data registration endpoint
- ✅ Credential verification endpoint (after face recognition)
- ✅ Updated voter routes

### 4. **Frontend Updates**

- ✅ Camera-based face capture interface
- ✅ Real-time face verification
- ✅ Attempt counter (3 attempts max)
- ✅ Credential form (shown only after successful face match)
- ✅ Removed passport number field

## Setup Instructions

### Step 1: Install Python Dependencies

```powershell
cd face_recognition_using_Opencv
pip install -r requirements.txt
```

**Note:** If you encounter installation issues with `face_recognition`:

```powershell
# Install CMake first (required for dlib)
pip install cmake

# Install dlib
pip install dlib

# Then install face_recognition
pip install face_recognition
```

### Step 2: Configure Database Connection

Edit `face_recognition_using_Opencv/face_recognition_api.py` and update the database configuration:

```python
DB_CONFIG = {
    'host': 'localhost',
    'database': 'voting_system_db',  # Your database name
    'user': 'postgres',               # Your username
    'password': 'postgres',           # Your password
    'port': 5432
}
```

### Step 3: Run Database Migration

```powershell
cd backend
node migrations/removePasportAddFaceData.js
```

This will:

- Remove the `PassportNo` column
- Add `FaceData` and `FaceRegisteredAt` columns

### Step 4: Start the Face Recognition API

```powershell
cd face_recognition_using_Opencv
python face_recognition_api.py
```

The API will run on `http://localhost:5001`

### Step 5: Start the Backend Server

```powershell
cd backend
npm start
# or
node server.js
```

The backend runs on `http://localhost:3000`

### Step 6: Open Frontend

Navigate to `frontend/pages/voter-login.html` in your browser.

## How It Works

### Login Flow

1. **Face Capture**

   - User clicks "Start Camera"
   - Camera activates and displays live video
   - User positions face in frame
   - User clicks "Capture Face"

2. **Face Verification**

   - Image sent to Python Flask API
   - API compares face with all registered voters
   - If match found (within 60% tolerance), voter info returned
   - If no match, attempt counter decrements

3. **Credential Confirmation**

   - After successful face match, form displays:
     - Voter name (read-only)
     - Voter ID (pre-filled, read-only)
     - Date of Birth (user must enter)
   - User confirms DOB
   - System verifies credentials
   - User redirected to voting dashboard

4. **Rate Limiting**
   - 3 attempts allowed per IP address
   - After 3 failed attempts: 15-minute lockout
   - Timer resets after successful login
   - Lockout tracked by client IP

## Face Data Registration

### Option 1: Using the Registration API

Create a face registration page (admin use):

```javascript
// Capture face and register for a voter
const imageData = canvas.toDataURL("image/jpeg");

const response = await fetch(
  "http://localhost:5001/api/face-recognition/register",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      voterId: "1378", // Voter's ID
      image: imageData, // Base64 image
    }),
  }
);
```

### Option 2: Bulk Registration Script

Create a Python script to register all voters:

```python
import face_recognition
import json
import psycopg2
from datetime import datetime

def bulk_register_faces(image_folder):
    conn = psycopg2.connect(
        host='localhost',
        database='voting_system_db',
        user='postgres',
        password='postgres'
    )
    cursor = conn.cursor()

    # Assuming images named as: {voterId}.jpg
    for image_file in os.listdir(image_folder):
        voter_id = image_file.split('.')[0]
        image_path = os.path.join(image_folder, image_file)

        # Load and encode face
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)

        if len(encodings) > 0:
            face_data = json.dumps(encodings[0].tolist())

            cursor.execute('''
                UPDATE "VoterInfo"
                SET "FaceData" = %s, "FaceRegisteredAt" = %s
                WHERE "VoterId" = %s
            ''', (face_data, datetime.now(), voter_id))

            print(f"Registered face for voter: {voter_id}")

    conn.commit()
    cursor.close()
    conn.close()

# Usage
bulk_register_faces('/path/to/voter/images')
```

## API Endpoints

### Face Recognition API (Port 5001)

#### 1. Verify Face

```
POST /api/face-recognition/verify
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}

Response:
{
  "success": true,
  "message": "Face recognized successfully!",
  "data": {
    "id": 1,
    "voterId": "1378",
    "voterName": "John Doe",
    "dateOfBirth": "1990-01-01",
    "district": "District1",
    "areaNo": 1,
    "hasVoted": 0,
    "matchConfidence": 0.87
  }
}
```

#### 2. Register Face

```
POST /api/face-recognition/register
Content-Type: application/json

{
  "voterId": "1378",
  "image": "data:image/jpeg;base64,..."
}

Response:
{
  "success": true,
  "message": "Face registered successfully!"
}
```

#### 3. Check Rate Limit

```
GET /api/face-recognition/check-rate-limit

Response:
{
  "success": true,
  "locked": false,
  "attemptsLeft": 3
}
```

### Backend API (Port 3000)

#### 1. Register Face Data

```
POST /api/voters/register-face
Content-Type: application/json

{
  "voterId": "1378",
  "faceData": "[0.123, -0.456, ...]"  // JSON string of encoding
}
```

#### 2. Verify Credentials

```
POST /api/voters/verify-credentials
Content-Type: application/json

{
  "voterId": "1378",
  "dob": "1990-01-01",
  "faceVerified": true
}
```

## Security Features

1. **3-Attempt Limit**: Prevents brute force attacks
2. **Rate Limiting**: 15-minute lockout after failed attempts
3. **Face Confidence Score**: Only matches above 40% confidence accepted
4. **Multi-factor**: Face + DOB + Voter ID verification
5. **IP-based Tracking**: Prevents multiple device attacks
6. **No Face Data Exposure**: Face encodings never sent to frontend
7. **Already Voted Check**: Prevents double voting

## Troubleshooting

### Camera Not Working

- Ensure browser has camera permissions
- Use HTTPS or localhost (HTTP)
- Check if camera is in use by another application

### Face Not Detected

- Ensure good lighting
- Face the camera directly
- Remove glasses/masks if possible
- Move closer to the camera

### Face Not Recognized

- Ensure face is registered in the database
- Check if image quality during registration was good
- Verify database has `FaceData` populated

### API Connection Error

- Ensure Python Flask API is running on port 5001
- Check CORS is enabled
- Verify database connection in Flask API

### Database Migration Issues

```powershell
# If migration fails, manually run SQL:
psql -U postgres -d voting_system_db

ALTER TABLE "VoterInfo" DROP COLUMN IF EXISTS "PassportNo";
ALTER TABLE "VoterInfo" ADD COLUMN IF NOT EXISTS "FaceData" TEXT;
ALTER TABLE "VoterInfo" ADD COLUMN IF NOT EXISTS "FaceRegisteredAt" TIMESTAMP WITH TIME ZONE;
```

## Testing

### Test Face Recognition

1. Register a test voter's face
2. Open voter login page
3. Start camera and capture face
4. Verify face is recognized
5. Enter DOB and complete login

### Test Rate Limiting

1. Capture face of unregistered person 3 times
2. Verify lockout message appears
3. Check that "Start Camera" button is disabled
4. Wait 15 minutes or clear `failed_attempts` in API

## Next Steps

1. **Create Admin Panel** for face registration
2. **Add Face Re-registration** feature for voters
3. **Implement Liveness Detection** to prevent photo spoofing
4. **Add Audit Logs** for face recognition attempts
5. **Optimize Face Matching** for faster comparisons

## File Structure

```
VotingSystem/
├── backend/
│   ├── electionModel/
│   │   └── VoterInfo.js (✓ Updated)
│   ├── Controller/
│   │   └── voterController.js (✓ Updated)
│   ├── Routes/
│   │   └── index.js (✓ Updated)
│   └── migrations/
│       └── removePasportAddFaceData.js (✓ New)
├── face_recognition_using_Opencv/
│   ├── face_recognition_api.py (✓ New)
│   ├── requirements.txt (✓ New)
│   ├── face_encoding.py (Original)
│   └── main.py (Original)
└── frontend/
    └── pages/
        └── voter-login.html (✓ Updated)
```

## Support

For issues or questions:

1. Check console logs (browser & server)
2. Verify all services are running
3. Check database connection
4. Review API responses
