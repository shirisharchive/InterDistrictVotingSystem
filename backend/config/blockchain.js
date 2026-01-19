require("dotenv").config();
const { Web3 } = require("web3");

// Initialize Web3 with Ganache
const web3 = new Web3(process.env.BLOCKCHAIN_URL || "http://localhost:7545");

// Test blockchain connection
const testBlockchainConnection = async () => {
  try {
    const isListening = await web3.eth.net.isListening();
    if (isListening) {
      const networkId = await web3.eth.net.getId();
      const blockNumber = await web3.eth.getBlockNumber();
      console.log("✅ Blockchain connection established successfully.");
      console.log(`   Network ID: ${networkId}`);
      console.log(`   Current Block: ${blockNumber}`);
      return true;
    }
  } catch (error) {
    console.error("❌ Unable to connect to blockchain:", error.message);
    return false;
  }
};

// Get list of accounts
const getAccounts = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    return accounts;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
};

module.exports = {
  web3,
  testBlockchainConnection,
  getAccounts,
};
