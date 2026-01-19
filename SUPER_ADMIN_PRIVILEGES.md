# Super Admin Privileges - READ ONLY Access

## ✅ What Super Admin CAN Do

### 1. View Dashboard Statistics

- **Endpoint**: `GET /api/admin/dashboard`
- **Access**: All districts or filter by district/area
- **Returns**:
  - Total voters
  - Votes cast
  - Turnout percentage
  - Leading candidate
  - Leading party

### 2. View Candidate Results

- **Endpoint**: `GET /api/admin/results/candidates`
- **Access**: View all or filter by district/area
- **Filtering**:
  - `?districtId=kathmandu` - Filter by district
  - `?areaNo=1` - Filter by area number
  - `?districtId=kathmandu&areaNo=1` - Filter by both
- **Returns**:
  - Candidate ID
  - Candidate name
  - **Candidate image/photo** ✅
  - District
  - Area number
  - Party name
  - Vote count
  - Vote percentage

### 3. View Party Results

- **Endpoint**: `GET /api/admin/results/parties`
- **Access**: View all or filter by district/area
- **Filtering**:
  - `?districtId=kathmandu` - Filter by district
  - `?areaNo=1` - Filter by area number
  - `?districtId=kathmandu&areaNo=1` - Filter by both
- **Returns**:
  - Party ID
  - Party name
  - **Party logo** ✅
  - District
  - Area number
  - Vote count
  - Vote percentage

### 4. View Admin List

- **Endpoint**: `GET /api/admin/admins`
- **Access**: Super admin only
- **Returns**: List of all admin users

## ❌ What Super Admin CANNOT Do

### Completely Blocked Actions:

1. ❌ **Register voters** - Requires `verifyContractOwner`
2. ❌ **Register candidates** - Requires `verifyContractOwner`
3. ❌ **Register parties** - Requires `verifyContractOwner`
4. ❌ **Cast votes** - Not an admin function
5. ❌ **Modify blockchain data** - Requires `verifyContractOwner`
6. ❌ **Create/modify admins** - Route disabled for security
7. ❌ **Delete any data** - No delete endpoints available

## Security Implementation

### Middleware Protection

- `verifyAdminAuth` - Validates JWT token
- `verifyDistrictAccess` - Allows super admin to bypass district restrictions
- `verifyContractOwner` - Blocks admin from write operations

### Read-Only Enforcement

All super admin endpoints use:

- `GET` methods only
- No `POST`, `PUT`, `PATCH`, or `DELETE` methods
- No data modification queries (only SELECT)

## Example Usage

### Login as Super Admin

```bash
POST http://localhost:5500/api/admin/login
{
  "adminEmail": "admin@voting.com",
  "password": "admin123"
}
```

### Get All Candidate Results

```bash
GET http://localhost:5500/api/admin/results/candidates
Authorization: Bearer <token>
```

### Get Filtered Results (Kathmandu District, Area 1)

```bash
GET http://localhost:5500/api/admin/results/candidates?districtId=kathmandu&areaNo=1
Authorization: Bearer <token>
```

### Response Example

```json
{
  "success": true,
  "data": [
    {
      "candidate_id": 1,
      "candidate_name": "John Doe",
      "candidate_image": "/uploads/candidates/john-doe.jpg",
      "district": "kathmandu",
      "area_no": 1,
      "party_name": "Democratic Party",
      "vote_count": 1250,
      "vote_percentage": 45.5
    }
  ],
  "district": "kathmandu",
  "area": 1,
  "message": "Candidate results retrieved successfully"
}
```

## Database Tables Used (Read-Only)

- `VoterInfo` - Voter information
- `CandidateInfo` - Candidate details with photos
- `PartyInfo` - Party details with logos
- `VoteInfo` - Direct candidate votes
- `IndirectVoteInfo` - Party votes
- `admins` - Admin user accounts
- `admin_assignments` - District/area assignments

## Credentials

- **Email**: admin@voting.com
- **Password**: admin123
- **Type**: Super Admin (read-only access to all districts)

---

**Last Updated**: January 17, 2026  
**Status**: ✅ Implemented and Secured
