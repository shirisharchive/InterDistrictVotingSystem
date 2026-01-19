# Image Upload Feature Guide

## 📸 Features Added

✅ **Drag & Drop Support** - Drag images directly into the upload area  
✅ **Click to Browse** - Click the upload area to select files from your computer  
✅ **Live Preview** - See image preview before submitting  
✅ **File Validation** - Only accepts image files (JPG, PNG, GIF, WEBP)  
✅ **Size Limit** - Maximum 5MB per image  
✅ **Remove Option** - Easy remove button to change selected image

## 🎯 Where to Use

### 1. Register Candidate (Admin Panel)

- **Candidate Photo** - Upload candidate's photo
- **Party Logo** - Upload party's logo/symbol

### 2. Register Party (Admin Panel)

- **Party Logo** - Upload political party logo

## 📋 How to Use

### Method 1: Drag & Drop

1. Open Admin Panel
2. Go to "Register Candidate" or "Register Party" tab
3. Drag an image file from your computer
4. Drop it into the upload area (📷 or 🎨 icon)
5. Preview appears automatically
6. Fill other fields and submit

### Method 2: Click to Browse

1. Click on the upload area
2. File browser opens
3. Select an image file
4. Preview appears automatically
5. Fill other fields and submit

### Remove/Change Image

- Click the "✕ Remove" button below the preview
- Upload area resets and you can select a new image

## 🔧 Technical Details

### Backend Changes

1. **Multer middleware** added for file uploads (`uploadMiddleware.js`)
2. **Upload directories** created:
   - `backend/uploads/candidates/` - Stores candidate photos
   - `backend/uploads/parties/` - Stores party logos
3. **Static file serving** - Images accessible via `/uploads/` URL
4. **Routes updated** - Added multer middleware to candidate and party registration

### Frontend Changes

1. **File input fields** replaced URL inputs
2. **Drag-and-drop handlers** added
3. **Image preview** functionality
4. **FormData API** used for multipart uploads
5. **Custom styling** for upload areas

### File Storage

- Images are saved with unique filenames: `candidate-[timestamp]-[random].ext`
- Stored locally in `backend/uploads/` directory
- Accessible via: `http://localhost:5500/uploads/candidates/filename.jpg`

## 🌐 API Changes

### Candidate Registration

**Endpoint:** `POST /api/candidates/register`

**Content-Type:** `multipart/form-data`

**Fields:**

- `candidate_name` (text)
- `party_name` (text)
- `position` (text)
- `District` (text)
- `AreaNo` (number)
- `candidate_photo` (file) - Optional
- `party_logo` (file) - Optional

### Party Registration

**Endpoint:** `POST /api/parties/register`

**Content-Type:** `multipart/form-data`

**Fields:**

- `party_name` (text)
- `District` (text)
- `AreaNo` (number)
- `party_logo` (file) - Optional

## 🎨 Supported Formats

✅ JPEG / JPG  
✅ PNG  
✅ GIF  
✅ WEBP

❌ Other formats will be rejected

## ⚙️ Configuration

### Change File Size Limit

Edit `backend/Middleware/uploadMiddleware.js`:

```javascript
limits: { fileSize: 5 * 1024 * 1024 }, // 5MB (change as needed)
```

### Change Upload Directory

Edit `backend/Middleware/uploadMiddleware.js`:

```javascript
const candidatesDir = path.join(uploadDir, "candidates");
const partiesDir = path.join(uploadDir, "parties");
```

### Add More File Types

Edit `backend/Middleware/uploadMiddleware.js`:

```javascript
const allowedTypes = /jpeg|jpg|png|gif|webp|svg/; // Add svg, etc.
```

## 🐛 Troubleshooting

### Images not uploading?

1. Check if `backend/uploads/` directory exists
2. Verify file size is under 5MB
3. Ensure file is an image format

### Can't see uploaded images?

1. Make sure backend server is running
2. Check if image path starts with `/uploads/`
3. Verify static file serving is configured in `server.js`

### Preview not showing?

1. Check browser console for errors
2. Ensure file is a valid image
3. Try different browser

## 📝 Example Usage

```javascript
// Frontend: Submit with files
const formData = new FormData();
formData.append("candidate_name", "John Doe");
formData.append("party_name", "Democratic Party");
formData.append("position", "Mayor");
formData.append("District", "District 1");
formData.append("AreaNo", 1);
formData.append("candidate_photo", photoFile);
formData.append("party_logo", logoFile);

await registerCandidateWithFiles(formData);
```

## 🔐 Security Notes

- Files are validated server-side
- Only image MIME types accepted
- File size limits enforced
- Unique filenames prevent conflicts
- Files stored outside web root (served via Express)

## ✨ Future Enhancements

Possible improvements:

- Image compression before upload
- Crop/resize functionality
- Multiple image uploads
- Cloud storage integration (AWS S3, Cloudinary)
- Image optimization
- CDN integration

---

**Note:** The uploads folder is gitignored to prevent committing user-uploaded files to version control.
