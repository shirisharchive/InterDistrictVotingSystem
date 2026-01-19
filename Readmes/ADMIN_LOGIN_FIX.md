# Admin Login 401 Error - FIXED ✅

## Problem Summary

The admin login was returning a **401 Unauthorized** error due to corrupted/truncated password hashes in the database.

## Root Cause

The password hashes stored in the `admins` table were truncated, making bcrypt password verification fail. A bcrypt hash should be 60 characters long, but the stored hashes were incomplete.

## Solution Applied

Ran `fixAdminTable.js` script which:

1. ✅ Verified and fixed the `password_hash` column length (VARCHAR(255))
2. ✅ Recreated admin tables with proper structure
3. ✅ Generated new admin accounts with proper 60-character bcrypt hashes
4. ✅ Verified password verification works correctly

## Current Admin Credentials

### Super Admin

- **Email**: `admin@voting.com`
- **Password**: `admin123`
- **Access**: Full system access

### Kathmandu District Admin

- **Email**: `kathmandu.admin@voting.com`
- **Password**: `kathmandu123`
- **Access**: Kathmandu district only (Area 1)

⚠️ **IMPORTANT**: Please change these default passwords after your first login!

## Login Endpoint

```
POST http://localhost:5500/api/admin/login

Body:
{
  "adminEmail": "admin@voting.com",
  "password": "admin123"
}
```

## Verification

The fix has been tested and confirmed working:

- ✅ Password hashes are 60 characters long
- ✅ bcrypt verification passes
- ✅ Login endpoint returns success with JWT token
- ✅ Admin information is correctly returned

## If You Encounter Issues Again

Run the fix script again:

```powershell
cd backend
node fixAdminTable.js
```

## Next Steps

1. Try logging in at: http://localhost:5500/pages/admin-login.html
2. Use credentials: `admin@voting.com` / `admin123`
3. Change the default password after first login
4. Create additional admin accounts as needed through the Super Admin panel
