const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const pool = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "voting_system",
});

(async () => {
  try {
    // Super admin details
    const email = "superadmin@voting.com";
    const password = "SuperAdmin@123";
    const adminName = "Super Admin";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🔐 Creating super admin...\n");

    const result = await pool.query(
      `INSERT INTO admins (email, password_hash, admin_name, is_super_admin, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, true, NOW(), NOW())
       RETURNING admin_id, email, admin_name, is_super_admin`,
      [email, hashedPassword, adminName],
    );

    const newAdmin = result.rows[0];
    console.log("✅ Super admin created successfully!\n");
    console.log("📋 Super Admin Details:");
    console.log(`   ID: ${newAdmin.admin_id}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Name: ${newAdmin.admin_name}`);
    console.log(
      `   Super Admin: ${newAdmin.is_super_admin ? "✅ YES" : "❌ NO"}`,
    );
    console.log("\n🔑 Login Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n💡 Use these credentials to login to the admin dashboard");

    await pool.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
