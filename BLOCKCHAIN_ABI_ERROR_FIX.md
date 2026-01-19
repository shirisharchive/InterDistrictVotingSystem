# 🔧 ABI DECODING ERROR - BLOCKCHAIN RECOVERY GUIDE

## Error You're Getting

```
Error fetching blockchain data: Parameter decoding error:
Returned values aren't valid, did it run Out of Gas?
You might also see this error if you are not using the correct ABI
for the contract you are retrieving data from...
```

**Root Cause:** Smart contract was redeployed on Ganache, but your backend is still using the OLD contract address.

---

## Quick Diagnosis

### What Happened:

```
Old Deployment:  0xeb9A952cBcBa1Dd308d75cE5B4F4d88b7a9008ca (OUTDATED)
New Deployment:  0xcaC5d959a3ce3E563036fe852250917ac25e0db7 (CURRENT)

Your backend points to: OLD address ❌
Actual contract is at: NEW address ✅

Result: ABI mismatch → Function calls fail
```

---

## 🚀 FASTEST FIX (2 minutes)

### Step 1: Update Contract Address

```powershell
# Go to backend folder
cd backend

# Update the current_contract_address.json with the new address
# (The Voting.json file already has the correct one)
```

Edit `backend/current_contract_address.json`:

```json
{
  "address": "0xcaC5d959a3ce3E563036fe852250917ac25e0db7",
  "networkId": "5777",
  "savedAt": "2026-01-18T06:31:47.665Z",
  "blockchainUrl": "http://localhost:7545"
}
```

### Step 2: Restart Backend Server

```powershell
# Stop current server (Ctrl+C)
# Then restart:
node server.js
```

### Step 3: Test

```powershell
# Run diagnostic
node diagnoseCandidate.js
```

✅ Should see: "✅ Blockchain connected" without errors

---

## 🔍 Understanding The Issue

### The Problem

```
Smart Contract Lifecycle:
1. Deploy Contract → Address: 0xcaC5...db7 ✅ (Current)
2. Backend loads address from: current_contract_address.json
3. Stored address: 0xeb9A...ca ❌ (Old, doesn't exist anymore!)
4. Backend tries to call functions on old address
5. Web3 gets confused → ABI error

Result: "Parameter decoding error"
```

### Why It Happened

- Ganache was restarted/reset
- Smart contract was redeployed (`npm run migrate`)
- New address generated but backend not updated
- Old address now points to empty/invalid contract

---

## Solutions (By Severity)

### Solution 1: Quick Address Update (RECOMMENDED)

Update the contract address JSON file to match what's in Voting.json

**File:** `backend/current_contract_address.json`

```json
{
  "address": "0xcaC5d959a3ce3E563036fe852250917ac25e0db7",
  "networkId": "5777",
  "savedAt": "2026-01-18T06:31:47.665Z",
  "blockchainUrl": "http://localhost:7545"
}
```

**Time:** 30 seconds  
**Data Loss:** None ✅  
**Risk:** Very Low ✅

---

### Solution 2: Auto-Sync Contract Address

Create a script to automatically extract the correct address:

```powershell
# In backend folder:
node -e "
const VotingContract = require('../Contract/build/contracts/Voting.json');
const fs = require('fs');
const networkId = '5777';
const network = VotingContract.networks[networkId];

if (network) {
  const config = {
    address: network.address,
    networkId: networkId,
    savedAt: new Date().toISOString(),
    blockchainUrl: 'http://localhost:7545'
  };
  fs.writeFileSync('current_contract_address.json', JSON.stringify(config, null, 2));
  console.log('✅ Contract address updated to:', network.address);
} else {
  console.error('❌ Network', networkId, 'not found in Voting.json');
}
"
```

**Time:** 1 minute  
**Data Loss:** None ✅  
**Risk:** Very Low ✅

---

### Solution 3: Fresh Contract Redeployment

If the above doesn't work, redeploy everything:

```powershell
# 1. Stop backend
# (Ctrl+C in backend terminal)

# 2. Restart Ganache
ganache-cli --host 127.0.0.1 --port 7545 --deterministic

# 3. Redeploy smart contract
cd Contract
npm run migrate

# 4. Clear database
cd ../backend
node -e "
const {sequelize} = require('./config/database');
(async () => {
  await sequelize.truncate({cascade: true});
  console.log('✅ Database cleared');
  process.exit(0);
})();
"

# 5. Restart backend
node server.js

# 6. Re-register everything in Admin Panel
```

**Time:** 15 minutes  
**Data Loss:** All election data ❌  
**Risk:** High (but guaranteed to work)

---

## Prevention Checklist

### Before Using Ganache:

- [ ] Note the current contract address
- [ ] Save it in `current_contract_address.json`
- [ ] Keep `Contract/build/contracts/Voting.json` updated

### If Ganache Crashes:

- [ ] Restart Ganache: `ganache-cli`
- [ ] Check if contract needs redeployment: `npm run migrate`
- [ ] Update backend address if contract redeployed
- [ ] Clear database (since blockchain was reset)

### After Redeployment:

- [ ] Get new address from: `Contract/build/contracts/Voting.json` (networks.5777.address)
- [ ] Update: `backend/current_contract_address.json`
- [ ] Restart backend server
- [ ] Run diagnostic: `node diagnoseCandidate.js`
- [ ] Re-register candidates/parties/voters

---

## How to Find Correct Address

### Method 1: From Voting.json

