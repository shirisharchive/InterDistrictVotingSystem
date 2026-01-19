const { web3 } = require("../config/blockchain");
const VotingContract = require("../../Contract/build/contracts/Voting.json");

// Get network ID and contract address
const getContractInstance = async () => {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = VotingContract.networks[networkId];

    if (!deployedNetwork) {
      throw new Error(`Contract not deployed on network ${networkId}`);
    }

    const contractAddress = deployedNetwork.address;
    const contractABI = VotingContract.abi;

    // Create contract instance
    const votingContract = new web3.eth.Contract(contractABI, contractAddress);

    return {
      contract: votingContract,
      address: contractAddress,
      networkId: networkId,
    };
  } catch (error) {
    console.error("Error creating contract instance:", error);
    throw error;
  }
};

module.exports = { getContractInstance };
