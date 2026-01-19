require("dotenv").config();
const sequelize = require("./config/database");

async function resetAndSync() {
  try {
    console.log("🔄 Dropping and recreating all tables...");

    // Drop all tables in order (respecting foreign keys)
    await sequelize.query('DROP TABLE IF EXISTS "VoteInfo" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "IndirectVoteInfo" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "CandidateVoteCount" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "PartyVoteCount" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "CandidateInfo" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "PartyInfo" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "VoterInfo" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "ElectionAreaInfo" CASCADE;');

    console.log("✅ All tables dropped");

    // Import all models explicitly to ensure they're loaded
    const ElectionAreaInfo = require("./electionModel/ElectionAreaInfo");
    const VoterInfo = require("./electionModel/VoterInfo");
    const CandidateInfo = require("./electionModel/CandidateInfo");
    const PartyInfo = require("./electionModel/PartyInfo");
    const VoteInfo = require("./electionModel/VoteInfo");
    const IndirectVoteInfo = require("./electionModel/IndirectVoteInfo");
    const CandidateVoteCount = require("./electionModel/CandidateVoteCount");
    const PartyVoteCount = require("./electionModel/PartyVoteCount");

    console.log("📦 Models loaded");

    // Sync database (create all tables with proper structure)
    await sequelize.sync({ force: false });

    console.log("✅ All tables recreated successfully!");
    console.log("\n📋 Tables created:");
    console.log("  - ElectionAreaInfo");
    console.log("  - VoterInfo (with unique indexes)");
    console.log("  - CandidateInfo (with District, AreaNo)");
    console.log("  - PartyInfo (with composite unique constraint)");
    console.log("  - VoteInfo");
    console.log("  - IndirectVoteInfo");
    console.log("  - CandidateVoteCount");
    console.log("  - PartyVoteCount");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error.message);
    console.error(error);
    process.exit(1);
  }
}

resetAndSync();
