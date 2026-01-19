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
    console.log("📋 Checking admin data...");
    const admins = await pool.query(
      "SELECT admin_id FROM admins ORDER BY admin_id",
    );
    console.log(
      "✅ Admin IDs in admins table:",
      admins.rows.map((r) => r.admin_id),
    );

    console.log("\n📋 Checking admin_assignments data...");
    const assignments = await pool.query(
      "SELECT DISTINCT admin_id FROM admin_assignments ORDER BY admin_id",
    );
    console.log(
      "✅ Admin IDs in admin_assignments:",
      assignments.rows.map((r) => r.admin_id),
    );

    // Find orphaned records
    const adminIds = admins.rows.map((r) => r.admin_id);
    const assignmentIds = assignments.rows
      .map((r) => r.admin_id)
      .filter((id) => id !== null);
    const orphaned = assignmentIds.filter((id) => !adminIds.includes(id));

    if (orphaned.length > 0) {
      console.log(
        "\n⚠️  Orphaned admin_id values in admin_assignments:",
        orphaned,
      );

      // Show the records
      for (const id of orphaned) {
        const records = await pool.query(
          "SELECT * FROM admin_assignments WHERE admin_id = $1",
          [id],
        );
        console.log(
          `\nRecords with admin_id=${id}:`,
          records.rows.length,
          "records",
        );
      }

      console.log(
        "\n🔧 Fix: Delete orphaned records from admin_assignments...",
      );
      const deleteSql = `DELETE FROM admin_assignments WHERE admin_id IN (${orphaned.join(",")})`;
      const result = await pool.query(deleteSql);
      console.log(`✅ Deleted ${result.rowCount} orphaned records`);
    } else {
      console.log("\n✅ No orphaned records found!");
    }

    await pool.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
