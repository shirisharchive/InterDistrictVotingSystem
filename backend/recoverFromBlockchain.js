require("dotenv").config();
const blockchainService = require("./SmartContract/blockchainService");
const {
  VoterInfo,
  CandidateInfo,
  PartyInfo,
  VoteInfo,
  IndirectVoteInfo,
} = require("./electionModel");
const { sequelize } = require("./config/database");

/**
 * Recover all data from blockchain to database
 * This script fetches all data from the blockchain and restores it to the database
 * Use this when the database is deleted or corrupted
 */
async function recoverFromBlockchain() {
  try {
    console.log("\n🔄 Starting Data Recovery from Blockchain...\n");

    // Initialize blockchain service
    await blockchainService.initialize();
    console.log(
      `✅ Connected to blockchain at contract: ${blockchainService.contractAddress}\n`
    );

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established\n");

    let recovered = {
      voters: 0,
      candidates: 0,
      parties: 0,
      votes: 0,
    };

    // ============ Recover Voters ============
    console.log("📋 Recovering Voters...");
    const voterCount = await blockchainService.getTotalVoterCount();
    console.log(`   Found ${voterCount} voters on blockchain`);

    // Note: Blockchain doesn't store full voter details, only voter IDs
    // You would need to have the original voter data or implement a more robust storage
    console.log(
      "   ⚠️  Note: Blockchain only stores voter IDs, not full voter details"
    );
    console.log(
      "   To fully recover voters, you need the original voter registration data\n"
    );

    // ============ Recover Candidates ============
    console.log("📋 Recovering Candidates...");
    const blockchainCandidates =
      await blockchainService.getAllCandidatesWithResults();
    console.log(`   Found ${blockchainCandidates.length} candidates\n`);

    for (const candidate of blockchainCandidates) {
      try {
        // Check if candidate already exists
        const existing = await CandidateInfo.findOne({
          where: { BlockchainId: candidate.id },
        });

        if (!existing) {
          await CandidateInfo.create({
            BlockchainId: candidate.id,
            CandidateName: candidate.name,
            CandidatePartyName: candidate.party,
            Position: candidate.position,
            CandidatePhotoUrl: candidate.candidatePhotoUrl,
            CandidatePartyLogoUrl: candidate.candidatePartyLogoUrl,
            // Note: District and AreaNo cannot be recovered from blockchain
            // You'll need to update these manually or from another source
            District: "UNKNOWN",
            AreaNo: 0,
          });
          recovered.candidates++;
          console.log(`   ✅ Recovered: ${candidate.name}`);
        } else {
          console.log(`   ⏭️  Skipped (already exists): ${candidate.name}`);
        }
      } catch (error) {
        console.error(
          `   ❌ Failed to recover ${candidate.name}:`,
          error.message
        );
      }
    }

    // ============ Recover Parties ============
    console.log("\n📋 Recovering Parties...");
    const blockchainParties =
      await blockchainService.getAllPartiesWithResults();
    console.log(`   Found ${blockchainParties.length} parties\n`);

    for (const party of blockchainParties) {
      try {
        const existing = await PartyInfo.findOne({
          where: { BlockchainId: party.id },
        });

        if (!existing) {
          await PartyInfo.create({
            BlockchainId: party.id,
            PartyName: party.partyName,
            PartySymbol: party.partySymbol,
            PartyLeader: party.partyLeader,
            PartyLogoUrl: party.partyLogoUrl,
          });
          recovered.parties++;
          console.log(`   ✅ Recovered: ${party.partyName}`);
        } else {
          console.log(`   ⏭️  Skipped (already exists): ${party.partyName}`);
        }
      } catch (error) {
        console.error(
          `   ❌ Failed to recover ${party.partyName}:`,
          error.message
        );
      }
    }

    // ============ Summary ============
    console.log("\n" + "=".repeat(60));
    console.log("📊 Recovery Summary:");
    console.log("=".repeat(60));
    console.log(`   Voters on Blockchain: ${voterCount}`);
    console.log(`   Candidates Recovered: ${recovered.candidates}`);
    console.log(`   Parties Recovered: ${recovered.parties}`);
    console.log("=".repeat(60));

    console.log("\n⚠️  Important Notes:");
    console.log(
      "   1. Voter details cannot be fully recovered from blockchain"
    );
    console.log("   2. District and AreaNo for candidates need manual update");
    console.log(
      "   3. Vote history cannot be recovered from current blockchain"
    );
    console.log("   4. You may need to re-register voters with full details\n");

    console.log("✨ Data recovery complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during data recovery:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run recovery if this script is executed directly
if (require.main === module) {
  recoverFromBlockchain();
}

module.exports = { recoverFromBlockchain };
