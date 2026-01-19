require("dotenv").config();
const sequelize = require("./database");
const models = require("../electionModel");

async function syncDatabase() {
  try {
    console.log("🔄 Starting database synchronization...");
    console.log("⚠️  WARNING: This will drop and recreate all tables!");

    // Sync all models with the database
    // force: true will DROP existing tables and recreate them
    await sequelize.sync({ force: true });

    console.log("✅ All models synchronized successfully!");
    console.log("\n📋 Tables created/updated:");
    console.log("  - VoterInfo");
    console.log("  - CandidateInfo");
    console.log("  - VoteInfo");
    console.log("  - IndirectVoteInfo");
    console.log("  - PartyInfo");
    console.log("  - ElectionAreaInfo");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error synchronizing database:", error);
    process.exit(1);
  }
}

syncDatabase();
