const db = require("./config/database");
const jwt = require("jsonwebtoken");

async function testDashboard() {
  try {
    console.log("Testing dashboard queries...\n");

    // Test super admin case
    console.log("1. Testing VoterInfo count:");
    const votersQuery = `SELECT COUNT(*) as total_voters FROM "VoterInfo"`;
    const votersResult = await db.query(votersQuery, {
      type: db.QueryTypes.SELECT,
    });
    console.log("   Result:", votersResult);

    console.log("\n2. Testing VoteInfo count:");
    const votesQuery = `SELECT COUNT(*) as votes_cast FROM "VoteInfo"`;
    const votesResult = await db.query(votesQuery, {
      type: db.QueryTypes.SELECT,
    });
    console.log("   Result:", votesResult);

    console.log("\n3. Testing leading candidate:");
    const leadingQuery = `
      SELECT c."CandidateName" as candidate_name, c."CandidateParty" as party_name, COUNT(v.id) as vote_count
      FROM "CandidateInfo" c
      LEFT JOIN "VoteInfo" v ON c.id = v."CandidateId"
      GROUP BY c.id, c."CandidateName", c."CandidateParty"
      ORDER BY vote_count DESC
      LIMIT 1
    `;
    const leadingResult = await db.query(leadingQuery, {
      type: db.QueryTypes.SELECT,
    });
    console.log("   Result:", leadingResult);

    console.log("\n4. Testing leading party:");
    const leadingPartyQuery = `
      SELECT p."PartyName" as party_name, COUNT(v.id) as vote_count
      FROM "PartyInfo" p
      LEFT JOIN "IndirectVoteInfo" v ON p.id = v."PartyId"
      GROUP BY p.id, p."PartyName"
      ORDER BY vote_count DESC
      LIMIT 1
    `;
    const leadingPartyResult = await db.query(leadingPartyQuery, {
      type: db.QueryTypes.SELECT,
    });
    console.log("   Result:", leadingPartyResult);

    console.log("\n✅ All queries executed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDashboard();
