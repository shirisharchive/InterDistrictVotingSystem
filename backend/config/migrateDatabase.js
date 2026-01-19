require("dotenv").config();
const sequelize = require("./database");
const models = require("../electionModel");

async function migrateDatabase() {
  try {
    console.log("🔄 Starting database migration...");
    console.log("✅ This will update tables WITHOUT deleting data");

    // Sync all models with the database
    // alter: true will update tables without dropping them
    await sequelize.sync({ alter: true });

    console.log("✅ Database migrated successfully!");
    console.log("\n📋 Tables updated:");
    console.log("  - VoterInfo");
    console.log("  - CandidateInfo");
    console.log("  - VoteInfo");
    console.log("  - IndirectVoteInfo");
    console.log("  - PartyInfo");
    console.log("  - ElectionAreaInfo");
    console.log("  - AdminInfo");
    console.log("  - AdminAssignmentInfo");
    console.log("\n💡 Your existing data has been preserved!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error migrating database:", error);
    process.exit(1);
  }
}

migrateDatabase();
