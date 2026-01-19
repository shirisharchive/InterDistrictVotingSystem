#!/usr/bin/env node

/**
 * CANDIDATE DATABASE VIEWER
 * Shows all candidates and their blockchain registration status
 */

const CandidateInfo = require("./electionModel/CandidateInfo");
const { sequelize } = require("./config/database");

async function viewCandidates() {
  try {
    const candidates = await CandidateInfo.findAll({
      order: [["id", "ASC"]],
      raw: true,
    });

    console.log("\n" + "=".repeat(100));
    console.log("  CANDIDATES IN DATABASE");
    console.log("=".repeat(100) + "\n");

    if (candidates.length === 0) {
      console.log("  ❌ No candidates registered yet\n");
      console.log("  Next steps:");
      console.log("  1. Go to Admin Panel");
      console.log("  2. Click 'Manage Candidates'");
      console.log("  3. Click 'Add New Candidate'");
      console.log("  4. Fill in all fields and submit\n");
      console.log("=".repeat(100) + "\n");
      process.exit(0);
    }

    console.log(
      "ID | BlockchainId | Name                  | Party              | Position      | Status",
    );
    console.log("-".repeat(100));

    candidates.forEach((c) => {
      const id = c.id.toString().padEnd(2);
      const blockchainId = (c.BlockchainId !== null ? c.BlockchainId : "NULL")
        .toString()
        .padEnd(12);
      const name = (c.CandidateName || "Unknown").substring(0, 21).padEnd(21);
      const party = (c.CandidateParty || "Unknown").substring(0, 18).padEnd(18);
      const position = (c.CandidatePosition || "Unknown")
        .substring(0, 13)
        .padEnd(13);
      const status =
        c.BlockchainId !== null ? "✅ REGISTERED" : "❌ NOT REGISTERED";

      console.log(
        `${id}| ${blockchainId}| ${name}| ${party}| ${position}| ${status}`,
      );
    });

    console.log("-".repeat(100) + "\n");

    const registered = candidates.filter((c) => c.BlockchainId !== null).length;
    const notRegistered = candidates.length - registered;

    console.log(`Summary:`);
    console.log(`  Total: ${candidates.length}`);
    console.log(`  ✅ Registered on blockchain: ${registered}`);
    console.log(`  ❌ NOT registered on blockchain: ${notRegistered}\n`);

    if (notRegistered > 0) {
      console.log("⚠️  ACTION REQUIRED:");
      console.log(
        `  ${notRegistered} candidate(s) need blockchain registration!`,
      );
      console.log("\n  Run this to fix:");
      console.log("    node syncCandidatesToBlockchain.js\n");
    } else if (candidates.length === 0) {
      console.log("⚠️  No candidates registered!");
      console.log("  Register candidates in Admin Panel first.\n");
    } else {
      console.log("✅ All candidates properly registered!");
      console.log("  Voting is ready to proceed.\n");
    }

    console.log("=".repeat(100) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (sequelize) await sequelize.close();
  }
}

viewCandidates();
