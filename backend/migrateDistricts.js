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

// Nepal districts mapping
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
};

async function migrate() {
  try {
    console.log("🔄 Starting district name migration...\n");

    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Check current assignments
    const assignments = await sequelize.query(
      "SELECT * FROM admin_assignments",
      { type: Sequelize.QueryTypes.SELECT },
    );

    console.log(`📊 Found ${assignments.length} assignments\n`);

    // Convert numeric districts to names
    for (const assignment of assignments) {
      const districtId = assignment.district_id;

      if (districtId && !isNaN(districtId)) {
        const districtName =
          districtMapping[districtId] || `District_${districtId}`;

        await sequelize.query(
          "UPDATE admin_assignments SET district_id = ? WHERE assignment_id = ?",
          { replacements: [districtName, assignment.assignment_id] },
        );

        console.log(`✓ Updated: ${districtId} → ${districtName}`);
      } else {
        console.log(`✓ Already a name: ${districtId}`);
      }
    }

    // Verify
    console.log("\n✅ Final admin assignments:");
    const result = await sequelize.query(
      `SELECT a.email, aa.district_id, aa.area_no 
       FROM admin_assignments aa 
       JOIN admins a ON aa.admin_id = a.admin_id`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    result.forEach((r) => {
      console.log(`   ${r.email} → ${r.district_id}, Area ${r.area_no}`);
    });

    console.log("\n✅ Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
