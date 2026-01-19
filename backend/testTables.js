const db = require("./config/database");

async function testTables() {
  try {
    console.log("Testing table names...\n");

    const tableTests = [
      "VoterInfos",
      "CandidateInfos",
      "VoteInfos",
      "PartyInfos",
      "voters",
      "candidates",
      "votes",
      "parties",
    ];

    for (const table of tableTests) {
      try {
        const result = await db.query(
          `SELECT COUNT(*) as count FROM "${table}"`,
          {
            type: db.QueryTypes.SELECT,
          },
        );
        console.log(`✓ Table "${table}" exists - Count: ${result[0].count}`);
      } catch (e) {
        console.log(`✗ Table "${table}" does not exist`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testTables();
