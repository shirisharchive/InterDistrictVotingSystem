const db = require("./config/database");
const bcrypt = require("bcrypt");

async function testAdminLogin() {
  try {
    console.log("Testing admin login...\n");

    // Get all admins
    const admins = await db.query(
      "SELECT admin_id, name, email, is_super_admin, LENGTH(password_hash) as hash_length FROM admins",
      { type: db.QueryTypes.SELECT },
    );

    console.log("Admins in database:");
    admins.forEach((a) =>
      console.log(
        `  ${a.admin_id}. ${a.name} (${a.email}) - Super: ${a.is_super_admin}, Hash: ${a.hash_length} chars`,
      ),
    );

    // Test password for admin@voting.com
    console.log("\nTesting password for admin@voting.com...");
    const admin = await db.query(
      "SELECT * FROM admins WHERE email = 'admin@voting.com'",
      { type: db.QueryTypes.SELECT },
    );

    if (admin.length === 0) {
      console.log("❌ Admin not found!");
      process.exit(1);
    }

    console.log(`Admin found: ${admin[0].name}`);
    console.log(`Password hash length: ${admin[0].password_hash.length}`);

    // Test password
    const testPassword = "admin123";
    const isValid = await bcrypt.compare(testPassword, admin[0].password_hash);

    console.log(`\nPassword test result: ${isValid ? "✓ VALID" : "✗ INVALID"}`);

    if (!isValid) {
      console.log("\n⚠️  Password is incorrect!");
      console.log("Run fixAdminTable.js to reset the password");
    } else {
      console.log("✓ Password is correct");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAdminLogin();
