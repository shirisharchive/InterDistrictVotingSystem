const { getContractInstance } = require("./contractInstance");
const { getAccounts } = require("../config/blockchain");

class BlockchainService {
  constructor() {
    this.contractInstance = null;
    this.ownerAccount = null;
  }

  // Initialize contract instance
  async initialize() {
    if (!this.contractInstance) {
      const instance = await getContractInstance();
      this.contractInstance = instance.contract;
      this.contractAddress = instance.address;

      // Get owner account (first account from Ganache)
      const accounts = await getAccounts();
      this.ownerAccount = accounts[0];

      // Get contract owner for verification
      const contractOwner = await this.contractInstance.methods.owner().call();

      console.log(`📋 Blockchain Service Initialized:`);
      console.log(`   Contract Address: ${this.contractAddress}`);
      console.log(`   Using Account: ${this.ownerAccount}`);
      console.log(`   Contract Owner: ${contractOwner}`);

      if (this.ownerAccount.toLowerCase() !== contractOwner.toLowerCase()) {
        console.warn(`⚠️  WARNING: Account mismatch!`);
        console.warn(
          `   The account being used (${this.ownerAccount}) is NOT the contract owner (${contractOwner})`
        );
        console.warn(
          `   Contract operations may fail. Please redeploy the contract or use the owner account.`
        );
      } else {
        console.log(`✅ Account verified as contract owner`);
      }
    }
    return this.contractInstance;
  }

  // ============ Voter Operations ============

  async registerVoter(voterID) {
    await this.initialize();
    try {
      const receipt = await this.contractInstance.methods
        .registerVoter(voterID)
        .send({
          from: this.ownerAccount,
          gas: 300000,
        });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      throw new Error(`Voter registration failed: ${error.message}`);
    }
  }

  async getTotalVoterCount() {
    await this.initialize();
    try {
      const count = await this.contractInstance.methods
        .getTotalVoterCount()
        .call();
      return Number(count);
    } catch (error) {
      throw new Error(`Failed to get voter count: ${error.message}`);
    }
  }

  async isVoterRegistered(voterID) {
    await this.initialize();
    try {
      const isRegistered = await this.contractInstance.methods
        .registeredVoters(voterID)
        .call();
      return isRegistered;
    } catch (error) {
      throw new Error(`Failed to check voter registration: ${error.message}`);
    }
  }

  // ============ Candidate Operations ============

