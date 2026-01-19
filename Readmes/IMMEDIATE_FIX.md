# 🎯 IMMEDIATE ACTION: Fix Voting Error (5 Minutes)

**Error:** `Candidate does not exist in blockchain. Please register the candidate first in Admin Panel.`

---

## ⚡ FASTEST FIX (Do This Now)

### Step 1: Check Current Status (30 seconds)

```powershell
cd backend
node viewCandidates.js
```

### Step 2: Based on Output, Do ONE of These:

#### Case A: Output shows "❌ NOT REGISTERED"

```powershell
node syncCandidatesToBlockchain.js
```

✅ Done! Candidates are now registered on blockchain.

---

#### Case B: Output shows "No candidates registered yet"

1. Open Admin Dashboard
2. Go to **Manage Candidates**
3. Click **Add New Candidate**
4. Fill in all fields
5. Click Submit
6. Repeat for each candidate you need

✅ Done! Each one auto-registers on blockchain.

---

#### Case C: Output shows "All candidates properly registered!"

The issue is elsewhere. Follow "If Still Not Working" below.

---

## ✅ Test If It's Fixed

```powershell
# Verify candidates are registered
node viewCandidates.js

# Expected: ✅ All candidates properly registered!
```

Then:

1. Open Voter Dashboard
2. Try to vote for a candidate
3. Should work without errors! ✅

---

## 🚨 If Still Not Working

Run comprehensive diagnostic:

```powershell
node diagnoseCandidate.js
```

Follow the recommendations it provides.

If that doesn't help:

### Check 1: Is Ganache Running?

```powershell
# In a new PowerShell window, run:
ganache-cli --host 127.0.0.1 --port 7545
```

Should show: `Listening on 127.0.0.1:7545`

### Check 2: Is Backend Server Running?

```powershell
# In another window, run:
node server.js
```

Should show: `Listening on port 5500`

### Check 3: Full Database Reset

If candidates keep having issues:

```powershell
# Stop server (Ctrl+C)
# Stop Ganache (Ctrl+C)

# Clear database
node -e "
const {sequelize} = require('./config/database');
(async () => {
  await sequelize.truncate({cascade: true});
  console.log('Database cleared');
  process.exit(0);
})();
"

# Redeploy contract
cd ../Contract
npm run migrate

# Restart Ganache
ganache-cli --host 127.0.0.1 --port 7545

# Restart backend
cd ../backend
node server.js

# Re-register everything in Admin Panel
```

---

## 📋 Minimal Setup to Test Voting

After fixes, ensure you have:

- [ ] At least 1 party
- [ ] At least 1 candidate for that party
- [ ] At least 1 registered voter
- [ ] All showing proper status in diagnostic

Then voting should work! ✅

---

## 🔍 Understanding the Error (Optional Reading)

The error means the smart contract couldn't find the candidate at the blockchain index you specified. This happens when:

1. **BlockchainId is NULL** in database
   - Candidate was created but never registered on blockchain
   - Fix: `node syncCandidatesToBlockchain.js`

2. **BlockchainId out of range**
   - Old candidate (BlockchainId=2) but blockchain only has 1 candidate
   - Fix: Clear database and re-register

3. **Ganache restarted**
   - Blockchain was reset, old BlockchainIds no longer valid
   - Fix: Clear database + re-register

---

## 📞 Quick Commands Reference

| Command                              | What It Does                 |
| ------------------------------------ | ---------------------------- |
| `node viewCandidates.js`             | List all candidates + status |
| `node syncCandidatesToBlockchain.js` | Register missing candidates  |
| `node diagnoseCandidate.js`          | Full system health check     |
| `ganache-cli`                        | Start Ganache blockchain     |
| `node server.js`                     | Start backend server         |

---

**That's it! Follow the steps above and voting should work. If not, run `diagnoseCandidate.js` for more specific guidance.**
