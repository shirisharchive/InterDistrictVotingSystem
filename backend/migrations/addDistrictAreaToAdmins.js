const { Sequelize } = require("sequelize");
const db = require("../config/database");

async function addDistrictAreaToAdmins() {
  try {
    console.log(
      "Adding district and area columns to AdminAssignments table...",
    );

    // Check if columns already exist
    const [results] = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'AdminAssignments' 
      AND column_name IN ('district', 'area')
    `);

    const existingColumns = results.map((row) => row.column_name);

    if (!existingColumns.includes("district")) {
      await db.query(`
        ALTER TABLE "AdminAssignments"
        ADD COLUMN "district" VARCHAR(100)
      `);
      console.log("✅ Added district column");
    } else {
      console.log("⚠️ district column already exists");
    }

    if (!existingColumns.includes("area")) {
      await db.query(`
        ALTER TABLE "AdminAssignments"
        ADD COLUMN "area" INTEGER
      `);
      console.log("✅ Added area column");
    } else {
      console.log("⚠️ area column already exists");
    }

    // Add index for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_district_area 
      ON "AdminAssignments" (district, area)
    `);
    console.log("✅ Added index for district and area");

    // Migrate existing data (copy from district_id and area_no to new columns)
    await db.query(`
      UPDATE "AdminAssignments"
      SET district = district_id, area = area_no
      WHERE district IS NULL OR area IS NULL
    `);
    console.log("✅ Migrated existing data to new columns");

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  } finally {
    await db.close();
  }
}

// Run migration
if (require.main === module) {
  addDistrictAreaToAdmins()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = addDistrictAreaToAdmins;