```powershell
# PowerShell: Extract address from contract build file
$contractFile = 'Contract/build/contracts/Voting.json'
$contract = Get-Content $contractFile | ConvertFrom-Json
Write-Host "Current contract address: $($contract.networks.'5777'.address)"
```

### Method 2: From Ganache Logs

After running migration, Ganache shows deployed contract address:

```
Deploying 'Voting'...
   ✓ Transaction: 0x2c8eeb...
   > contract address:    0xcaC5d959a3ce3E563036fe852250917ac25e0db7
```

### Method 3: Run Diagnostic

```powershell
cd backend
node diagnoseCandidate.js
# Shows what address the backend is trying to use
```

---

## Verify The Fix

After updating the address:

### Test 1: Check Blockchain Connection

```powershell
cd backend
node -e "
const {testBlockchainConnection} = require('./config/blockchain');
testBlockchainConnection().then(() => {
  console.log('✅ Blockchain connection working');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"
```

### Test 2: Check Contract Instance

```powershell
node -e "
const {getContractInstance} = require('./SmartContract/contractInstance');
getContractInstance().then(instance => {
  console.log('✅ Contract loaded successfully');
  console.log('   Address:', instance.address);
  console.log('   Network:', instance.networkId);
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"
```

### Test 3: Full Diagnostic

```powershell
node diagnoseCandidate.js
# Should show: ✅ Blockchain connected
```

### Test 4: Try a Smart Contract Call

```powershell
node -e "
const blockchainService = require('./SmartContract/blockchainService');
blockchainService.initialize().then(async () => {
  const count = await blockchainService.getCandidateCount();
  console.log('✅ Smart contract call successful');
  console.log('   Candidate count:', count);
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"
```

---

## Code Files Involved

### Contract Address Loading:

**File:** `backend/SmartContract/contractInstance.js`

```javascript
const getContractInstance = async () => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = VotingContract.networks[networkId]; // Gets from Voting.json

  if (!deployedNetwork) {
    throw new Error(`Contract not deployed on network ${networkId}`);
  }

  const contractAddress = deployedNetwork.address;
  // ✅ This is the correct address from Voting.json
};
```

### Current Saved Address:

**File:** `backend/current_contract_address.json`

```json
{
  "address": "0xeb9A952cBcBa1Dd308d75cE5B4F4d88b7a9008ca", // ❌ OLD
  "networkId": "5777"
}
```

The system should use `Voting.json` as source of truth, not `current_contract_address.json`.

---

## Common Causes & Solutions

| Symptom                                          | Cause                   | Solution                   |
| ------------------------------------------------ | ----------------------- | -------------------------- |
| "Parameter decoding error" when calling contract | Address mismatch        | Update address in JSON     |
| "Contract not found on network"                  | Old address is invalid  | Redeploy or update address |
| Works after fresh Ganache start then breaks      | Ganache was reset       | Re-register everything     |
| ABI error on specific function                   | Contract was recompiled | Update Voting.json         |
| Works in some functions, not others              | Partial ABI mismatch    | Clear and rebuild contract |

---

## Emergency Recovery

If nothing works:

```powershell
# 1. Stop everything
# (Ctrl+C in all terminals)

# 2. Clear Ganache state completely
# Delete ganache data if stored locally, or:
ganache-cli --host 127.0.0.1 --port 7545 --deterministic --reset

# 3. Redeploy contract fresh
cd Contract
npm run migrate

# 4. Extract correct address from build
$contract = Get-Content 'build/contracts/Voting.json' | ConvertFrom-Json
$newAddress = $contract.networks.'5777'.address
Write-Host "New address: $newAddress"

# 5. Update backend manually
# Edit: backend/current_contract_address.json
# Set address to the one from step 4

# 6. Clear database
cd ../backend
node -e "const {sequelize} = require('./config/database'); sequelize.truncate({cascade: true}).then(() => {console.log('Cleared'); process.exit(0);});"

# 7. Restart everything
node server.js

# 8. Re-register all data (parties, candidates, voters)
```

---

## Files To Check

| File                                        | Purpose                         | Check For                        |
| ------------------------------------------- | ------------------------------- | -------------------------------- |
| `Contract/build/contracts/Voting.json`      | Contract source of truth        | `networks.5777.address`          |
| `backend/current_contract_address.json`     | Saved address (may be outdated) | Address should match Voting.json |
| `backend/SmartContract/contractInstance.js` | How address is loaded           | Uses correct JSON file           |
| `backend/config/blockchain.js`              | Web3 connection                 | Correct Ganache URL              |

---

## Next Steps

1. **Immediate:** Update `current_contract_address.json` with address from `Voting.json`
2. **Restart:** Restart backend server: `node server.js`
3. **Test:** Run: `node diagnoseCandidate.js`
4. **Verify:** Check for ✅ "Blockchain connected"
5. **Continue:** Try voting again

---

## Related Issues

This error can also mean:

- ❌ Ganache not running
- ❌ Smart contract not deployed
- ❌ Wrong network ID
- ❌ Corrupted contract build file

Run `node diagnoseCandidate.js` to check all of these.

---

## Summary

**Problem:** ABI decoding error when calling smart contract  
**Cause:** Contract redeployed, address mismatch  
**Fix:** Update `backend/current_contract_address.json` with correct address from `Voting.json`  
**Time:** < 2 minutes  
**Data Loss:** None if just updating address

**Start:** Update the JSON file to: `0xcaC5d959a3ce3E563036fe852250917ac25e0db7`
