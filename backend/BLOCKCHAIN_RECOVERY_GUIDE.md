# Blockchain Data Recovery & Contract Address Verification

## Problem Statement

When the database is deleted, the system couldn't fetch data from the blockchain. Additionally, there was no verification that the current contract address matches the data stored in the database.

## Solution Implemented

### 1. Contract Address Management (`contractAddressManager.js`)

This utility tracks and verifies the blockchain contract address.

**Commands:**

```bash
# Save current contract address
node contractAddressManager.js --save

# Verify contract address (compare current with saved)
node contractAddressManager.js --verify

# Load saved contract address
node contractAddressManager.js --load

# Delete saved contract address
node contractAddressManager.js --delete
```

**What it does:**

- Saves the current contract address to `current_contract_address.json`
- Compares current contract with previously saved address
- Warns if there's a mismatch (indicating blockchain redeployment or network change)
- Helps detect when database and blockchain are out of sync

### 2. Data Recovery from Blockchain (`recoverFromBlockchain.js`)

This script fetches all data from blockchain and restores it to the database.

**Usage:**

```bash
node recoverFromBlockchain.js
```

**What it recovers:**

- ✅ All candidates with their details
- ✅ All parties with their details
- ✅ Vote counts (from blockchain)
- ⚠️ Voter IDs (but not full voter details - blockchain only stores IDs)

**Important Notes:**

- Some data like `District` and `AreaNo` for candidates cannot be fully recovered from blockchain (will be set to UNKNOWN/0)
- Voter full details need to be re-registered (blockchain only stores voter IDs)
- Vote transaction history is not recoverable from current blockchain implementation

### 3. New API Endpoints

#### Fetch Data Directly from Blockchain (No Database Dependency)

```http
# Get all candidates from blockchain only
GET /api/candidates/blockchain/all

# Get all parties from blockchain only
GET /api/parties/blockchain/all
```

These endpoints:

- Work even if the database is completely deleted
- Return data directly from blockchain
- Include vote counts from blockchain
- Don't require database lookup

#### Contract Address Verification Endpoints

```http
# Get current contract address info
GET /api/contract/address

# Verify contract address matches
GET /api/contract/verify

# Save current contract address
POST /api/contract/address/save
```

**Response Examples:**

When contract matches:

```json
{
  "success": true,
  "message": "Contract address verified successfully",
  "matches": true,
  "current": "0xABC...",
  "saved": "0xABC..."
}
```

When contract doesn't match:

```json
{
  "success": false,
  "message": "Contract address mismatch - database may be out of sync",
  "matches": false,
  "current": "0xABC...",
  "saved": "0xDEF...",
  "recommendation": "Run recovery script or reset database"
}
```

### 4. Automatic Verification on Server Startup

The server now automatically verifies the contract address when it starts:

```
Server is on
Press ctrl+c to exit
Database connection established successfully.
============================================================

🔍 Contract Address Verification

Current Contract Address: 0x1234...
Current Network ID: 5777

Saved Contract Address: 0x1234...
Saved Network ID: 5777
Saved At: 2025-12-27T10:30:00.000Z

✅ Contract address MATCHES - Data is consistent
============================================================
```

If there's a mismatch, you'll see:

```
⚠️  WARNING: Contract address MISMATCH - Database may be out of sync!
   This means the blockchain has been redeployed or you're using a different network.
   Your database data may not match the current blockchain state.

💡 Recommended Actions:
   1. Run 'node recoverFromBlockchain.js' to restore data from blockchain
   2. Or run 'node resetAndSyncDatabase.js' to reset and sync fresh
   3. Or update contract address: node contractAddressManager.js --save
```

## Usage Scenarios

### Scenario 1: Database Deleted Accidentally

```bash
# Option 1: Recover from blockchain
node recoverFromBlockchain.js

# Option 2: Use blockchain-only API endpoints
curl http://localhost:5500/api/candidates/blockchain/all
curl http://localhost:5500/api/parties/blockchain/all
```

### Scenario 2: Blockchain Redeployed (New Contract)

```bash
# 1. Reset database to match new blockchain
node resetAndSyncDatabase.js

# 2. Save new contract address
node contractAddressManager.js --save

# 3. Re-register all voters, candidates, and parties
```

### Scenario 3: Verify Data Consistency

```bash
# Check if database matches blockchain
node contractAddressManager.js --verify

# Or via API
curl http://localhost:5500/api/contract/verify
```

