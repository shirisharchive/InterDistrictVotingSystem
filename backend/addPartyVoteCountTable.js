require("dotenv").config();
const sequelize = require("./config/database");

async function addPartyVoteCountTable() {
  try {
    console.log("🔄 Creating PartyVoteCount table...");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "PartyVoteCount" (
        "id" SERIAL PRIMARY KEY,
        "PartyId" INTEGER NOT NULL REFERENCES "PartyInfo"("id") ON DELETE CASCADE,
        "District" VARCHAR(255) NOT NULL,
        "AreaNo" INTEGER NOT NULL,
        "VoteCount" INTEGER NOT NULL DEFAULT 0,
        "LastUpdated" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "unique_party_area_count" UNIQUE ("PartyId", "District", "AreaNo")
      );
    `);

    console.log("✅ PartyVoteCount table created successfully!");

    // Create indexes
    console.log("🔄 Creating indexes...");

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_party_district_area" 
      ON "PartyVoteCount" ("District", "AreaNo");
    `);

    console.log("✅ Indexes created!");

    // Populate with existing vote data
    console.log("🔄 Populating with existing party votes...");

    await sequelize.query(`
      INSERT INTO "PartyVoteCount" ("PartyId", "District", "AreaNo", "VoteCount", "LastUpdated")
      SELECT 
        "PartyId",
        "District",
        "AreaNo",
        COUNT(*) as "VoteCount",
        MAX("VoteTime") as "LastUpdated"
      FROM "IndirectVoteInfo"
      GROUP BY "PartyId", "District", "AreaNo"
      ON CONFLICT ("PartyId", "District", "AreaNo") 
      DO UPDATE SET 
        "VoteCount" = EXCLUDED."VoteCount",
        "LastUpdated" = EXCLUDED."LastUpdated";
    `);

    console.log("✅ Existing party votes populated!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addPartyVoteCountTable();
