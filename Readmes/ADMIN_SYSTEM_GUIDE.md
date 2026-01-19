# Admin System - Implementation Guide

## Overview

The voting system now has a **separate admin route** with **district/area-based access control**. This ensures admins can only view voting results for their assigned district and area.

---

## Architecture

### 1. **Frontend Routes**

- **Voter Section**: `/frontend/pages/voter-login.html`
  - Face recognition login
  - Vote casting
- **Admin Section**: `/frontend/pages/admin-login.html` → `/frontend/pages/admin-dashboard.html`
  - Admin authentication
  - District-specific results viewing

### 2. **Backend Routes**

- **Voter Routes**: `/api/voters/`, `/api/votes/`
- **Admin Routes**: `/api/admin/` (NEW)
  - `POST /api/admin/login` - Admin authentication
  - `GET /api/admin/dashboard` - Admin dashboard data
  - `GET /api/admin/results/candidates` - Candidate results for admin's district
  - `GET /api/admin/results/parties` - Party results for admin's district
  - `GET /api/admin/admins` - List all admins (super admin only)
  - `POST /api/admin/admins/create` - Create new admin (super admin only)

---

## Database Schema

### New Tables

#### 1. **admins** Table

```sql
CREATE TABLE admins (
  admin_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **admin_assignments** Table

```sql
CREATE TABLE admin_assignments (
  assignment_id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(admin_id),
  district_id VARCHAR(50) NOT NULL,
  area_no VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(admin_id, district_id, area_no)
);
```

---

## Access Control Implementation

### Authentication Flow

```
Admin Login Request
    ↓
POST /api/admin/login
    ↓
Verify Email & Password
    ↓
Generate JWT Token (valid for 24 hours)
    ↓
Return Token + Admin Info
    ↓
Store Token in localStorage
```

### Authorization Flow

```
Admin Request (with token)
    ↓
verifyAdminAuth Middleware
    ↓
Token Valid? → Decode JWT
    ↓
verifyDistrictAccess Middleware
    ↓
Check: Is admin requesting their assigned district/area?
    ↓
YES ✓ → Allow Access
NO ✗ → 403 Forbidden
```

### Middleware Stack

1. **verifyAdminAuth**: Validates JWT token
2. **verifyDistrictAccess**: Checks district/area permissions
3. **verifySuperAdmin**: Allows only super admins for certain endpoints

---

## Admin Types

### 1. **Super Admin**

- `is_super_admin = true`
- Can access all districts
- Can create new admins
- Can manage all results

### 2. **District Admin**

- `is_super_admin = false`
- Assigned to specific district + area
- Can only view their district's results
- Cannot create other admins

---

## Default Credentials

After running the migration:

**Super Admin**

- Email: `admin@voting.com`
- Password: `admin123`

**District Admin (Kathmandu, Area 1)**

- Email: `kathmandu.admin@voting.com`
- Password: `admin123`

---

## API Endpoint Details

### Admin Login

```
POST /api/admin/login

Request Body:
{
  "adminEmail": "admin@voting.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "adminId": 1,
    "name": "Super Admin",
    "email": "admin@voting.com",
    "isSuperAdmin": true
  }
}
```

### Get Dashboard Data

```
GET /api/admin/dashboard

Headers:
{
  "Authorization": "Bearer <token>"
}

Response:
{
  "success": true,
  "data": {
    "district": "Kathmandu",
    "area": "1",
    "totalVoters": 5000,
    "votesCast": 3250,
    "turnout": "65.00%",
    "leadingCandidate": {
      "candidate_name": "John Doe",
      "party_name": "XYZ Party",
      "vote_count": 450
    },
    "leadingParty": {
      "party_name": "ABC Party",
      "vote_count": 1200
    }
  }
}
```

### Get Candidate Results

```
GET /api/admin/results/candidates

Headers:
{
  "Authorization": "Bearer <token>"
}

Query Parameters:
- districtId (optional): Filter by district
- areaNo (optional): Filter by area

Response:
{
  "success": true,
  "data": [
    {
      "candidate_id": 1,
      "candidate_name": "John Doe",
      "party_name": "XYZ Party",
      "vote_count": 450,
      "vote_percentage": 13.85
    },
    ...
  ]
}
```

---

## Security Features

✅ **JWT Token Authentication** - Secure token-based auth  
✅ **Password Hashing** - bcrypt hashing for passwords  
✅ **District/Area Access Control** - Admins confined to their area  
✅ **Super Admin Separation** - Different permissions for super admins  
✅ **Token Expiration** - 24-hour token validity  
✅ **HTTPS Ready** - Ready for production SSL/TLS

---

## User Flow

### Voter Journey

```
Home Page
  ↓
"Voter Portal" Button
  ↓
Voter Login Page
  ↓
Face Recognition & Verification
  ↓
Voter Dashboard
  ↓
Cast Vote
  ↓
Confirmation
```

### Admin Journey

```
Home Page
  ↓
"Admin Portal" Button
  ↓
Admin Login Page
  ↓
Admin Dashboard
  ↓
View District Results
  ↓
View Candidate/Party Votes
```

---

## Setting Up New Admins

### Super Admin Creates District Admin

```bash
POST /api/admin/admins/create

{
  "name": "Pokhara Admin",
  "email": "pokhara.admin@voting.com",
  "password": "secure_password",
  "districtId": "Pokhara",
  "areaNo": "2",
  "isSuperAdmin": false
}
```

---

## Testing the Admin System

### 1. Login as Admin

```javascript
fetch("http://localhost:5000/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    adminEmail: "admin@voting.com",
    password: "admin123",
  }),
});
```

### 2. Get Dashboard Data

```javascript
fetch("http://localhost:5000/api/admin/dashboard", {
  headers: {
    Authorization: "Bearer <token>",
  },
});
```

---

## File Structure

```
backend/
├── Middleware/
│   └── adminAuth.js (NEW) - Authentication & authorization
├── Controller/
│   └── adminController.js (NEW) - Admin business logic
├── Routes/
│   ├── adminRoutes.js (NEW) - Admin route definitions
│   └── index.js (UPDATED) - Added admin routes
├── migrations/
│   └── 001_create_admin_tables.sql (NEW) - Database schema

frontend/
├── pages/
│   ├── admin-login.html (NEW) - Admin login page
│   ├── admin-dashboard.html (NEW) - Admin dashboard
│   ├── voter-login.html (EXISTING) - Voter login
│   └── index.html (UPDATED) - Link to admin portal
```

---

## Installation Steps

1. **Run Database Migration**

```bash
psql -U postgres -d voting_system -f backend/migrations/001_create_admin_tables.sql
```

2. **Restart Backend**

```bash
npm start
```

3. **Access Admin Portal**

- Navigate to `http://localhost:3000/frontend/index.html`
- Click "Admin Portal"
- Login with default credentials

---

## Next Steps

- [ ] Implement 2FA for admin login
- [ ] Add admin audit logs
- [ ] Create admin user management page
- [ ] Add downloadable reports feature
- [ ] Implement real-time result updates using WebSockets