  async addCandidate(
    name,
    party,
    position,
    district,
    areaNo,
    candidatePhotoUrl,
    candidatePartyLogoUrl
  ) {
    await this.initialize();
    try {
      console.log(`🔄 Attempting to add candidate: ${name} (${party})`);
      console.log(`   District: ${district}, Area: ${areaNo}`);
      console.log(`   Using account: ${this.ownerAccount}`);

      // Get current count before adding (this will be the new candidate's ID)
      const currentCount = await this.contractInstance.methods
        .candidateCount()
        .call();

      console.log(`   Current candidate count: ${currentCount}`);

      const receipt = await this.contractInstance.methods
        .addCandidate(
          name,
          party,
          position,
          district,
          areaNo,
          candidatePhotoUrl,
          candidatePartyLogoUrl
        )
        .send({
          from: this.ownerAccount,
          gas: 3000000, // Increased gas limit
        });

      console.log(
        `✅ Candidate added successfully. Transaction: ${receipt.transactionHash}`
      );

      return {
        success: true,
        blockchainId: Number(currentCount), // Return the blockchain ID
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      console.error(`❌ Detailed error:`, error);
      throw new Error(`Candidate registration failed: ${error.message}`);
    }
  }

  async getCandidate(candidateId) {
    await this.initialize();
    try {
      const candidate = await this.contractInstance.methods
        .getCandidate(candidateId)
        .call();

      return {
        name: candidate.name,
        party: candidate.party,
        position: candidate.position,
        district: candidate.district,
        areaNo: Number(candidate.areaNo),
        voteCount: Number(candidate.voteCount),
        candidatePhotoUrl: candidate.candidatePhotoUrl,
        candidatePartyLogoUrl: candidate.candidatePartyLogoUrl,
      };
    } catch (error) {
      throw new Error(`Failed to get candidate: ${error.message}`);
    }
  }

  async getCandidateCount() {
    await this.initialize();
    try {
      const count = await this.contractInstance.methods
        .getCandidateCount()
        .call();
      return Number(count);
    } catch (error) {
      throw new Error(`Failed to get candidate count: ${error.message}`);
    }
  }

  async getAllCandidatesWithResults() {
    await this.initialize();
    try {
      const result = await this.contractInstance.methods
        .getAllCandidatesWithResults()
        .call();

      const candidates = [];
      for (let i = 0; i < result.ids.length; i++) {
        candidates.push({
          id: Number(result.ids[i]),
          name: result.names[i],
          party: result.parties[i],
          position: result.positions[i],
          voteCount: Number(result.voteCounts[i]),
          candidatePhotoUrl: result.photoUrls[i],
          candidatePartyLogoUrl: result.logoUrls[i],
        });
      }

      return candidates;
    } catch (error) {
      throw new Error(`Failed to get all candidates: ${error.message}`);
    }
  }

  // ============ Voting Operations ============

  async vote(voterID, candidateId, voterAddress) {
    await this.initialize();
    try {
      console.log("🔍 Voting with:", {
        voterID,
        candidateId,
        voterAddress: voterAddress || this.ownerAccount,
      });

      const receipt = await this.contractInstance.methods
        .vote(voterID, candidateId)
        .send({
          from: voterAddress || this.ownerAccount,
          gas: 300000,
        });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        events: receipt.events,
      };
    } catch (error) {
      console.error("Blockchain vote error details:", {
        message: error.message,
        data: error.data,
        reason: error.reason,
        innerError: error.innerError,
        code: error.code,
        stack: error.stack?.split("\n").slice(0, 3),
      });

      // Extract the actual revert reason from error
      let errorMessage = error.message;

      // Try to get revert reason from various error properties
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.innerError?.message) {
        errorMessage = error.innerError.message;
      } else if (error.data && typeof error.data === "string") {
        errorMessage = error.data;
      } else if (error.message.includes("revert")) {
        // Extract revert reason from message
        const match = error.message.match(/revert (.+?)"/);
        if (match) errorMessage = match[1];
      }

      // Check for specific error messages
      if (
        errorMessage.includes("You are not registered") ||
        errorMessage.includes("not registered")
      ) {
        throw new Error(
          "Voter is not registered in the blockchain. Please register the voter first in Admin Panel."
        );
      } else if (errorMessage.includes("already voted")) {
        throw new Error("You have already voted for this position");
      } else if (
        errorMessage.includes("Candidate does not exist") ||
        errorMessage.includes("does not exist")
      ) {
        throw new Error(
          "Candidate does not exist in blockchain. Please register the candidate first in Admin Panel."
        );
      }

      throw new Error(`Voting failed: ${errorMessage}`);
    }
  }

  async getTotalVotesCast() {
    await this.initialize();
    try {
      const count = await this.contractInstance.methods
        .getTotalVotesCast()
        .call();
      return Number(count);
    } catch (error) {
      throw new Error(`Failed to get total votes: ${error.message}`);
    }
  }

  // ============ Party Operations ============

