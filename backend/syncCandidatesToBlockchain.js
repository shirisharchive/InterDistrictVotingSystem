const blockchainService = require("./SmartContract/blockchainService");
const CandidateInfo = require("./electionModel/CandidateInfo");
const PartyInfo = require("./electionModel/PartyInfo");
const { sequelize } = require("./config/database");

async function syncCandidatesToBlockchain() {
  try {
    console.log("🔍 Starting candidate-blockchain sync...\n");

    // Step 1: Initialize blockchain service
    await blockchainService.initialize();

    // Step 2: Get all candidates from database
    const dbCandidates = await CandidateInfo.findAll({
      raw: true,
      order: [["id", "ASC"]],
    });

    console.log(`📊 Found ${dbCandidates.length} candidates in database\n`);

    if (dbCandidates.length === 0) {
      console.log("✅ No candidates to sync");
      return;
    }

    // Step 3: Get blockchain candidate count
    const blockchainCount = await blockchainService.getCandidateCount();
    console.log(
      `⛓️  Blockchain has ${blockchainCount} candidates registered\n`,
    );

    // Step 4: Check for mismatches
    let needsSync = false;
    const candidatesWithoutBlockchainId = dbCandidates.filter(
      (c) => c.BlockchainId === null || c.BlockchainId === undefined,
    );

    if (candidatesWithoutBlockchainId.length > 0) {
      console.log(
        `⚠️  Found ${candidatesWithoutBlockchainId.length} candidates WITHOUT BlockchainId:`,
      );
      candidatesWithoutBlockchainId.forEach((c) => {
        console.log(`   - ${c.id}: ${c.CandidateName} (${c.CandidateParty})`);
      });
      needsSync = true;
    }

    if (dbCandidates.length !== blockchainCount) {
      console.log(
        `⚠️  Mismatch: ${dbCandidates.length} in DB vs ${blockchainCount} in blockchain`,
      );
      needsSync = true;
    }

    console.log("\n");

    if (!needsSync) {
      console.log("✅ All candidates are properly synced!");
      return;
    }

    // Step 5: Resync candidates without BlockchainId
    console.log("🔄 Attempting to register candidates on blockchain...\n");

    for (const candidate of candidatesWithoutBlockchainId) {
      try {
        console.log(
          `Processing: ${candidate.CandidateName} (${candidate.CandidateParty})`,
        );

        const blockchainResult = await blockchainService.addCandidate(
          candidate.CandidateName,
          candidate.CandidateParty,
          candidate.CandidatePosition,
          candidate.District,
          candidate.AreaNo,
          candidate.CandidateImage,
          candidate.CandidateElectionLogo,
        );

        // Update the candidate's BlockchainId
        await CandidateInfo.update(
          { BlockchainId: blockchainResult.blockchainId },
          { where: { id: candidate.id } },
        );

        console.log(
          `   ✅ Registered with BlockchainId: ${blockchainResult.blockchainId}\n`,
        );
      } catch (error) {
        console.error(`   ❌ Failed to register: ${error.message}\n`);
      }
    }

    console.log("\n✅ Sync completed!");
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    process.exit(1);
  } finally {
    if (sequelize) await sequelize.close();
  }
}

// Run the sync
syncCandidatesToBlockchain();