### Scenario 4: Fresh Installation

```bash
# 1. Deploy contract (in Contract directory)
cd Contract
truffle migrate --reset

# 2. Save contract address
cd ../backend
node contractAddressManager.js --save

# 3. Start server
npm start

# 4. Register data through API endpoints
```

## Files Created/Modified

### New Files:

1. **`contractAddressManager.js`** - Contract address verification and management
2. **`recoverFromBlockchain.js`** - Data recovery from blockchain
3. **`BLOCKCHAIN_RECOVERY_GUIDE.md`** - This documentation

### Modified Files:

1. **`backend/Routes/index.js`** - Added new endpoints
2. **`backend/Controller/candidateController.js`** - Added `getAllCandidatesFromBlockchain()`
3. **`backend/Controller/partyController.js`** - Added `getAllPartiesFromBlockchain()`
4. **`backend/config/startServer.js`** - Added automatic contract verification on startup

## API Documentation Update

Add these new endpoints to your API documentation:

### Blockchain-Only Data Retrieval

**GET** `/api/candidates/blockchain/all`

- Returns all candidates directly from blockchain
- Works even if database is deleted
- Response includes: id, name, party, position, voteCount, photoUrls

**GET** `/api/parties/blockchain/all`

- Returns all parties directly from blockchain
- Works even if database is deleted
- Response includes: id, partyName, partySymbol, partyLeader, voteCount, logoUrl

### Contract Verification

**GET** `/api/contract/address`

- Returns current and saved contract address information

**GET** `/api/contract/verify`

- Verifies if current contract matches saved address
- Returns match status and recommendations

**POST** `/api/contract/address/save` (requires admin auth)

- Saves current contract address as reference
- Use after deploying new contract

## Best Practices

1. **Always save contract address after deployment:**

   ```bash
   node contractAddressManager.js --save
   ```

2. **Verify contract address before important operations:**

   ```bash
   node contractAddressManager.js --verify
   ```

3. **Use blockchain-only endpoints for data recovery:**

   - When database is corrupted
   - When verifying data integrity
   - When you need guaranteed blockchain data

4. **Run recovery script after blockchain redeployment:**

   ```bash
   # If you want to keep old data
   node recoverFromBlockchain.js

   # If you want fresh start
   node resetAndSyncDatabase.js
   ```

5. **Monitor server startup messages:**
   - Check for contract address warnings
   - Verify blockchain connection status
   - Note any sync issues

## Limitations

1. **Voter Details:** Blockchain only stores voter IDs, not full voter information (name, address, etc.). Full voter details need to be re-registered.

2. **Area Information:** Candidate `District` and `AreaNo` cannot be recovered from blockchain. These will be set to "UNKNOWN" and 0 respectively.

3. **Vote History:** Individual vote transactions are not recoverable from the current blockchain implementation.

4. **Images/Files:** URLs are stored on blockchain, but actual image files must exist on the server filesystem.

## Troubleshooting

### Issue: "Contract not deployed on network"

**Solution:**

```bash
cd Contract
truffle migrate --reset
cd ../backend
node contractAddressManager.js --save
```

### Issue: "Contract address mismatch"

**Solution:**

```bash
# Option 1: Use current blockchain (recover data)
node recoverFromBlockchain.js

# Option 2: Reset everything (fresh start)
node resetAndSyncDatabase.js
node contractAddressManager.js --save
```

### Issue: "Cannot fetch data even from blockchain endpoints"

**Check:**

1. Is Ganache running?
2. Is contract deployed?
3. Is blockchain URL correct in .env?
4. Run: `node verifyBlockchain.js` to test blockchain connection

### Issue: "Data recovered but incomplete"

**Expected Behavior:**

- Candidates will have "UNKNOWN" district and 0 AreaNo
- Voters will only have IDs, not full details
- You need to manually update these fields or re-register

## Summary

This solution provides:

- ✅ Ability to fetch data from blockchain even when database is deleted
- ✅ Contract address verification to detect mismatches
- ✅ Automatic warnings when blockchain and database are out of sync
- ✅ Data recovery tools to restore from blockchain
- ✅ New API endpoints for blockchain-only data access
- ✅ Comprehensive tooling for contract address management

The system now ensures that **data stored in blockchain can always be retrieved** as long as the contract address matches, regardless of database state.