  async addParty(partyName, partyLogoUrl, district, areaNo) {
    await this.initialize();
    try {
      // Get current count before adding (this will be the new party's ID)
      const currentCount = await this.contractInstance.methods
        .partyCount()
        .call();

      const receipt = await this.contractInstance.methods
        .addParty(partyName, partyLogoUrl, district, areaNo)
        .send({
          from: this.ownerAccount,
          gas: 500000,
        });

      return {
        success: true,
        blockchainId: Number(currentCount), // Return the blockchain ID
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      console.error("Party registration error details:", {
        message: error.message,
        data: error.data,
        reason: error.reason,
        innerError: error.innerError,
        code: error.code,
      });

      // Extract the actual revert reason from error
      let errorMessage = error.message;

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.innerError?.message) {
        errorMessage = error.innerError.message;
      } else if (error.data && typeof error.data === "string") {
        errorMessage = error.data;
      } else if (error.message.includes("revert")) {
        const match = error.message.match(/revert (.+?)"/);
        if (match) errorMessage = match[1];
      }

      throw new Error(`Party registration failed: ${errorMessage}`);
    }
  }

  async getParty(partyId) {
    await this.initialize();
    try {
      const party = await this.contractInstance.methods
        .getParty(partyId)
        .call();

      return {
        partyName: party.partyName,
        partyLogoUrl: party.partyLogoUrl,
        district: party.district,
        areaNo: Number(party.areaNo),
        voteCount: Number(party.voteCount),
      };
    } catch (error) {
      throw new Error(`Failed to get party: ${error.message}`);
    }
  }

  async getPartyCount() {
    await this.initialize();
    try {
      const count = await this.contractInstance.methods.getPartyCount().call();
      return Number(count);
    } catch (error) {
      throw new Error(`Failed to get party count: ${error.message}`);
    }
  }

  async getAllPartiesWithResults() {
    await this.initialize();
    try {
      const result = await this.contractInstance.methods
        .getAllPartiesWithResults()
        .call();

      const parties = [];
      for (let i = 0; i < result.ids.length; i++) {
        parties.push({
          id: Number(result.ids[i]),
          partyName: result.names[i],
          partyLogoUrl: result.logoUrls[i],
          district: result.districts[i],
          areaNo: Number(result.areaNumbers[i]),
          voteCount: Number(result.voteCounts[i]),
        });
      }

      return parties;
    } catch (error) {
      throw new Error(`Failed to get all parties: ${error.message}`);
    }
  }

  // ============ Indirect Voting (Party Voting) ============

  async voteForParty(voterID, partyId, voterAddress) {
    await this.initialize();
    try {
      const receipt = await this.contractInstance.methods
        .voteForParty(voterID, partyId)
        .send({
          from: voterAddress || this.ownerAccount,
          gas: 300000,
        });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        events: receipt.events,
      };
    } catch (error) {
      console.error("Blockchain party vote error details:", {
        message: error.message,
        data: error.data,
        reason: error.reason,
      });

      // Extract the actual revert reason from error
      let errorMessage = error.message;
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.data && typeof error.data === "string") {
        errorMessage = error.data;
      }

      // Check for specific error messages
      if (
        errorMessage.includes("You are not registered") ||
        errorMessage.includes("not registered")
      ) {
        throw new Error(
          "Voter is not registered in the blockchain. Please register the voter first in Admin Panel."
        );
      } else if (errorMessage.includes("already voted for party")) {
        throw new Error("You have already voted for a party");
      } else if (
        errorMessage.includes("Party does not exist") ||
        errorMessage.includes("does not exist")
      ) {
        throw new Error(
          "Party does not exist in blockchain. Please register the party first in Admin Panel."
        );
      }

      throw new Error(`Party voting failed: ${errorMessage}`);
    }
  }

  async hasVoterVotedForParty(voterID) {
    await this.initialize();
    try {
      const hasVoted = await this.contractInstance.methods
        .hasVoterVotedForParty(voterID)
        .call();
      return hasVoted;
    } catch (error) {
      throw new Error(`Failed to check party vote status: ${error.message}`);
    }
  }

  async getTotalPartyVotesCast() {
    await this.initialize();
    try {
      const count = await this.contractInstance.methods
        .getTotalPartyVotesCast()
        .call();
      return Number(count);
    } catch (error) {
      throw new Error(`Failed to get total party votes: ${error.message}`);
    }
  }

  // ============ Contract Info ============

  async getContractOwner() {
    await this.initialize();
    try {
      const owner = await this.contractInstance.methods.owner().call();
      return owner;
    } catch (error) {
      throw new Error(`Failed to get contract owner: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new BlockchainService();
