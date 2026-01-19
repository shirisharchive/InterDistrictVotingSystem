# Voting System API Documentation

## Base URL

```
http://localhost:5500/api
```

## Authentication

- Most routes require blockchain connection verification
- Admin routes require contract owner verification (controlled via smart contract)

---

## 📋 Table of Contents

1. [Voter Routes](#voter-routes)
2. [Candidate Routes](#candidate-routes)
3. [Voting Routes](#voting-routes)
4. [Party Routes](#party-routes)
5. [Indirect Voting Routes (Party Voting)](#indirect-voting-routes)
6. [Health Check](#health-check)

---

## Voter Routes

### 1. Register Voter

**POST** `/api/voters/register`

Registers a new voter in both the blockchain and database.

**Authorization:** Contract Owner Required

**Request Body:**

```json
{
  "voterName": "John Doe",
  "voterId": "V123456",
  "dateOfBirth": "1990-01-15",
  "passportNo": "AB1234567",
  "district": "District A",
  "areaNo": "Area 1"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Voter registered successfully",
  "voter": {
    "id": 1,
    "VoterName": "John Doe",
    "VoterId": "V123456",
    "DateOfBirth": "1990-01-15",
    "PassportNo": "AB1234567",
    "District": "District A",
    "AreaNo": "Area 1",
    "HasVoted": 0
  }
}
```

---

### 2. Get All Voters

**GET** `/api/voters`

Retrieves all registered voters from the database.

**Response:**

```json
{
  "success": true,
  "count": 10,
  "voters": [
    {
      "id": 1,
      "VoterName": "John Doe",
      "VoterId": "V123456",
      "DateOfBirth": "1990-01-15",
      "PassportNo": "AB1234567",
      "District": "District A",
      "AreaNo": "Area 1",
      "HasVoted": 0
    }
  ]
}
```

---

### 3. Get Voter by ID

**GET** `/api/voters/:voter_id`

Retrieves a specific voter's information by their VoterId.

**Parameters:**

- `voter_id` (string) - Voter ID (e.g., "V123456")

**Response:**

```json
{
  "success": true,
  "voter": {
    "id": 1,
    "VoterName": "John Doe",
    "VoterId": "V123456",
    "DateOfBirth": "1990-01-15",
    "PassportNo": "AB1234567",
    "District": "District A",
    "AreaNo": "Area 1",
    "HasVoted": 0
  }
}
```

---

### 4. Get Total Voter Count

**GET** `/api/voters/count`

Returns the total number of registered voters from the blockchain.

**Response:**

```json
{
  "success": true,
  "totalVoters": 150
}
```

---

## Candidate Routes

### 1. Register Candidate

**POST** `/api/candidates/register`

Registers a new candidate with image upload support.

**Authorization:** Contract Owner Required

**Content-Type:** `multipart/form-data`

**Form Data:**

```
candidateName: "Jane Smith"
candidateParty: "Party A"
candidatePosition: "Mayor"
district: "District A"
areaNo: "Area 1"
candidateImage: [File]
candidateElectionLogo: [File]
```

**Response:**

```json
{
  "success": true,
  "message": "Candidate registered successfully",
  "candidate": {
    "id": 1,
    "CandidateName": "Jane Smith",
    "CandidateParty": "Party A",
    "CandidatePosition": "Mayor",
    "CandidateImage": "/uploads/candidates/image123.jpg",
    "CandidateElectionLogo": "/uploads/candidates/logo123.jpg",
    "District": "District A",
    "AreaNo": "Area 1"
  }
}
```

---

### 2. Get All Candidates

**GET** `/api/candidates`

Retrieves all candidates from the database.

**Response:**

```json
{
  "success": true,
  "count": 25,
  "candidates": [
    {
      "id": 1,
      "CandidateName": "Jane Smith",
      "CandidateParty": "Party A",
      "CandidatePosition": "Mayor",
      "District": "District A",
      "AreaNo": "Area 1"
    }
  ]
}
```

---

### 3. Get Candidate by ID

**GET** `/api/candidates/:candidateId`

Retrieves a specific candidate's information.

**Parameters:**

- `candidateId` (integer) - Candidate database ID

**Response:**

```json
{
  "success": true,
  "candidate": {
    "id": 1,
    "CandidateName": "Jane Smith",
    "CandidateParty": "Party A",
    "CandidatePosition": "Mayor",
    "CandidateImage": "/uploads/candidates/image123.jpg",
    "District": "District A",
    "AreaNo": "Area 1"
  }
}
```

---

### 4. Get Candidate Count

**GET** `/api/candidates/count`

Returns the total number of registered candidates from the blockchain.

**Response:**

```json
{
  "success": true,
  "candidateCount": 25
}
```

---

### 5. Get All Candidates with Vote Results

**GET** `/api/candidates/results`

Retrieves all candidates along with their vote counts from the blockchain.

**Response:**

```json
{
  "success": true,
  "candidates": [
    {
      "id": "1",
      "name": "Jane Smith",
      "party": "Party A",
      "voteCount": "45"
    }
  ]
}
```

---

## Voting Routes

### 1. Cast Vote

**POST** `/api/vote`

Allows a voter to cast their vote for a candidate. Stores vote in both blockchain and database.

**Request Body:**

```json
{
  "voterId": "V123456",
  "candidateId": 1,
  "district": "District A",
  "areaNo": "Area 1"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Vote cast successfully",
  "vote": {
    "id": 1,
    "VoterId": "V123456",
    "CandidateId": 1,
    "District": "District A",
    "AreaNo": "Area 1",
    "VoteTime": "2025-12-26T10:30:00.000Z",
    "TransactionHash": "0xabc123...",
    "BlockNumber": "1234"
  }
}
```

---

### 2. Get Total Votes

**GET** `/api/votes/total`

Returns the total number of votes cast in the blockchain.

**Response:**

```json
{
  "success": true,
  "totalVotes": 120
}
```

---

### 3. Get Voting Results

**GET** `/api/votes/results`

Retrieves voting results for all candidates from the blockchain.

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "candidateId": "1",
      "candidateName": "Jane Smith",
      "voteCount": "45"
    }
  ]
}
```

---

### 4. Get Vote History

**GET** `/api/votes/history`

Retrieves the most recent votes from the database.

**Query Parameters:**

- `limit` (integer, optional) - Number of records to return (default: 100)

**Response:**

```json
{
  "success": true,
  "count": 100,
  "data": [
    {
      "id": 1,
      "VoterId": "V123456",
      "CandidateId": 1,
      "District": "District A",
      "AreaNo": "Area 1",
      "VoteTime": "2025-12-26T10:30:00.000Z",
      "TransactionHash": "0xabc123...",
      "BlockNumber": "1234"
    }
  ]
}
```

---

### 5. Check Voter Status

**GET** `/api/votes/status/:voter_id`

Checks if a voter has already voted.

**Parameters:**

- `voter_id` (string) - Voter ID (e.g., "V123456")

**Response:**

```json
{
  "success": true,
  "hasVoted": false,
  "voterId": "V123456"
}
```

---

## Party Routes

### 1. Register Party

**POST** `/api/parties/register`

Registers a new political party with logo upload support.

**Authorization:** Contract Owner Required

**Content-Type:** `multipart/form-data`

**Form Data:**

```
partyName: "Party A"
district: "District A"
areaNo: "Area 1"
partyLogo: [File]
```

**Response:**

```json
{
  "success": true,
  "message": "Party registered successfully",
  "party": {
    "id": 1,
    "PartyName": "Party A",
    "PartyLogo": "/uploads/parties/logo123.jpg",
    "District": "District A",
    "AreaNo": "Area 1"
  }
}
```

---

### 2. Get All Parties

**GET** `/api/parties`

Retrieves all registered parties from the database.

**Response:**

```json
{
  "success": true,
  "count": 5,
  "parties": [
    {
      "id": 1,
      "PartyName": "Party A",
      "PartyLogo": "/uploads/parties/logo123.jpg",
      "District": "District A",
      "AreaNo": "Area 1"
    }
  ]
}
```

---

### 3. Get Party by ID

**GET** `/api/parties/:partyId`

Retrieves a specific party's information.

**Parameters:**

- `partyId` (integer) - Party database ID

**Response:**

```json
{
  "success": true,
  "party": {
    "id": 1,
    "PartyName": "Party A",
    "PartyLogo": "/uploads/parties/logo123.jpg",
    "District": "District A",
    "AreaNo": "Area 1"
  }
}
```

---

### 4. Get Party Count

**GET** `/api/parties/count`

Returns the total number of registered parties from the blockchain.

**Response:**

```json
{
  "success": true,
  "partyCount": 5
}
```

---

### 5. Get All Parties with Vote Results

**GET** `/api/parties/results`

Retrieves all parties along with their vote counts from the blockchain.

**Response:**

```json
{
  "success": true,
  "parties": [
    {
      "id": "1",
      "name": "Party A",
      "voteCount": "78"
    }
  ]
}
```

---

## Indirect Voting Routes

### 1. Vote for Party

**POST** `/api/vote/party`

Allows a voter to cast their indirect vote for a political party.

**Request Body:**

```json
{
  "voterId": "V123456",
  "partyId": 1,
  "district": "District A",
  "areaNo": "Area 1"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Party vote cast successfully",
  "vote": {
    "id": 1,
    "VoterId": "V123456",
    "PartyId": 1,
    "District": "District A",
    "AreaNo": "Area 1",
    "VoteTime": "2025-12-26T10:35:00.000Z",
    "TransactionHash": "0xdef456...",
    "BlockNumber": "1235"
  }
}
```

---

### 2. Get Total Party Votes

**GET** `/api/vote/party/total`

Returns the total number of party votes cast in the blockchain.

**Response:**

```json
{
  "success": true,
  "totalPartyVotes": 95
}
```

---

### 3. Check Party Vote Status

**GET** `/api/vote/party/status/:voter_id`

Checks if a voter has already voted for a party.

**Parameters:**

- `voter_id` (string) - Voter ID (e.g., "V123456")

**Response:**

```json
{
  "success": true,
  "hasVotedForParty": false,
  "voterId": "V123456"
}
```

---

## Health Check

### Check API Status

**GET** `/api/health`

Health check endpoint to verify API is running.

**Response:**

```json
{
  "success": true,
  "message": "Voting System API is running",
  "timestamp": "2025-12-26T10:00:00.000Z"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Contract owner verification required"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Error message details"
}
```

---

## Notes

1. **Blockchain Connection**: All routes require an active connection to Ganache (localhost:7545)
2. **Contract Owner**: Admin routes require the request to come from the contract owner's address
3. **File Uploads**: Use `multipart/form-data` for endpoints with file uploads
4. **Vote Tracking**: Each voter can vote once for a candidate and once for a party. The `HasVoted` flag in VoterInfo is updated after the first candidate vote.
5. **Session Management**: Voters have 15 minutes to complete their voting session
6. **Date Format**: DateOfBirth uses `YYYY-MM-DD` format
7. **BigInt Handling**: All blockchain-related numeric values are converted to strings for JSON compatibility

---

## Smart Contract Address

```
Network ID: 5777
Contract Address: 0xD60e11787e2c61798A98B60a315ff782Cd580f84
```

---

## Database Schema

**VoterInfo:**

- id (Primary Key)
- VoterName
- VoterId (Unique)
- DateOfBirth
- PassportNo
- District
- AreaNo
- HasVoted (0 or 1)

**CandidateInfo:**

- id (Primary Key)
- CandidateName
- CandidateParty
- CandidatePosition
- CandidateImage
- CandidateElectionLogo
- District
- AreaNo

**PartyInfo:**

- id (Primary Key)
- PartyName
- PartyLogo
- District
- AreaNo

**VoteInfo:**

- id (Primary Key)
- VoterId
- CandidateId
- District
- AreaNo
- VoteTime
- TransactionHash
- BlockNumber

**IndirectVoteInfo:**

- id (Primary Key)
- VoterId
- PartyId
- District
- AreaNo
- VoteTime
- TransactionHash
- BlockNumber

---

## Testing with Postman/Thunder Client

### Example: Register Voter

```bash
POST http://localhost:5500/api/voters/register
Content-Type: application/json

{
  "voterName": "John Doe",
  "voterId": "V123456",
  "dateOfBirth": "1990-01-15",
  "passportNo": "AB1234567",
  "district": "District A",
  "areaNo": "Area 1"
}
```

### Example: Cast Vote

```bash
POST http://localhost:5500/api/vote
Content-Type: application/json

{
  "voterId": "V123456",
  "candidateId": 1,
  "district": "District A",
  "areaNo": "Area 1"
}
```

---

**Last Updated:** December 26, 2025
