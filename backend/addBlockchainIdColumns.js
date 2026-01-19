const sequelize = require("./config/database");

async function addBlockchainIdColumns() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database");

    // Add BlockchainId to CandidateInfo
    await sequelize.query(
      'ALTER TABLE "CandidateInfo" ADD COLUMN IF NOT EXISTS "BlockchainId" INTEGER;'
    );
    console.log("✅ Added BlockchainId column to CandidateInfo");

    // Add BlockchainId to PartyInfo
    await sequelize.query(
      'ALTER TABLE "PartyInfo" ADD COLUMN IF NOT EXISTS "BlockchainId" INTEGER;'
    );
    console.log("✅ Added BlockchainId column to PartyInfo");

    console.log("\n✅ Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
  }
}

addBlockchainIdColumns();
