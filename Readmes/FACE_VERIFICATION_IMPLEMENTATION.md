# Face Verification Flag Implementation Guide

## Overview

Your voting system now has a **face verification flag** (`IsFaceMatched`) that tracks whether a voter's face has been successfully verified during login.

## Database Schema

### VoterInfo Table - New Column

```sql
IsFaceMatched INT DEFAULT 0
- 0 = Face not verified (initial state)
- 1 = Face verified during login
```

### Combined with Existing Flags

```sql
FaceData         TEXT          -- Face encoding data
IsFaceMatched    INT DEFAULT 0 -- Face verified status
HasVoted         INT DEFAULT 0 -- Voting status
```

## Voting Flow with Face Verification

```
┌─────────────────────────┐
│  Voter Login Attempt    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Check IsFaceMatched Flag      │
├─────────────────────────────────┤
│ If 0: Face not verified        │
│ If 1: Face verified ✅         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Perform Face Recognition       │
├─────────────────────────────────┤
│ Compare uploaded photo with    │
│ stored face encoding            │
└────────────┬────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   MATCH       NO MATCH
      │             │
      │             └──► Show "Face not recognized"
      │                   Allow retry (IsFaceMatched = 0)
      │
      ▼
┌──────────────────────────┐
│ Set IsFaceMatched = 1   │
│ Save verification time  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Check HasVoted Flag     │
├──────────────────────────┤
│ If 0: Allow voting      │
│ If 1: Show error        │
└──────────────────────────┘
```

## API Endpoints

### 1. Register Voter with Photo

```
POST /api/voters/register-with-photo
```

**Response:** Creates voter with IsFaceMatched = 0

### 2. Verify Voter Face (NEW)

```
POST /api/voters/verify-face
```

**Request:**

```json
{
  "voterId": "V12345",
  "dob": "1990-01-15",
  "photo": "data:image/jpeg;base64,..." // Voter's current photo for verification
}
```

**Response - Success:**

```json
{
  "success": true,
  "message": "Face verification successful",
  "data": {
    "id": 1,
    "voterId": "V12345",
    "voterName": "John Doe",
    "isFaceMatched": 1,
    "district": "District 1",
    "areaNo": 5
  }
}
```

**Response - Failed (Face doesn't match):**

```json
{
  "success": false,
  "message": "Face verification failed: Face does not match stored data"
}
```

**Response - Already voted:**

```json
{
  "success": false,
  "message": "You have already voted. Voting is not allowed twice."
}
```

### 3. Check Voting Eligibility (NEW)

```
GET /api/voters/can-vote/:voterId
```

**Response - Can vote:**

```json
{
  "success": true,
  "message": "Voter is eligible to vote",
  "canVote": true,
  "data": {
    "voterId": "V12345",
    "voterName": "John Doe",
    "isFaceMatched": 1,
    "hasVoted": 0
  }
}
```

**Response - Face not verified:**

```json
{
  "success": false,
  "message": "Face verification required before voting",
  "canVote": false
}
```

**Response - Already voted:**

```json
{
  "success": false,
  "message": "You have already voted",
  "canVote": false
}
```

## Setup Instructions

### Step 1: Run Migration

```bash
cd backend
node addIsFaceMatchedColumn.js
```

**Output:**

```
✅ Database connection successful
🔄 Adding IsFaceMatched column to VoterInfo table...
✅ IsFaceMatched column added successfully
✨ Migration completed!
```

### Step 2: Restart Backend Server

```bash
npm start
```

### Step 3: Test the Flow

**Test Scenario 1: Successful Face Verification**

```
1. Voter registered: IsFaceMatched = 0
2. Voter attempts login with face
3. Face matches → IsFaceMatched = 1
4. Now eligible to vote
5. After voting → HasVoted = 1
```

**Test Scenario 2: Face Doesn't Match**

```
1. Voter registered: IsFaceMatched = 0
2. Voter attempts login with wrong photo
3. Face doesn't match → Error shown
4. IsFaceMatched stays 0
5. Voter can retry
```

**Test Scenario 3: Already Voted**

```
1. Voter registered: IsFaceMatched = 0
2. Voter verifies face: IsFaceMatched = 1
3. Voter votes: HasVoted = 1
4. Voter tries to vote again
5. System shows: "You have already voted"
```

## Frontend Integration

### Voter Login Page

```javascript
// 1. Get voter credentials
const voterId = document.getElementById("voterId").value;
const dob = document.getElementById("dob").value;
const photoData = capturedPhoto; // From camera or upload

// 2. Verify face
const response = await fetch("/api/voters/verify-face", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    voterId: voterId,
    dob: dob,
    photo: photoData,
  }),
});

const result = await response.json();

if (result.success) {
  // IsFaceMatched = 1, proceed to voting
  console.log("Face verified! Can now vote.");
  goToVotingPage();
} else {
  // Face didn't match or already voted
  console.log(result.message);
}
```

### Voting Page

```javascript
// Before allowing vote
const canVoteResponse = await fetch(`/api/voters/can-vote/${voterId}`);
const canVoteResult = await canVoteResponse.json();

if (canVoteResult.canVote) {
  // Allow voting
  enableVotingInterface();
} else {
  // Show error message
  showError(canVoteResult.message);
}
```

## Database Query Examples

### Check voter verification status

```sql
SELECT VoterId, VoterName, IsFaceMatched, HasVoted
FROM VoterInfo
WHERE VoterId = 'V12345';
```

### Find unverified voters

```sql
SELECT * FROM VoterInfo
WHERE IsFaceMatched = 0;
```

### Find voters who verified but didn't vote

```sql
SELECT * FROM VoterInfo
WHERE IsFaceMatched = 1 AND HasVoted = 0;
```

### Find voters who completed voting

```sql
SELECT * FROM VoterInfo
WHERE IsFaceMatched = 1 AND HasVoted = 1;
```

## Security Features

✅ **Face Verification Checkpoint**

- Ensures voter identity before voting
- Prevents unauthorized voting

✅ **Prevents Double Voting**

- HasVoted flag tracks completion
- IsFaceMatched flag tracks verification

✅ **Retry Mechanism**

- Failed face matches don't set flag to 1
- Voter can attempt verification again

✅ **Audit Trail**

- FaceVerifiedAt timestamp (added to model)
- Tracks when face was verified
- Useful for election audits

## Troubleshooting

| Issue                          | Solution                                        |
| ------------------------------ | ----------------------------------------------- |
| IsFaceMatched column not found | Run migration: `node addIsFaceMatchedColumn.js` |
| Face verification always fails | Ensure Face API is running on port 5001         |
| "Already voted" error          | HasVoted = 1, check database                    |
| Can't retry face verification  | IsFaceMatched should be 0 for new attempts      |

## Summary

Your voting system now has:

- ✅ Face registration (during voter registration)
- ✅ Face verification (during login)
- ✅ Face matching flag (IsFaceMatched)
- ✅ Voting eligibility check
- ✅ Double voting prevention

This provides a **secure, face-based voting system** with proper verification and audit trails!
