# Error Flow Diagram

## What Causes "Candidate does not exist in blockchain" Error

```
┌─────────────────────────────────────────────────────────────────┐
│  VOTER CLICKS "VOTE FOR CANDIDATE"                             │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  Frontend sends: POST /api/vote                                 │
│  {                                                              │
│    "voter_id": 1,                                              │
│    "candidate_id": 5,     ← Database ID                         │
│    "district": "Kathmandu"                                     │
│  }                                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  Backend: voteController.castVote()                             │
│                                                                 │
│  1. Get candidate from database (ID = 5)                        │
│  2. Check if candidate.BlockchainId exists                      │
│                                                                 │
│  IF BlockchainId is NULL or undefined:                          │
│     ↓                                                           │
│     RESPONSE: 400 Error                                         │
│     "Candidate is not registered in blockchain"                 │
│                                                                 │
│  ELSE if BlockchainId exists:                                   │
│     ↓                                                           │
│     Send BlockchainId to smart contract                         │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  Smart Contract: Voting.vote()                                  │
│                                                                 │
│  require(candidateId < candidateCount,                          │
│          "Candidate does not exist");                           │
│                                                                 │
│  Example:                                                       │
│  ├─ BlockchainId (candidateId) = 2                              │
│  ├─ candidateCount = 3                                          │
│  └─ Check: 2 < 3 ?  ✅ YES → Continue                            │
│                                                                 │
│  OR                                                             │
│                                                                 │
│  ├─ BlockchainId (candidateId) = 5                              │
│  ├─ candidateCount = 3                                          │
│  └─ Check: 5 < 3 ?  ❌ NO → ERROR!                               │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  ❌ CONTRACT REVERTS:                                            │
│  "Candidate does not exist"                                     │
│                                                                 │
│  Error bubbles up → Backend catches it                          │
│                  → Frontend shows to user                       │
│                                                                 │
│  "Candidate does not exist in blockchain.                       │
│   Please register the candidate first in Admin Panel."          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Root Causes (Why This Happens)

```
SCENARIO 1: Candidate in DB but BlockchainId is NULL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Database (PostgreSQL)
  CandidateInfo table:
  ┌────┬──────────────┬───────────┬─────────────┐
  │ id │ CandidateName│ Party     │ BlockchainId│
  ├────┼──────────────┼───────────┼─────────────┤
  │ 1  │ John Doe     │ Party A   │ NULL   ❌   │
  │ 2  │ Jane Smith   │ Party B   │ 1      ✅   │
  └────┴──────────────┴───────────┴─────────────┘

What happens:
✗ Candidate 1 can't be voted because BlockchainId = NULL
✓ Candidate 2 can be voted because BlockchainId = 1

FIX: node syncCandidatesToBlockchain.js


SCENARIO 2: Ganache restarted (contract redeployed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE Ganache Restart:
  candidateCount = 3 (0, 1, 2)
  Database BlockchainIds = 0, 1, 2 ✅

AFTER Ganache Restart & Contract Redeploy:
  candidateCount = 0 (fresh contract)
  Database BlockchainIds = 0, 1, 2 ❌ (don't exist!)

What happens:
✗ All votes fail because BlockchainIds don't exist on new contract

FIX: Clear DB + re-register candidates


SCENARIO 3: Candidates never registered on blockchain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Database has candidates:
  ┌────┬──────────────┬─────────────┐
  │ id │ CandidateName│ BlockchainId│
  ├────┼──────────────┼─────────────┤
  │ 1  │ John Doe     │ NULL        │
  │ 2  │ Jane Smith   │ NULL        │
  │ 3  │ Bob Jones    │ NULL        │
  └────┴──────────────┴─────────────┘

Blockchain has:
  candidateCount = 0  (Nothing registered!)

What happens:
✗ ALL votes fail regardless of which candidate

FIX: Register candidates on blockchain
```

---

## How It Should Work

```
CORRECT FLOW
━━━━━━━━━━━━

1. ADMIN REGISTERS CANDIDATE
   ┌──────────────┐
   │ Admin Panel  │
   │ Add Candidate│
   └────────┬─────┘
            ↓
   ┌──────────────────────────────┐
   │ POST /candidates/register    │
   │ {name: "John", party: "A"}   │
   └────────┬─────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ blockchainService.addCandidate()
   │                              │
   │ candidateCount before: 0     │
   │ → Contract receives          │
   │ → Creates candidates[0]      │
   │ → candidateCount becomes: 1  │
   │ → Returns BlockchainId: 0    │
   └────────┬─────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ Save to Database             │
   │ CandidateInfo.create({       │
   │   CandidateName: "John",     │
   │   BlockchainId: 0    ✅      │
   │ })                           │
   └──────────────────────────────┘

2. VOTER CASTS VOTE
   ┌──────────────┐
   │ Voter clicks │
   │ "Vote"       │
   └────────┬─────┘
            ↓
   ┌──────────────────────────────┐
   │ POST /api/vote               │
   │ {candidate_id: 1}            │
   └────────┬─────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ Get from database:           │
   │ SELECT * WHERE id = 1        │
   │ → BlockchainId: 0    ✅      │
   └────────┬─────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ blockchainService.vote(0)    │
   │                              │
   │ Smart Contract checks:       │
   │ require(0 < 1) ✅ TRUE       │
   │                              │
   │ Increment candidates[0]      │
   │ votes: 0 → 1                 │
   │                              │
   │ ✅ SUCCESS                   │
   └──────────────────────────────┘
```

---

## Quick Decision Tree

```
START: Getting "Candidate does not exist" error?
│
├─ Do you have candidates in Admin Panel?
│  │
│  ├─ YES → Run: node viewCandidates.js
│  │        │
│  │        ├─ Shows "NOT REGISTERED"?
│  │        │  └─ Run: node syncCandidatesToBlockchain.js
│  │        │
│  │        └─ Shows "REGISTERED"?
│  │           └─ Issue is elsewhere (voter registration, etc)
│  │
│  └─ NO → Register candidates in Admin Panel first
│
├─ Did it work?
│  │
│  ├─ YES ✅ → Done! Voters can vote now
│  │
│  └─ NO ❌ → Run: node diagnoseCandidate.js
│            → Check Ganache is running
│            → Check database connection
│            → Check smart contract deployed
```

---

## Visual Checklist for Voting to Work

```
✓ REQUIREMENTS FOR VOTING
═══════════════════════════════════════════════════

✓ Ganache Running
  │
  └─ http://localhost:7545
     Status: ganache-cli command running

✓ Smart Contract Deployed
  │
  └─ candidateCount > 0
     (visible via: blockchainService.getCandidateCount())

✓ At Least 1 Party Registered
  │
  └─ In Admin Panel: Parties section

✓ At Least 1 Candidate Registered
  │
  ├─ Database: CandidateInfo.BlockchainId != NULL
  ├─ Blockchain: candidate exists at that index
  └─ Both: In sync

✓ At Least 1 Voter Registered
  │
  └─ In Admin Panel: Register Voter section
     (or voter can self-register with photo)

✓ Voter is Registered on Blockchain
  │
  └─ blockchainService.isVoterRegistered() returns true

───────────────────────────────────────────────────

If ALL ✓ above are true → ✅ VOTING WORKS

If ANY ✗ above → ❌ FIX IT FIRST
```
