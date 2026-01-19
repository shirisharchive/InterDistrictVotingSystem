const sequelize = require("./config/database");
const CandidateInfo = require("./electionModel/CandidateInfo");
const VoterInfo = require("./electionModel/VoterInfo");

async function checkData() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    // Check Voters
    const voters = await VoterInfo.findAll({
      attributes: ["id", "VoterId", "VoterName", "District", "AreaNo"],
    });

    console.log("👥 VOTERS:");
    console.log("==========================================");
    if (voters.length === 0) {
      console.log("No voters found\n");
    } else {
      voters.forEach((v) => {
        console.log(
          `ID: ${v.id} | VoterID: ${v.VoterId} | Name: ${v.VoterName}`
        );
        console.log(`   District: ${v.District} | Area: ${v.AreaNo}`);
        console.log("");
      });
    }

    // Check Candidates
    const candidates = await CandidateInfo.findAll({
      attributes: [
        "id",
        "CandidateName",
        "CandidateParty",
        "CandidatePosition",
        "District",
        "AreaNo",
        "BlockchainId",
      ],
    });

    console.log("\n👤 CANDIDATES:");
    console.log("==========================================");
    if (candidates.length === 0) {
      console.log("No candidates found\n");
    } else {
      candidates.forEach((c) => {
        console.log(`ID: ${c.id} | Name: ${c.CandidateName}`);
        console.log(
          `   Party: ${c.CandidateParty} | Position: ${c.CandidatePosition}`
        );
        console.log(`   District: ${c.District} | Area: ${c.AreaNo}`);
        console.log(`   BlockchainId: ${c.BlockchainId || "NULL ❌"}`);
        console.log("");
      });

      // Check for duplicates
      const duplicates = new Map();
      candidates.forEach((c) => {
        const key = `${c.CandidateParty}-${c.CandidatePosition}`;
        if (duplicates.has(key)) {
          duplicates.get(key).push(c);
        } else {
          duplicates.set(key, [c]);
        }
      });

      const dupes = Array.from(duplicates.entries()).filter(
        ([key, vals]) => vals.length > 1
      );
      if (dupes.length > 0) {
        console.log("\n⚠️  DUPLICATE CANDIDATES (Same Party + Position):");
        console.log("==========================================");
        dupes.forEach(([key, vals]) => {
          console.log(`${key}:`);
          vals.forEach((v) =>
            console.log(
              `  - ID ${v.id}: ${v.CandidateName} (District: ${v.District}, Area: ${v.AreaNo})`
            )
          );
        });
      }

      // Check for null BlockchainIds
      const nullIds = candidates.filter((c) => c.BlockchainId === null);
      if (nullIds.length > 0) {
        console.log(
          `\n⚠️  ${nullIds.length} candidate(s) have NULL BlockchainId`
        );
        console.log("   Run: node syncCandidates.js to fix this");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
  }
}

checkData();
