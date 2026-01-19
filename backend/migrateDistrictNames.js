const { Sequelize } = require("sequelize");

// PostgreSQL connection
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "voting_system",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
  logging: false,
});

/**
 * Migration script to convert district numbers to district names
 * and update schema to use district names consistently
 */

// Nepal's 7 provinces and their districts
const districtMapping = {
  1: "Kathmandu",
  2: "Lalitpur",
  3: "Bhaktapur",
  4: "Kavrepalanchok",
  5: "Sindhupalchok",
  6: "Nuwakot",
  7: "Dhading",
  8: "Makwanpur",
  9: "Chitwan",
  10: "Rasuwa",
  // Add more districts as needed
};

async function migrateToDistrictNames() {
  try {
    console.log("🔄 Starting district name migration...\n");

    await db.sequelize.authenticate();
    console.log("✅ Database connection established\n");

    // Step 1: Check current admin_assignments structure
    console.log("📊 Checking admin_assignments table...");
    const [assignments] = await db.sequelize.query(
      "SELECT * FROM admin_assignments",
      { type: db.Sequelize.QueryTypes.SELECT },
    );

    console.log(`   Found ${assignments.length} admin assignments\n`);

    // Step 2: Update any numeric district_id to district name
    console.log("🔄 Converting numeric district IDs to names...");
    for (const assignment of assignments) {
      const districtId = assignment.district_id;

      // Check if it's a number
      if (districtId && !isNaN(districtId)) {
        const districtName =
          districtMapping[parseInt(districtId)] || `District_${districtId}`;

        await db.sequelize.query(
          "UPDATE admin_assignments SET district_id = :districtName WHERE assignment_id = :id",
          {
            replacements: { districtName, id: assignment.assignment_id },
            type: db.Sequelize.QueryTypes.UPDATE,
          },
        );

        console.log(
          `   ✓ Updated assignment ${assignment.assignment_id}: ${districtId} → ${districtName}`,
        );
      }
    }

    // Step 3: Verify the changes
    console.log("\n✅ Verifying admin assignments:");
    const [updatedAssignments] = await db.sequelize.query(
      "SELECT a.email, aa.district_id, aa.area_no FROM admin_assignments aa JOIN admins a ON aa.admin_id = a.admin_id",
    );

    updatedAssignments.forEach((assignment) => {
      console.log(
        `   ${assignment.email} → ${assignment.district_id}, Area ${assignment.area_no}`,
      );
    });

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateToDistrictNames();
