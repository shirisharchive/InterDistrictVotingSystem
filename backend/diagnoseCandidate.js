#!/usr/bin/env node

/**
 * CANDIDATE REGISTRATION DIAGNOSTIC
 * Quickly diagnoses and fixes blockchain-database candidate mismatches
 */

const blockchainService = require("./SmartContract/blockchainService");
const CandidateInfo = require("./electionModel/CandidateInfo");
const { sequelize } = require("./config/database");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function section(title) {
  log("\n" + "=".repeat(70), "cyan");
  log(`  ${title}`, "cyan");
  log("=".repeat(70) + "\n", "cyan");
}

async function diagnose() {
  try {
    section("CANDIDATE REGISTRATION DIAGNOSTIC");

    // Step 1: Check blockchain connection
    log("✓ Initializing blockchain service...", "blue");
    await blockchainService.initialize();
    log("✅ Blockchain connected\n", "green");

    // Step 2: Get blockchain data
    log("⟳ Fetching blockchain data...", "blue");
    const blockchainCount = await blockchainService.getCandidateCount();
    const blockchainCandidates = await blockchainService.getAllCandidates();
    log(`✅ Blockchain has ${blockchainCount} candidates\n`, "green");

    // Step 3: Get database data
    log("⟳ Fetching database data...", "blue");
    const dbCandidates = await CandidateInfo.findAll({
      raw: true,
      order: [["id", "ASC"]],
    });
    log(`✅ Database has ${dbCandidates.length} candidates\n`, "green");

    // Step 4: Detailed analysis
    section("DETAILED ANALYSIS");

    log("Database Candidates:", "cyan");
    if (dbCandidates.length === 0) {
      log("  (No candidates in database)\n", "yellow");
    } else {
      dbCandidates.forEach((c, idx) => {
        const blockchainId = c.BlockchainId;
        const hasBlockchainId =
          blockchainId !== null && blockchainId !== undefined;
        const icon = hasBlockchainId ? "✅" : "❌";
        const idDisplay = hasBlockchainId ? blockchainId : "NULL";

        log(
          `  ${icon} [ID: ${c.id}] ${c.CandidateName} | Party: ${c.CandidateParty} | BlockchainId: ${idDisplay}`,
          hasBlockchainId ? "green" : "red",
        );
      });
    }

    log("\nBlockchain Candidates:", "cyan");
    if (blockchainCandidates.length === 0) {
      log("  (No candidates in blockchain)\n", "yellow");
    } else {
      blockchainCandidates.forEach((c, idx) => {
        log(
          `  ✓ [Index: ${idx}] ${c.name} | Party: ${c.party} | Votes: ${c.voteCount}`,
          "green",
        );
      });
    }

    // Step 5: Check for issues
    section("ISSUES DETECTED");

    let hasIssues = false;

    // Issue 1: Database candidates without BlockchainId
    const noBlockchainId = dbCandidates.filter(
      (c) => c.BlockchainId === null || c.BlockchainId === undefined,
    );
    if (noBlockchainId.length > 0) {
      hasIssues = true;
      log(
        `❌ ${noBlockchainId.length} candidates missing BlockchainId:`,
        "red",
      );
      noBlockchainId.forEach((c) => {
        log(`   - ${c.CandidateName} (ID: ${c.id})`, "red");
      });
      log("");
    }

    // Issue 2: Count mismatch
    if (dbCandidates.length !== blockchainCount) {
      hasIssues = true;
      log(
        `❌ Count mismatch: ${dbCandidates.length} in DB vs ${blockchainCount} in blockchain`,
        "red",
      );
      log("");
    }

    // Issue 3: Invalid blockchain IDs
    const invalidBlockchainIds = dbCandidates.filter(
      (c) => c.BlockchainId >= blockchainCount && c.BlockchainId !== null,
    );
    if (invalidBlockchainIds.length > 0) {
      hasIssues = true;
      log(
        `❌ ${invalidBlockchainIds.length} candidates with invalid BlockchainId:`,
        "red",
      );
      invalidBlockchainIds.forEach((c) => {
        log(
          `   - ${c.CandidateName} has BlockchainId ${c.BlockchainId}, but max is ${blockchainCount - 1}`,
          "red",
        );
      });
      log("");
    }

    if (!hasIssues) {
      log("✅ No issues detected! All candidates properly synced.", "green");
      log("");
    }

    // Step 6: Recommendations
    section("RECOMMENDATIONS");

    if (noBlockchainId.length > 0) {
      log("Run this to auto-register missing candidates:", "yellow");
      log("  node syncCandidatesToBlockchain.js\n", "blue");
    } else if (hasIssues) {
      log("Options:", "yellow");
      log("1. Clear database and re-register candidates:", "yellow");
      log("   node resetAndSyncDatabase.js", "blue");
      log(
        "2. Or manually delete and re-add candidates in Admin Panel\n",
        "yellow",
      );
    } else {
      log("✅ System is ready for voting!", "green");
      log(
        "Candidates are properly registered and voters can cast votes.\n",
        "green",
      );
    }

    // Step 7: Voting test info
    section("VOTING READINESS");

    if (!hasIssues && dbCandidates.length > 0) {
      log("✅ READY TO VOTE", "green");
      log(`   - ${blockchainCount} candidates available`, "green");
      log("   - Voters can vote via dashboard", "green");
      log("   - Ensure voters are registered first", "green");
    } else {
      log("❌ NOT READY TO VOTE", "red");
      log("   - Fix issues above first", "red");
      log("   - Register at least 1 candidate", "red");
      log("   - Ensure all candidates have BlockchainId", "red");
    }

    log("\n");
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
    log(`\nMake sure:`, "yellow");
    log(`  - Ganache is running on http://localhost:7545`, "blue");
    log(`  - Database is accessible`, "blue");
    log(`  - Smart contract is deployed`, "blue");
    process.exit(1);
  } finally {
    if (sequelize) await sequelize.close();
  }
}

// Run diagnostic
diagnose();
