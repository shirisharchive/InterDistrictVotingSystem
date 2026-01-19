# Candidate Registration Error - Quick Fix Guide

## Problem

```
Error: Candidate does not exist in blockchain. Please register the candidate first in Admin Panel.
```

**Status Code:** 500 (Internal Server Error)  
**Endpoint:** `POST /api/vote`

---

## Root Cause

The smart contract validates that `candidateId < candidateCount`, meaning:

- Your database has the candidate record
- BUT the candidate was never registered on the blockchain (Ganache)
- OR the `BlockchainId` field is NULL in the database

---

## Quick Fixes

### **Option 1: Auto-Sync All Candidates (Recommended)**

Run this script to automatically register missing candidates on blockchain:

```powershell
# Navigate to backend directory
cd backend

# Run the sync script
node syncCandidatesToBlockchain.js
```

**What it does:**

1. Finds all candidates in database without a `BlockchainId`
2. Registers them on the blockchain
3. Updates the database with their blockchain IDs
4. Shows a summary of what was fixed

---

### **Option 2: Manual Re-registration in Admin Panel**

1. Go to **Admin Dashboard**
2. Go to **Manage Candidates** section
3. **Delete** all existing candidates (this removes them from DB)
4. **Re-register** each candidate fresh
   - Fill in all details: Name, Party, Position, etc.
   - Upload candidate photo
   - Upload party logo
5. The system will automatically register on blockchain

**Ensure Ganache is running:**

```powershell
ganache-cli --host 127.0.0.1 --port 7545
```

---

### **Option 3: Verify Current State**

Before fixing, check what's wrong:

```powershell
# Check database candidates
cd backend
node -e "
const CandidateInfo = require('./electionModel/CandidateInfo');
CandidateInfo.findAll().then(candidates => {
  console.log('Candidates in Database:');
  candidates.forEach(c => {
    console.log(\`  ID: \${c.id} | Name: \${c.CandidateName} | BlockchainId: \${c.BlockchainId}\`);
  });
  process.exit(0);
}).catch(err => console.error(err));
"
```

---

## Prevention Tips

### ✅ Before Casting Votes:

1. **Ensure Ganache is running:**

   ```powershell
   ganache-cli --host 127.0.0.1 --port 7545 --deterministic
   ```

2. **Register candidates in Admin Panel FIRST**
   - All candidates must be registered before voters can vote for them
   - Each registration creates a blockchain transaction

3. **Check Admin Panel shows success message:**
   - "Candidate registered successfully on both blockchain and database"

4. **Verify candidates appear in voting dashboard:**
   - Open voter dashboard
   - Confirm candidates are listed
   - This means they're on the blockchain

---

## If Still Getting Error

### Check 1: Is Ganache Running?

```powershell
# Test blockchain connection
cd backend
node -e "
const {testBlockchainConnection} = require('./config/blockchain');
testBlockchainConnection().then(() => {
  console.log('✅ Blockchain is reachable');
  process.exit(0);
}).catch(err => {
  console.log('❌ Blockchain error:', err.message);
  process.exit(1);
});
"
```

### Check 2: Database vs Blockchain Mismatch

```powershell
# Run diagnostic
cd backend
node syncCandidatesToBlockchain.js
# This will show exact mismatch details
```

### Check 3: Smart Contract State

```powershell
# Check what's registered on blockchain
cd backend
node -e "
const blockchainService = require('./SmartContract/blockchainService');
blockchainService.initialize().then(async () => {
  const count = await blockchainService.getCandidateCount();
  console.log('Candidates on blockchain:', count);
  const candidates = await blockchainService.getAllCandidates();
  console.log('Candidate details:', candidates);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
"
```

---

## Complete Recovery Process

If nothing works, do a **full reset**:

```powershell
# 1. Stop the server
# (Ctrl+C in the server terminal)

# 2. Restart Ganache with fresh state
ganache-cli --host 127.0.0.1 --port 7545 --deterministic

# 3. Redeploy smart contract
cd Contract
npm run migrate

# 4. Clear all election data from database
cd ../backend
node -e "
const {sequelize} = require('./config/database');
const VoteInfo = require('./electionModel/VoteInfo');
const CandidateInfo = require('./electionModel/CandidateInfo');
const PartyInfo = require('./electionModel/PartyInfo');
const VoterInfo = require('./electionModel/VoterInfo');

(async () => {
  await sequelize.truncate({cascade: true});
  console.log('✅ Database cleared');
  process.exit(0);
})();
"

# 5. Start server again
node server.js

# 6. Re-register candidates, parties, voters in Admin Panel
```

---

## Key Blockchain IDs to Understand

```
candidateId (blockchain) = BlockchainId (database)

When voting:
- Frontend sends: database candidate_id
- Backend converts to: BlockchainId
- Blockchain receives: BlockchainId
- Smart contract validates: BlockchainId < candidateCount
```

If `BlockchainId` is NULL, this fails!

---

## See Also

- [BLOCKCHAIN_RECOVERY_GUIDE.md](../BLOCKCHAIN_RECOVERY_GUIDE.md)
- [candidateController.js](./Controller/candidateController.js#L45)
- [blockchainService.js](./SmartContract/blockchainService.js#L209)
- [Voting.sol](../Contract/contracts/Voting.sol#L32)
