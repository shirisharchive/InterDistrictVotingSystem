# Admin Login 401 Error - Troubleshooting Guide

## Error: "POST http://localhost:5500/api/admin/login 401 (Unauthorized)"

### ✅ Quick Fix

The 401 error means **invalid credentials**. Use the correct login information:

**Default Super Admin Credentials:**

- **Email**: `admin@voting.com`
- **Password**: `admin123`

**Kathmandu District Admin:**

- **Email**: `kathmandu.admin@voting.com`
- **Password**: `kathmandu123`

### Common Causes

1. **Wrong Email or Password** ❌
   - Make sure you're typing the exact credentials above
   - Check for extra spaces
   - Password is case-sensitive

2. **Server Not Running** ❌
   - Make sure backend server is running on port 5500
   - Check terminal for server output
   - Restart server: `cd backend && npm start`

3. **Database Issue** ❌
   - Admin table might be corrupted
   - Run fix script: `cd backend && node fixAdminTable.js`

### Testing the Backend

Run this command to verify the admin account exists and password is correct:

```powershell
cd backend
node testAdminLogin.js
```

**Expected output:**

```
Testing admin login...

Admins in database:
  1. Super Admin (admin@voting.com) - Super: true, Hash: 60 chars
  2. Kathmandu Admin (kathmandu.admin@voting.com) - Super: false, Hash: 60 chars

Testing password for admin@voting.com...
Admin found: Super Admin
Password hash length: 60

Password test result: ✓ VALID
✓ Password is correct
```

### Testing the API Endpoint

```powershell
$body = @{
    adminEmail = "admin@voting.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5500/api/admin/login" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Expected response:**

```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGc...",
  "admin": {
    "adminId": 1,
    "name": "Super Admin",
    "email": "admin@voting.com",
    "isSuperAdmin": true
  }
}
```

### Fixing Corrupted Passwords

If the password test fails, reset the admin table:

```powershell
cd backend
node fixAdminTable.js
```

This will:

- ✅ Fix the password hash column length
- ✅ Recreate admin accounts with correct hashes
- ✅ Verify password validation works

### Frontend Updates

The login page now shows:

- ✅ Default credentials hint box
- ✅ Better error messages (shows if email/password is wrong)
- ✅ Connection error detection

### Still Having Issues?

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Check browser console** for detailed errors (F12)
3. **Verify server is running**: Look for "Server running on port 5500"
4. **Check database connection**: Server should connect to PostgreSQL

### Quick Server Restart

```powershell
# Stop the server (Ctrl+C in the terminal)
# Then restart:
cd backend
npm start
```

The server should show:

```
✅ Database connected successfully
✅ Blockchain connected to http://localhost:7545
🚀 Server is running on port 5500
🚀 Starting Face Recognition API...
```

---

**Last Updated**: January 17, 2026  
**Status**: ✅ Working - Use correct credentials
