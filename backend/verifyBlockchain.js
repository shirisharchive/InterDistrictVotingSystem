require("dotenv").config();
const { getContract } = require("./SmartContract/contractInstance");
const blockchainService = require("./SmartContract/blockchainService");

async function verifyBlockchainData() {
  try {
    console.log("\n🔍 Verifying Blockchain Data...\n");

    // Initialize blockchain service
    await blockchainService.initialize();

    // 1. Check Voters
    const voterCount = await blockchainService.getTotalVoterCount();
    console.log("✅ Total Voters on Blockchain:", voterCount);

    // 2. Check Candidates
    const candidateCount = await blockchainService.getCandidateCount();
    console.log("✅ Total Candidates on Blockchain:", candidateCount);

    // 3. Check Parties
    const partyCount = await blockchainService.getPartyCount();
    console.log("✅ Total Parties on Blockchain:", partyCount);

    // 4. Get all candidates with results
    if (candidateCount > 0) {
      console.log("\n📋 Candidates on Blockchain:");
      const candidates = await blockchainService.getAllCandidatesWithResults();
      candidates.forEach((c, index) => {
        console.log(`\n  ${index + 1}. ${c.name}`);
        console.log(`     Party: ${c.party}`);
        console.log(`     Position: ${c.position}`);
        console.log(`     Votes: ${c.voteCount}`);
      });
    }

    // 5. Get all parties with results
    if (partyCount > 0) {
      console.log("\n🎯 Parties on Blockchain:");
      const parties = await blockchainService.getAllPartiesWithResults();
      parties.forEach((p, index) => {
        console.log(`\n  ${index + 1}. ${p.partyName}`);
        console.log(`     Votes: ${p.voteCount}`);
      });
    }

    // 6. Check total votes cast
    const totalVotes = await blockchainService.getTotalVotesCast();
    console.log("\n✅ Total Direct Votes Cast:", totalVotes);

    const totalPartyVotes = await blockchainService.getTotalPartyVotesCast();
    console.log("✅ Total Party Votes Cast:", totalPartyVotes);

    console.log("\n✨ Blockchain verification complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error verifying blockchain data:", error);
    process.exit(1);
  }
}

verifyBlockchainData();
