require("dotenv").config();
const sequelize = require("./config/database");

async function addCandidateVoteCountTable() {
  try {
    console.log("🔄 Creating CandidateVoteCount table...");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "CandidateVoteCount" (
        "id" SERIAL PRIMARY KEY,
        "CandidateId" INTEGER NOT NULL REFERENCES "CandidateInfo"("id") ON DELETE CASCADE,
        "District" VARCHAR(255) NOT NULL,
        "AreaNo" INTEGER NOT NULL,
        "VoteCount" INTEGER NOT NULL DEFAULT 0,
        "LastUpdated" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "unique_candidate_area_count" UNIQUE ("CandidateId", "District", "AreaNo")
      );
    `);

    console.log("✅ CandidateVoteCount table created successfully!");

    // Create indexes
    console.log("🔄 Creating indexes...");
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_district_area" 
      ON "CandidateVoteCount" ("District", "AreaNo");
    `);

    console.log("✅ Indexes created!");

    // Populate with existing vote data
    console.log("🔄 Populating with existing votes...");
    
    await sequelize.query(`
      INSERT INTO "CandidateVoteCount" ("CandidateId", "District", "AreaNo", "VoteCount", "LastUpdated")
      SELECT 
        "CandidateId",
        "District",
        "AreaNo",
        COUNT(*) as "VoteCount",
        MAX("VoteTime") as "LastUpdated"
      FROM "VoteInfo"
      GROUP BY "CandidateId", "District", "AreaNo"
      ON CONFLICT ("CandidateId", "District", "AreaNo") 
      DO UPDATE SET 
        "VoteCount" = EXCLUDED."VoteCount",
        "LastUpdated" = EXCLUDED."LastUpdated";
    `);

    console.log("✅ Existing votes populated!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addCandidateVoteCountTable();
