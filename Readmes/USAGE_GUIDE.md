# Voting System - Complete Guide

## ✅ Setup Complete!

Your blockchain voting system is now ready to use! All database tables have been created successfully.

## 🚀 Running the Application

### 1. Start Backend Server

```powershell
cd backend
npm start
```

Server runs on: `http://localhost:5500`

### 2. Open Frontend

Simply open `frontend/index.html` in your browser, or use a local server:

```powershell
cd frontend
npx http-server -p 3000
```

Then visit: `http://localhost:3000`

### 3. Ensure Blockchain is Running

Make sure Ganache is running on `http://localhost:7545`

## 📋 Database Tables Created

✅ **ElectionAreaInfo** - Election areas and districts  
✅ **VoterInfo** - Registered voters  
✅ **CandidateInfo** - Registered candidates  
✅ **PartyInfo** - Political parties  
✅ **VoteInfo** - Direct votes (for candidates)  
✅ **IndirectVoteInfo** - Indirect votes (for parties)

## 🎯 How to Use the System

### For Admin:

1. **Navigate to Admin Panel**

   - Open `frontend/pages/admin.html`
   - Or click "Admin Panel" from homepage

2. **Register Voters**

   - Tab: "Register Voter"
   - Fill in: Name, Voter ID, District, Area Number
   - Passport No is optional

3. **Register Candidates**

   - Tab: "Register Candidate"
   - Fill in: Name, Party, Position, District, Area
   - URLs for photos/logos are optional

4. **Register Parties**

   - Tab: "Register Party"
   - Fill in: Party Name, District, Area
   - Logo URL is optional

5. **View All Records**
   - Tab: "View All"
   - See all registered voters, candidates, and parties

### For Voters:

1. **Direct Voting (Vote for Candidates)**

   - Go to `frontend/pages/vote-candidate.html`
   - Enter your Voter ID
   - Select Position (Mayor, Governor, etc.)
   - Choose a candidate
   - Submit vote

2. **Indirect Voting (Vote for Party)**

   - Go to `frontend/pages/vote-party.html`
   - Enter your Voter ID
   - Select a political party
   - Submit vote
   - ⚠️ You can only vote for ONE party

3. **View Results**
   - Go to `frontend/pages/results.html`
   - See real-time results for:
     - Candidates (grouped by position)
     - Parties

## 🔧 Useful Commands

### Database Management

**Create/Recreate Tables:**

```powershell
cd backend
npm run db:sync
```

⚠️ Warning: This will drop all existing data!

**View Database in pgAdmin:**

- Connect to: `localhost:5432`
- Database: `voting_system`
- Username: `postgres`
- Password: `root`

### Smart Contract Management

**Compile Contracts:**

```powershell
cd Contract
truffle compile
```

**Deploy Contracts:**

```powershell
cd Contract
truffle migrate --reset
```

**Test in Truffle Console:**

```powershell
cd Contract
truffle console

# Inside console:
let instance = await Voting.deployed()
await instance.addParty('Democratic Party', 'logo_url')
await instance.getPartyCount()
```

## 🌐 API Endpoints

### Voter Endpoints

- `POST /api/voters/register` - Register new voter (Admin only)
- `GET /api/voters` - Get all voters
- `GET /api/voters/:id` - Get voter by ID
- `GET /api/votes/status/:voterId` - Check voter's vote status

### Candidate Endpoints

- `POST /api/candidates/register` - Register candidate (Admin only)
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/results` - Get candidates with vote counts

### Party Endpoints

- `POST /api/parties/register` - Register party (Admin only)
- `GET /api/parties` - Get all parties
- `GET /api/parties/results` - Get parties with vote counts
- `GET /api/vote/party/status/:voterId` - Check party vote status

### Voting Endpoints

- `POST /api/vote` - Cast direct vote for candidate
- `POST /api/vote/party` - Cast indirect vote for party
- `GET /api/votes/results` - Get voting results

## 🔐 Security Features

✅ **Blockchain Immutability** - All votes recorded on Ethereum blockchain  
✅ **Duplicate Prevention** - One vote per position per voter  
✅ **Party Vote Limit** - Only one party vote allowed per voter  
✅ **Transaction Proof** - Each vote has a blockchain transaction hash  
✅ **Owner Verification** - Admin operations require contract owner authorization

## 📊 Example Workflow

1. **Setup Phase:**

   ```
   Admin → Register Voters
   Admin → Register Parties
   Admin → Register Candidates for each position
   ```

2. **Voting Phase:**

   ```
   Voter → Vote for Mayor candidate
   Voter → Vote for Governor candidate
   Voter → Vote for one Political Party
   ```

3. **Results Phase:**
   ```
   Anyone → View real-time results
   Results auto-refresh every 30 seconds
   ```

## ⚠️ Important Notes

- **Voter ID**: Must be unique for each voter
- **Position Voting**: Can vote once per position (Mayor, Governor, etc.)
- **Party Voting**: Can vote for ONLY ONE party total
- **Blockchain**: All votes are permanently recorded on blockchain
- **Transaction Hash**: Stored in database as proof of blockchain registration
- **Port 5500**: Make sure no other service is using this port

## 🐛 Troubleshooting

### Port Already in Use

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
cd backend
npm start
```

### Database Connection Error

1. Check if PostgreSQL is running
2. Verify password in `backend/.env` file (current: `root`)
3. Ensure database `voting_system` exists

### Blockchain Connection Error

1. Start Ganache on port 7545
2. Check Network ID is 5777
3. Verify contract address in `backend/SmartContract/contractInstance.js`

### Tables Don't Exist

```powershell
cd backend
npm run db:sync
```

## 📁 File Structure

```
VotingSystem/
├── backend/
│   ├── config/           # Database & blockchain config
│   ├── Controller/       # API controllers
│   ├── electionModel/    # Sequelize models
│   ├── Middleware/       # JWT & RBAC
│   ├── Routes/           # API routes
│   ├── SmartContract/    # Blockchain service
│   └── server.js         # Main server file
├── frontend/
│   ├── css/              # Styles
│   ├── js/               # API integration
│   ├── pages/            # HTML pages
│   └── index.html        # Homepage
└── Contract/
    └── contracts/        # Solidity smart contracts
```

## 🎉 You're All Set!

Your blockchain voting system is fully functional with:

- ✅ Database tables created
- ✅ Smart contracts deployed
- ✅ Backend API running
- ✅ Frontend ready to use

Start by registering voters and candidates through the Admin Panel!
