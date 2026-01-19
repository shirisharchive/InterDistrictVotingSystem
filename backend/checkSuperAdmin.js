const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "voting_system",
});

(async () => {
  try {
    console.log("📋 Checking admins in database...\n");
    const result = await pool.query(`
      SELECT admin_id, email, is_super_admin, name 
      FROM admins 
      ORDER BY is_super_admin DESC, admin_id
    `);

    if (result.rows.length === 0) {
      console.log("❌ No admins found in database");
    } else {
      console.log("Found " + result.rows.length + " admin(s):\n");
      result.rows.forEach((admin) => {
        console.log(`  ID: ${admin.admin_id}`);
        console.log(`  Name: ${admin.name || "N/A"}`);
        console.log(`  Email: ${admin.email}`);
        console.log(
          `  Super Admin: ${admin.is_super_admin ? "✅ YES" : "❌ NO"}`,
        );
        console.log("");
      });
    }

    // Check if any super admins exist
    const superAdminResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM admins 
      WHERE is_super_admin = true
    `);

    const superAdminCount = superAdminResult.rows[0].count;
    console.log(`\n📊 Summary:`);
    console.log(`   Total Admins: ${result.rows.length}`);
    console.log(`   Super Admins: ${superAdminCount}`);

    if (superAdminCount === 0) {
      console.log("\n⚠️  No super admins found!");
      console.log(
        "   You need to create a super admin to access the admin management features.",
      );
      console.log("\n💡 Run: node upgradeSuperAdmin.js <admin_id>");
    }

    await pool.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
