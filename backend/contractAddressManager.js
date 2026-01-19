require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { web3 } = require("./config/blockchain");
const VotingContract = require("../Contract/build/contracts/Voting.json");

/**
 * Verify and manage contract address
 * This utility helps track which contract address is currently being used
 */

const CONTRACT_ADDRESS_FILE = path.join(
  __dirname,
  "current_contract_address.json"
);

/**
 * Save current contract address to file
 */
async function saveCurrentContractAddress() {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = VotingContract.networks[networkId];

    if (!deployedNetwork) {
      throw new Error(`Contract not deployed on network ${networkId}`);
    }

    const contractData = {
      address: deployedNetwork.address,
      networkId: networkId.toString(), // Convert BigInt to string
      savedAt: new Date().toISOString(),
      blockchainUrl: process.env.BLOCKCHAIN_URL || "http://localhost:7545",
    };

    fs.writeFileSync(
      CONTRACT_ADDRESS_FILE,
      JSON.stringify(contractData, null, 2)
    );

    console.log("✅ Contract address saved:");
    console.log(JSON.stringify(contractData, null, 2));

    return contractData;
  } catch (error) {
    console.error("Error saving contract address:", error);
    throw error;
  }
}

/**
 * Load saved contract address
 */
function loadSavedContractAddress() {
  try {
    if (fs.existsSync(CONTRACT_ADDRESS_FILE)) {
      const data = fs.readFileSync(CONTRACT_ADDRESS_FILE, "utf8");
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Error loading saved contract address:", error);
    return null;
  }
}

/**
 * Verify if current contract matches saved contract
 */
async function verifyContractAddress() {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = VotingContract.networks[networkId];

    if (!deployedNetwork) {
      throw new Error(`Contract not deployed on network ${networkId}`);
    }

    const currentAddress = deployedNetwork.address;
    const savedData = loadSavedContractAddress();

    console.log("\n🔍 Contract Address Verification\n");
    console.log("Current Contract Address:", currentAddress);
    console.log("Current Network ID:", networkId);

    if (savedData) {
      console.log("\nSaved Contract Address:", savedData.address);
      console.log("Saved Network ID:", savedData.networkId);
      console.log("Saved At:", savedData.savedAt);

      if (
        currentAddress.toLowerCase() === savedData.address.toLowerCase() &&
        networkId.toString() === savedData.networkId.toString()
      ) {
        console.log("\n✅ Contract address MATCHES - Data is consistent");
        return {
          matches: true,
          current: currentAddress,
          saved: savedData.address,
        };
      } else {
        console.log(
          "\n⚠️  WARNING: Contract address MISMATCH - Database may be out of sync!"
        );
        console.log(
          "   This means the blockchain has been redeployed or you're using a different network."
        );
        console.log(
          "   Your database data may not match the current blockchain state."
        );
        console.log("\n💡 Recommended Actions:");
        console.log(
          "   1. Run 'node recoverFromBlockchain.js' to restore data from blockchain"
        );
        console.log(
          "   2. Or run 'node resetAndSyncDatabase.js' to reset and sync fresh"
        );
        console.log(
          "   3. Or update contract address: node contractAddressManager.js --save"
        );
        return {
          matches: false,
          current: currentAddress,
          saved: savedData.address,
        };
      }
    } else {
      console.log("\n⚠️  No saved contract address found");
      console.log("   This is the first time running or the file was deleted");
      console.log(
        "\n💡 Run 'node contractAddressManager.js --save' to save current address"
      );
      return { matches: null, current: currentAddress, saved: null };
    }
  } catch (error) {
    console.error("Error verifying contract address:", error);
    throw error;
  }
}

/**
 * Delete saved contract address
 */
function deleteSavedContractAddress() {
  try {
    if (fs.existsSync(CONTRACT_ADDRESS_FILE)) {
      fs.unlinkSync(CONTRACT_ADDRESS_FILE);
      console.log("✅ Saved contract address deleted");
      return true;
    } else {
      console.log("ℹ️  No saved contract address file found");
      return false;
    }
  } catch (error) {
    console.error("Error deleting contract address file:", error);
    throw error;
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case "--save":
      case "-s":
        await saveCurrentContractAddress();
        break;

      case "--verify":
      case "-v":
        await verifyContractAddress();
        break;

      case "--load":
      case "-l":
        const saved = loadSavedContractAddress();
        if (saved) {
          console.log("📋 Saved Contract Data:");
          console.log(JSON.stringify(saved, null, 2));
        } else {
          console.log("ℹ️  No saved contract address found");
        }
        break;

      case "--delete":
      case "-d":
        deleteSavedContractAddress();
        break;

      case "--help":
      case "-h":
      default:
        console.log("\n📘 Contract Address Manager\n");
        console.log("Commands:");
        console.log("  --save, -s      Save current contract address");
        console.log("  --verify, -v    Verify current vs saved address");
        console.log("  --load, -l      Load and display saved address");
        console.log("  --delete, -d    Delete saved address file");
        console.log("  --help, -h      Show this help message");
        console.log("\nExamples:");
        console.log("  node contractAddressManager.js --save");
        console.log("  node contractAddressManager.js --verify");
        break;
    }

    if (command && command !== "--help" && command !== "-h") {
      process.exit(0);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  saveCurrentContractAddress,
  loadSavedContractAddress,
  verifyContractAddress,
  deleteSavedContractAddress,
};
