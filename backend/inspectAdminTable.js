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
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admins' 
      ORDER BY ordinal_position
    `);
    console.log("📋 Admin table columns:");
    result.rows.forEach((col) => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });

    const admins = await pool.query("SELECT * FROM admins");
    console.log(`\n📊 Total admins: ${admins.rows.length}`);
    admins.rows.forEach((admin, idx) => {
      console.log(`\n  Admin ${idx + 1}:`, JSON.stringify(admin, null, 2));
    });

    await pool.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
