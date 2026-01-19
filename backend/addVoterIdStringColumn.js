require("dotenv").config();
const sequelize = require("./config/database");

async function addVoterIdStringColumn() {
  try {
    console.log("🔄 Adding VoterIdString column to VoteInfo table...");

    // Add the VoterIdString column
    await sequelize.query(`
      ALTER TABLE "VoteInfo" 
      ADD COLUMN IF NOT EXISTS "VoterIdString" VARCHAR(255);
    `);

    console.log("✅ VoterIdString column added successfully!");

    // Update existing records with VoterId from VoterInfo
    console.log("🔄 Updating existing records...");

    const [results] = await sequelize.query(`
      UPDATE "VoteInfo" 
      SET "VoterIdString" = "VoterInfo"."VoterId"
      FROM "VoterInfo" 
      WHERE "VoteInfo"."VoterId" = "VoterInfo"."id"
      AND "VoteInfo"."VoterIdString" IS NULL;
    `);

    console.log(`✅ Updated ${results} existing records!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding column:", error);
    process.exit(1);
  }
}

addVoterIdStringColumn();
