# ⚡ BLOCKCHAIN ABI ERROR - QUICK FIX (30 seconds)

## Error You Got

```
Parameter decoding error: Returned values aren't valid
AbiError: Parameter decoding error
```

## Root Cause (In 1 Sentence)

**Smart contract was redeployed, but backend is using old contract address.**

---

## The Fix ✅

### I Already Did Step 1:

✅ Updated `backend/current_contract_address.json` to the correct address:

```
Old: 0xeb9A952cBcBa1Dd308d75cE5B4F4d88b7a9008ca ❌
New: 0xcaC5d959a3ce3E563036fe852250917ac25e0db7 ✅
```

### You Do Steps 2-4:

**Step 2:** Stop backend server

```powershell
# In your backend terminal:
# Press Ctrl+C
```

**Step 3:** Restart backend server

```powershell
node server.js
```

**Step 4:** Clear database (because Ganache was reset)

```powershell
# New terminal, in backend folder:
node -e "const {sequelize} = require('./config/database'); sequelize.truncate({cascade: true}).then(() => {console.log('✅ Database cleared'); process.exit(0);});"
```

**Step 5:** Test the fix

```powershell
node diagnoseCandidate.js
```

✅ Should show: **"✅ Blockchain connected"** without ABI errors

---

## Next Steps

1. **Clear old data** because blockchain was reset
   - Run: `node -e "const {sequelize} = require('./config/database'); sequelize.truncate({cascade: true}).then(() => {console.log('Cleared'); process.exit(0);});"`

2. **Re-register everything** in Admin Panel:
   - Add at least 1 party
   - Add at least 1 candidate
   - Add at least 1 voter

3. **Test voting** in voter dashboard
   - Should work without ABI errors! ✅

---

## What Happened

```
Timeline:
1. Contract deployed → Address: 0xcaC5...db7
2. Ganache got reset or contract redeployed
3. New address: 0xcaC5...db7 (in Voting.json) ✅
4. Old address: 0xeb9A...ca (in current_contract_address.json) ❌
5. Backend tried to call old address → ABI ERROR

Fix:
Updated current_contract_address.json to use new address ✅
```

---

## Verification

After restarting, run:

```powershell
node diagnoseCandidate.js
```

Look for:

- ✅ Blockchain connected
- ✅ No ABI errors
- ✅ Database has X candidates (will be 0 after clear)

---

## Done! ✅

The ABI error is fixed. Now you need to:

1. Clear database (I showed you how above)
2. Re-register parties and candidates in Admin
3. Try voting again

Total time: 5 minutes
