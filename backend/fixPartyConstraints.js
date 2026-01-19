require("dotenv").config();
const sequelize = require("./config/database");

async function fixConstraints() {
  try {
    console.log("🔄 Fixing database constraints...");

    // Drop the old unique constraint on PartyName
    await sequelize.query(`
      ALTER TABLE "PartyInfo" 
      DROP CONSTRAINT IF EXISTS "PartyInfo_PartyName_key";
    `);
    console.log("✅ Dropped old PartyName unique constraint");

    // Drop the old unique constraint on BlockchainId if it exists
    await sequelize.query(`
      ALTER TABLE "PartyInfo" 
      DROP CONSTRAINT IF EXISTS "PartyInfo_BlockchainId_key";
    `);
    console.log("✅ Dropped old BlockchainId unique constraint");

    // Create the new composite unique constraint
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "unique_party_per_area" 
      ON "PartyInfo" ("PartyName", "District", "AreaNo");
    `);
    console.log(
      "✅ Created composite unique constraint on (PartyName, District, AreaNo)"
    );

    console.log("✅ All constraints fixed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing constraints:", error.message);
    process.exit(1);
  }
}

fixConstraints();
