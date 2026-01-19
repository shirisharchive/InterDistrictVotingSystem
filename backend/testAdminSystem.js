// Test script to verify the admin system is working correctly
const { Sequelize } = require("sequelize");
const db = require("./config/database");

async function testAdminSystem() {
  try {
    console.log("\n🧪 Testing Admin System with District/Area Columns...\n");

    // Test 1: Check if columns exist
    console.log("1️⃣ Checking admins table structure...");
    const [columns] = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admins'
      ORDER BY ordinal_position
    `);
    console.log("Columns in admins table:");
    columns.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Test 2: Query all admins with district and area
    console.log("\n2️⃣ Fetching all admins with district/area...");
    const [admins] = await db.query(`
      SELECT admin_id, name, email, is_super_admin, district, area
      FROM admins
      ORDER BY admin_id
    `);
    console.log(`Found ${admins.length} admins:`);
    admins.forEach((admin) => {
      console.log(
        `   - ID: ${admin.admin_id} | Name: ${admin.name} | Super Admin: ${admin.is_super_admin} | District: ${admin.district || "N/A"} | Area: ${admin.area || "N/A"}`,
      );
    });

    // Test 3: Check middleware compatibility
    console.log("\n3️⃣ Testing admin assignment format (for middleware)...");
    const [testAdmin] = await db.query(`
      SELECT admin_id, district, area, is_super_admin
      FROM admins
      WHERE district IS NOT NULL
      LIMIT 1
    `);

    if (testAdmin.length > 0) {
      const admin = testAdmin[0];
      console.log("Sample admin assignment object:");
      console.log(JSON.stringify(admin, null, 2));

      // Verify structure matches what middleware expects
      if (admin.district && admin.area !== null) {
        console.log(
          "✅ Admin has both district and area - middleware will work!",
        );
      } else {
        console.log("⚠️  Warning: Admin missing district or area");
      }
    } else {
      console.log("⚠️  No district admins found in database");
    }

    // Test 4: Verify data types
    console.log("\n4️⃣ Verifying data types...");
    if (admins.length > 0) {
      const sampleAdmin = admins.find((a) => a.district && a.area);
      if (sampleAdmin) {
        console.log(
          `District type: ${typeof sampleAdmin.district} (should be string)`,
        );
        console.log(`Area type: ${typeof sampleAdmin.area} (should be number)`);

        if (
          typeof sampleAdmin.district === "string" &&
          typeof sampleAdmin.area === "number"
        ) {
          console.log("✅ Data types are correct!");
        } else {
          console.log("⚠️  Warning: Data types may need adjustment");
        }
      }
    }

    console.log("\n✅ All tests completed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    await db.close();
  }
}

// Run tests
if (require.main === module) {
  testAdminSystem()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = testAdminSystem;
