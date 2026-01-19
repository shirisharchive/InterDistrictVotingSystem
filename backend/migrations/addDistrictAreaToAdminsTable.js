const { Sequelize } = require("sequelize");
const db = require("../config/database");

async function addDistrictAreaToAdminsTable() {
  try {
    console.log("Adding district and area columns directly to admins table...");

    // Check if columns already exist
    const [results] = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admins' 
      AND column_name IN ('district', 'area')
    `);

    const existingColumns = results.map((row) => row.column_name);

    if (!existingColumns.includes("district")) {
      await db.query(`
        ALTER TABLE "admins"
        ADD COLUMN "district" VARCHAR(100)
      `);
      console.log("✅ Added district column to admins table");
    } else {
      console.log("⚠️ district column already exists in admins table");
    }

    if (!existingColumns.includes("area")) {
      await db.query(`
        ALTER TABLE "admins"
        ADD COLUMN "area" INTEGER
      `);
      console.log("✅ Added area column to admins table");
    } else {
      console.log("⚠️ area column already exists in admins table");
    }

    // Migrate existing data from admin_assignments to admins table
    await db.query(`
      UPDATE admins a
      SET district = aa.district_id, area = CAST(aa.area_no AS INTEGER)
      FROM admin_assignments aa
      WHERE a.admin_id = aa.admin_id
      AND (a.district IS NULL OR a.area IS NULL)
    `);
    console.log("✅ Migrated data from admin_assignments to admins table");

    // Add index for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_district_area 
      ON admins (district, area)
    `);
    console.log("✅ Added index for district and area on admins table");

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
  addDistrictAreaToAdminsTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = addDistrictAreaToAdminsTable;
