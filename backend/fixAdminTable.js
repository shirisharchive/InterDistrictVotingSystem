require("dotenv").config();
const db = require("./config/database");
const bcrypt = require("bcrypt");

async function fixAdminTable() {
  try {
    console.log("🔧 Fixing admin table and password hashes...\n");

    // Step 1: Check current table structure
    console.log("📋 Checking current table structure...");
    const tableCheck = await db.query(
      `
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'admins' AND column_name = 'password_hash'
    `,
      { type: db.QueryTypes.SELECT },
    );

    if (tableCheck.length > 0) {
      console.log(
        `   Current password_hash column: ${tableCheck[0].data_type}${tableCheck[0].character_maximum_length ? `(${tableCheck[0].character_maximum_length})` : ""}`,
      );
    }

    // Step 2: Create admin tables if they don't exist
    console.log("\n📦 Ensuring admin tables exist...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_super_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_assignments (
        assignment_id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(admin_id) ON DELETE CASCADE,
        district_id VARCHAR(50),
        area_no INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(admin_id, district_id, area_no)
      )
    `);

    console.log("   ✓ Tables exist");

    // Step 3: Alter password_hash column to proper length
    console.log("\n🔄 Updating password_hash column to VARCHAR(255)...");
    await db.query(`
      ALTER TABLE admins 
      ALTER COLUMN password_hash TYPE VARCHAR(255)
    `);
    console.log("   ✓ Column updated");

    // Step 4: Delete existing admins and recreate with proper hashes
    console.log("\n🗑️  Removing old admin entries...");
    await db.query(`TRUNCATE TABLE admin_assignments CASCADE`);
    await db.query(`TRUNCATE TABLE admins RESTART IDENTITY CASCADE`);
    console.log("   ✓ Old entries removed");

    // Step 5: Create default admins with proper password hashes
    console.log("\n👤 Creating default admin accounts...");

    const superAdminPassword = "admin123"; // Default password
    const districtAdminPassword = "kathmandu123"; // Default password

    const superAdminHash = await bcrypt.hash(superAdminPassword, 10);
    const districtAdminHash = await bcrypt.hash(districtAdminPassword, 10);

    console.log(
      `   Super Admin hash length: ${superAdminHash.length} characters`,
    );
    console.log(
      `   District Admin hash length: ${districtAdminHash.length} characters`,
    );

    // Insert Super Admin
    await db.query(
      `
      INSERT INTO admins (name, email, password_hash, is_super_admin)
      VALUES ($1, $2, $3, $4)
    `,
      {
        bind: ["Super Admin", "admin@voting.com", superAdminHash, true],
        type: db.QueryTypes.INSERT,
      },
    );

    // Insert Kathmandu Admin
    await db.query(
      `
      INSERT INTO admins (name, email, password_hash, is_super_admin)
      VALUES ($1, $2, $3, $4)
    `,
      {
        bind: [
          "Kathmandu Admin",
          "kathmandu.admin@voting.com",
          districtAdminHash,
          false,
        ],
        type: db.QueryTypes.INSERT,
      },
    );

    // Assign district to Kathmandu Admin
    await db.query(`
      INSERT INTO admin_assignments (admin_id, district_id, area_no)
      VALUES (2, 'kathmandu', 1)
    `);

    console.log("   ✓ Admin accounts created");

    // Step 6: Verify the fix
    console.log("\n✅ Verifying admin accounts...");
    const admins = await db.query(
      `SELECT admin_id, name, email, is_super_admin, LENGTH(password_hash) as hash_length FROM admins`,
      {
        type: db.QueryTypes.SELECT,
      },
    );

    console.log("\n📋 Admin Accounts:");
    admins.forEach((admin) => {
      console.log(`   ${admin.admin_id}. ${admin.name}`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Super Admin: ${admin.is_super_admin}`);
      console.log(`      Hash Length: ${admin.hash_length} characters`);
    });

    // Test password verification
    console.log("\n🔐 Testing password verification...");
    const testAdmin = await db.query(
      `SELECT * FROM admins WHERE email = 'admin@voting.com'`,
      {
        type: db.QueryTypes.SELECT,
      },
    );

    if (testAdmin.length > 0) {
      const isValid = await bcrypt.compare(
        superAdminPassword,
        testAdmin[0].password_hash,
      );
      console.log(
        `   Password verification test: ${isValid ? "✓ PASSED" : "✗ FAILED"}`,
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Admin table fixed successfully!");
    console.log("=".repeat(60));
    console.log("\n📝 Default Admin Credentials:");
    console.log("   Super Admin:");
    console.log("      Email: admin@voting.com");
    console.log("      Password: admin123");
    console.log("\n   Kathmandu Admin:");
    console.log("      Email: kathmandu.admin@voting.com");
    console.log("      Password: kathmandu123");
    console.log("\n⚠️  Please change these passwords after first login!");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error fixing admin table:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

fixAdminTable();
