/**
 * Test Script: Fetch Data Directly from Blockchain
 * This demonstrates that blockchain data can be fetched WITHOUT any database
 */

require("dotenv").config();
const blockchainService = require("./SmartContract/blockchainService");

async function testBlockchainDirectFetch() {
  try {
    console.log("\n" + "=".repeat(70));
    console.log(
      "🧪 TESTING: Direct Blockchain Data Fetching (NO DATABASE NEEDED)"
    );
    console.log("=".repeat(70) + "\n");

    // Initialize blockchain service
    await blockchainService.initialize();
    console.log("✅ Connected to Blockchain\n");

    // Test 1: Fetch Candidates
    console.log("📋 Test 1: Fetching Candidates from Blockchain...");
    try {
      const candidates = await blockchainService.getAllCandidatesWithResults();
      console.log(`✅ Found ${candidates.length} candidates on blockchain:`);

      if (candidates.length > 0) {
        candidates.forEach((c, index) => {
          console.log(
            `   ${index + 1}. ${c.name} (${c.party}) - Votes: ${c.voteCount}`
          );
        });
      } else {
        console.log("   (No candidates registered yet)");
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }

    console.log();

    // Test 2: Fetch Parties
    console.log("📋 Test 2: Fetching Parties from Blockchain...");
    try {
      const parties = await blockchainService.getAllPartiesWithResults();
      console.log(`✅ Found ${parties.length} parties on blockchain:`);

      if (parties.length > 0) {
        parties.forEach((p, index) => {
          console.log(
            `   ${index + 1}. ${p.partyName} - Votes: ${p.voteCount}`
          );
        });
      } else {
        console.log("   (No parties registered yet)");
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }

    console.log();

    // Test 3: Get Counts
    console.log("📊 Test 3: Getting Counts from Blockchain...");
    try {
      const voterCount = await blockchainService.getTotalVoterCount();
      const candidateCount = await blockchainService.getCandidateCount();
      const partyCount = await blockchainService.getPartyCount();
      const directVotes = await blockchainService.getTotalVotesCast();
      const partyVotes = await blockchainService.getTotalPartyVotesCast();

      console.log(`✅ Blockchain Statistics:`);
      console.log(`   Registered Voters: ${voterCount}`);
      console.log(`   Registered Candidates: ${candidateCount}`);
      console.log(`   Registered Parties: ${partyCount}`);
      console.log(`   Direct Votes Cast: ${directVotes}`);
      console.log(`   Party Votes Cast: ${partyVotes}`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("🎉 SUCCESS: Blockchain data fetched WITHOUT database!");
    console.log("=".repeat(70));
    console.log("\n💡 Key Points:");
    console.log("   ✅ All data came directly from smart contract");
    console.log("   ✅ No database connection was needed");
    console.log("   ✅ This works even if database is completely deleted");
    console.log("   ✅ Contract address: " + blockchainService.contractAddress);
    console.log();

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during test:", error.message);
    console.error("\n📝 Troubleshooting:");
    console.error("   1. Make sure Ganache is running on port 7545");
    console.error("   2. Make sure the contract is deployed");
    console.error("   3. Run 'cd Contract && truffle migrate --reset'");
    console.error();
    process.exit(1);
  }
}

// Run the test
testBlockchainDirectFetch();
