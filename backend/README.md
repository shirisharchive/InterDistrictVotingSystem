# Voting System - PostgreSQL Models Setup

## 📁 Created Files

### Models (`backend/electionModel/`)
- ✅ **ElectionAreaInfo.js** - Composite PK (District, AreaNo)
- ✅ **CandidateInfo.js** - One candidate per party per position per area
- ✅ **VoterInfo.js** - Unique VoterId and PassportNo
- ✅ **PartyInfo.js** - Political parties per area
- ✅ **VoteInfo.js** - Direct voting (Voter → Candidate)
- ✅ **IndirectVoteInfo.js** - Indirect voting (Voter → Party)
- ✅ **index.js** - Model relationships and DB sync

### Configuration
- ✅ **config/database.js** - PostgreSQL connection setup
- ✅ **server.js** - Express server with all routes
- ✅ **package.json** - Dependencies and scripts
- ✅ **.env.example** - Environment variables template

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your PostgreSQL credentials
```

### 3. Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE voting_system;

# Exit
\q
```

### 4. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will:
- Connect to PostgreSQL
- Create all tables with proper constraints
- Add CHECK constraints for area validation
- Start on http://localhost:5000

## 📊 Database Features Implemented

### ✅ Constraints
- Composite primary keys (District, AreaNo)
- Unique constraints (VoterId, PassportNo, PartyName)
- Foreign key relationships with CASCADE delete
- One candidate per party per position per area
- One voter → one direct vote per area
- One voter → one indirect vote per area

### ✅ CHECK Constraints (PostgreSQL)
- Vote area matches candidate area
- Vote area matches voter area
- Indirect vote area matches party area
- Indirect vote area matches voter area

### ✅ Relationships
- ElectionArea → Candidates (1:many)
- ElectionArea → Voters (1:many)
- ElectionArea → Parties (1:many)
- Voter → Candidate (many:many via VoteInfo)
- Voter → Party (many:many via IndirectVoteInfo)

## 📝 Next Steps

1. Implement route handlers in `backend/routes/`
2. Add controllers in `backend/controllers/`
3. Create validation middleware
4. Add authentication/authorization
5. Implement business logic for:
   - Voter registration
   - Candidate registration
   - Vote casting (with area validation)
   - Vote counting and results

## 🔧 Useful Commands

```bash
# Sync database (create tables)
npm run db:sync

# Start development server
npm run dev

# Check database connection
node -e "require('./config/database').testConnection()"
```

## ⚠️ Important Notes

- Set `force: true` in `syncDatabase()` only during development (drops tables)
- CHECK constraints are added via raw SQL queries
- Composite foreign keys require careful handling in Sequelize
- Test area validation thoroughly before production use
