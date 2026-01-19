# Quick Start: Fetching Blockchain Data After Database Deletion

## The Problem You Had

❌ When database was deleted, you couldn't fetch data from blockchain  
❌ No way to verify if contract address matches the stored data

## The Solution Now

✅ Data can ALWAYS be fetched from blockchain  
✅ Contract address is verified automatically  
✅ Database can be recovered from blockchain  
✅ New endpoints work without database dependency

---

## Quick Commands

### After Database is Deleted - Recover Data

```bash
# Recover all data from blockchain to database
npm run blockchain:recover
```

### Verify Everything is in Sync

```bash
# Check if contract address matches
npm run contract:verify

# Check what's on blockchain
npm run blockchain:verify
```

### After Deploying New Contract

```bash
# Save the new contract address
npm run contract:save

# Reset database and sync with new contract
npm run db:reset
```

---

## New API Endpoints

### 🔥 Fetch from Blockchain Only (No Database Needed)

**These work even if database is completely deleted!**

```bash
# Get all candidates from blockchain
GET http://localhost:5500/api/candidates/blockchain/all

# Get all parties from blockchain
GET http://localhost:5500/api/parties/blockchain/all
```

Example Response:

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 0,
      "name": "John Doe",
      "party": "Party A",
      "position": "Mayor",
      "voteCount": 150,
      "candidatePhotoUrl": "/uploads/candidates/photo.jpg",
      "candidatePartyLogoUrl": "/uploads/parties/logo.jpg"
    }
  ],
  "source": "blockchain",
  "message": "Data fetched directly from blockchain"
}
```

### 🔐 Contract Verification

```bash
# Check contract address
GET http://localhost:5500/api/contract/verify

# Save current contract address
POST http://localhost:5500/api/contract/address/save
```

---

## Step-by-Step Recovery Process

### Scenario: Database Got Deleted

**Step 1:** Start your blockchain (Ganache)

```bash
# Open Ganache - make sure it's running on port 7545
```

**Step 2:** Check what's on blockchain

```bash
npm run blockchain:verify
```

**Step 3:** Recover data to database

```bash
npm run blockchain:recover
```

**Step 4:** Start the server

```bash
npm start
```

✅ **Done!** Your data is recovered from blockchain

---

## What Gets Recovered?

| Data Type        | Recovered? | Notes                                |
| ---------------- | ---------- | ------------------------------------ |
| ✅ Candidates    | Yes        | Name, party, position, votes, photos |
| ✅ Parties       | Yes        | Name, symbol, leader, votes, logos   |
| ✅ Vote Counts   | Yes        | Direct from blockchain               |
| ⚠️ Voters        | Partial    | Only IDs, not full details           |
| ❌ Vote History  | No         | Not stored in current blockchain     |
| ⚠️ District/Area | No         | Set to UNKNOWN/0                     |

---

## Automatic Warnings

When you start the server, it now checks automatically:

```
✅ Contract address MATCHES - Data is consistent
```

or

```
⚠️  WARNING: Contract address MISMATCH
   Database may be out of sync with blockchain!

💡 Recommended: Run 'npm run blockchain:recover'
```

---

## Common Scenarios

### 1️⃣ Database Deleted - Want to Recover

```bash
npm run blockchain:recover
npm start
```

### 2️⃣ New Contract Deployed - Fresh Start

```bash
npm run contract:save
npm run db:reset
npm start
```

### 3️⃣ Check if Data Matches Blockchain

```bash
npm run contract:verify
npm run blockchain:verify
```

### 4️⃣ Fetch Data Without Using Database

```bash
# Use the blockchain-only endpoints
curl http://localhost:5500/api/candidates/blockchain/all
curl http://localhost:5500/api/parties/blockchain/all
```

---

## Testing the Solution

### Test 1: Delete Database and Fetch Data

```bash
# 1. Delete database (or drop all tables)
psql -U postgres -d voting_system -c "DROP SCHEMA public CASCADE;"

# 2. Fetch from blockchain (still works!)
curl http://localhost:5500/api/candidates/blockchain/all

# 3. Recover database
npm run blockchain:recover

# 4. Normal endpoints work again
curl http://localhost:5500/api/candidates
```

### Test 2: Contract Address Verification

```bash
# 1. Save current contract
npm run contract:save

# 2. Redeploy contract in Ganache
cd Contract
truffle migrate --reset

# 3. Verify (will show mismatch)
npm run contract:verify

# 4. Save new contract address
npm run contract:save
```

---

## Important Notes

⚠️ **What You Can't Recover:**

- Full voter details (name, address, etc.) - only voter IDs
- Individual vote transaction history
- Candidate district/area information
- Image files (only URLs are stored)

💡 **Best Practice:**
After blockchain redeployment, always run:

```bash
npm run contract:save
```

🔥 **Pro Tip:**
Use the blockchain-only endpoints (`/blockchain/all`) when:

- Database is down or corrupted
- You want guaranteed blockchain data
- Verifying data integrity

---

## Summary

Your system now has **THREE WAYS** to fetch data:

1. **Normal endpoints** - Fetch from database (merged with blockchain votes)

   ```
   GET /api/candidates
   GET /api/parties
   ```

2. **Results endpoints** - Fetch from blockchain merged with DB details

   ```
   GET /api/candidates/results
   GET /api/parties/results
   ```

3. **🆕 Blockchain-only endpoints** - Pure blockchain (no DB needed)
   ```
   GET /api/candidates/blockchain/all
   GET /api/parties/blockchain/all
   ```

✅ **Even if the database is completely deleted, you can fetch data from blockchain!**
✅ **Contract address is verified automatically on server startup!**
✅ **Full recovery scripts included!**

For detailed documentation, see: [BLOCKCHAIN_RECOVERY_GUIDE.md](BLOCKCHAIN_RECOVERY_GUIDE.md)
