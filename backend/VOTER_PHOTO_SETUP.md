# Voter Photo Upload Fix - Setup Instructions

## Overview

This fix enables the admin dashboard to properly upload, store, and display voter photos along with face recognition data.

## What Was Fixed

### Issues Resolved:

1. ✅ **Voter photos weren't being saved** - Photos were sent to the face recognition API but not stored as files
2. ✅ **No photo path in database** - VoterInfo model didn't have a PhotoPath column to reference saved photos
3. ✅ **Frontend couldn't display photos** - Admin dashboard only showed placeholder icons instead of actual voter photos
4. ✅ **API returns photo path** - Backend now returns the photo file path for display

## Setup Steps

### Step 1: Add PhotoPath Column to Database

Run the migration script to add the PhotoPath column to the existing VoterInfo table:

```bash
cd backend
node addPhotoPathColumn.js
```

**Output should show:**

```
✅ Database connection successful
✅ PhotoPath column added successfully
✨ Migration completed!
```

### Step 2: Verify Directory Structure

The backend automatically creates the uploads directory structure when needed:

- `backend/uploads/voters/` - Stores all voter photos

### Step 3: Update Voter Registration

No changes needed! Just continue using the admin dashboard to register voters with photos.

## How It Works Now

### Voter Registration Flow:

1. Admin captures or uploads voter photo in dashboard
2. Photo is sent to backend as Base64
3. Backend:
   - Sends photo to Face Recognition API (port 5001) to generate face encoding
   - **Saves photo file** to `backend/uploads/voters/voter_{voterId}_{timestamp}.jpg`
   - Stores photo path in database (`PhotoPath` column)
   - Stores face encoding in database (`FaceData` column)
4. Voter registered successfully on blockchain
5. Admin can view voter with actual photo in "View All" tab

### Photo Display:

- Admin dashboard displays actual voter photos (60x60px thumbnails)
- Falls back to placeholder if photo is missing
- Shows face recognition status (✅ Yes / ❌ No)

## API Endpoints

### Register Voter with Photo

```
POST /api/voters/register-with-photo
```

**Request Body:**

```json
{
  "VoterName": "John Doe",
  "VoterId": "123456",
  "DateOfBirth": "1990-01-15",
  "District": "District 1",
  "AreaNo": 5,
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Base64 encoded image
}
```

**Response:**

```json
{
  "success": true,
  "message": "Voter registered successfully with face data",
  "data": {
    "voter": {
      "id": 1,
      "VoterName": "John Doe",
      "VoterId": "123456",
      "PhotoPath": "/uploads/voters/voter_123456_1705416800000.jpg",
      "FaceData": "{...face encoding...}",
      "FaceRegisteredAt": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

## Getting Voter Data

### Get All Voters

```
GET /api/voters
```

**Response includes PhotoPath:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "VoterName": "John Doe",
      "VoterId": "123456",
      "PhotoPath": "/uploads/voters/voter_123456_1705416800000.jpg",
      "FaceData": "{...}",
      "District": "District 1",
      "AreaNo": 5
    }
  ]
}
```

## Frontend Usage

The admin dashboard automatically displays voter photos:

```javascript
// Photo is now displayed from PhotoPath
if (voter.PhotoPath) {
  // Display actual photo
  img.src = voter.PhotoPath; // e.g., "/uploads/voters/voter_123456_1705416800000.jpg"
} else if (voter.FaceData) {
  // Fallback: Face data exists but no photo
  displayPlaceholder("👤");
} else {
  // No photo or face data
  displayError("❌");
}
```

## Troubleshooting

### Photos not showing in admin dashboard?

1. **Check Face Recognition API is running:**

   ```bash
   # In a separate terminal (in face_recognition_using_Opencv folder)
   python face_recognition_api.py
   ```

   Should show: `Running on http://0.0.0.0:5001`

2. **Check backend is serving uploads:**

   - Open browser: `http://localhost:5500/uploads/voters/voter_123456_1705416800000.jpg`
   - If you see "Cannot GET", the backend uploads middleware is working but file doesn't exist

3. **Check database migration ran:**

   ```sql
   SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME='VoterInfo' AND COLUMN_NAME='PhotoPath';
   ```

   Should return PhotoPath column

4. **Check file permissions:**
   - Ensure `backend/uploads/voters/` directory has write permissions
   - Photos should be saved here when registering voters

### Error: "Cannot POST /api/voters/register-with-photo"

- Check backend server is running on port 5500
- Verify routes are loaded correctly
- Check backend console for errors

### Face Recognition API errors

- Ensure Python environment has required packages:
  ```bash
  pip install -r requirements.txt
  ```
- API must be running on port 5001
- Check .env configuration in face_recognition_using_Opencv/

## Database Schema

### VoterInfo Table Columns (Updated)

```sql
CREATE TABLE VoterInfo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  VoterName VARCHAR(255) NOT NULL,
  VoterId VARCHAR(255) NOT NULL UNIQUE,
  DateOfBirth DATE NOT NULL,
  FaceData TEXT, -- Face encoding (JSON string)
  FaceRegisteredAt DATETIME,
  PhotoPath VARCHAR(255), -- NEW COLUMN - Path to saved photo file
  District VARCHAR(100) NOT NULL,
  AreaNo INT NOT NULL,
  HasVoted INT DEFAULT 0
);
```

## Performance Tips

1. **Photo Storage:** Photos are stored as individual files for better performance
2. **CDN:** In production, consider serving photos from a CDN
3. **Compression:** Frontend can compress photos before uploading to reduce bandwidth

## Security Notes

- Photos are stored in `backend/uploads/voters/` directory
- Add `.gitignore` to prevent accidental commits of large photo files
- Consider implementing access control if needed
- Validate photo file types before processing

## Next Steps

1. ✅ Run migration script
2. ✅ Restart backend server (if it was running)
3. ✅ Open admin dashboard
4. ✅ Register a new voter with photo
5. ✅ View voter in "View All" tab - photo should now display!

---

**Questions or Issues?** Check the backend console logs and ensure:

- PostgreSQL is running
- Face Recognition API is running (port 5001)
- Backend server is running (port 5500)
