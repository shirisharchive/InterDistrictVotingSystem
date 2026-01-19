const blockchainService = require("../SmartContract/blockchainService");
const PartyInfo = require("../electionModel/PartyInfo");
const IndirectVoteInfo = require("../electionModel/IndirectVoteInfo");
const PartyVoteCount = require("../electionModel/PartyVoteCount");
const { getAccounts } = require("../config/blockchain");

// Helper function to convert BigInt to string for JSON serialization
const serializeBigInt = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

// Add a new political party (both in DB and blockchain)
const addParty = async (req, res) => {
  try {
    const partyData = req.body;

    // Handle file upload if present
    let partyLogoUrl = partyData.party_logo_url || "";
    if (req.file) {
      partyLogoUrl = `/uploads/parties/${req.file.filename}`;
    }

    // Prepare data for database - Map frontend field names to database column names
    const dbData = {
      PartyName: partyData.party_name,
      PartyLogo: partyLogoUrl,
      District: partyData.District,
      AreaNo: parseInt(partyData.AreaNo),
    };

    // 1. First, register party on blockchain (MANDATORY)
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.addParty(
        partyData.party_name,
        partyLogoUrl,
        partyData.District,
        parseInt(partyData.AreaNo)
      );
      console.log(
        `✅ Party registered on blockchain with ID: ${blockchainResult.blockchainId}`
      );
    } catch (blockchainErr) {
      console.error(
        "❌ Blockchain registration failed:",
        blockchainErr.message
      );
      throw new Error(
        `Blockchain registration failed: ${blockchainErr.message}. Please ensure Ganache is running on http://localhost:7545`
      );
    }

    // 2. Only save to database if blockchain registration succeeded
    dbData.BlockchainId = blockchainResult.blockchainId;
    const party = await PartyInfo.create(dbData);

    console.log(
      `✅ Party ${party.id} saved to database with BlockchainId: ${blockchainResult.blockchainId}`
    );

    res.status(201).json({
      success: true,
      message: "Party registered successfully on both blockchain and database",
      data: {
        party: party,
        blockchain: serializeBigInt(blockchainResult),
      },
    });
  } catch (error) {
    console.error("Error registering party:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get party by blockchain ID
const getPartyById = async (req, res) => {
  try {
    const { partyId } = req.params;

    const party = await blockchainService.getParty(parseInt(partyId));

    res.status(200).json({
      success: true,
      data: party,
    });
  } catch (error) {
    console.error("Error getting party:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get total party count
const getPartyCount = async (req, res) => {
  try {
    const count = await blockchainService.getPartyCount();

    res.status(200).json({
      success: true,
      totalParties: count,
    });
  } catch (error) {
    console.error("Error getting party count:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all parties with vote counts
const getAllPartiesWithResults = async (req, res) => {
  try {
    const parties = await blockchainService.getAllPartiesWithResults();

    res.status(200).json({
      success: true,
      count: parties.length,
      data: parties,
    });
  } catch (error) {
    console.error("Error getting parties:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all parties from database
const getAllPartiesFromDB = async (req, res) => {
  try {
    const parties = await PartyInfo.findAll();

    res.status(200).json({
      success: true,
      count: parties.length,
      data: parties,
    });
  } catch (error) {
    console.error("Error getting parties:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cast an indirect vote for a party
const voteForParty = async (req, res) => {
  try {
    const { voter_id, party_id, election_area_id } = req.body;

    // Check if voter has already voted for a party
    const hasVoted = await blockchainService.hasVoterVotedForParty(voter_id);
    if (hasVoted) {
      return res.status(400).json({
        success: false,
        message: "You have already voted for a party",
      });
    }

    // Check if voter is registered in blockchain
    try {
      const isRegistered = await blockchainService.isVoterRegistered(voter_id);
      if (!isRegistered) {
        return res.status(400).json({
          success: false,
          message:
            "Voter is not registered in the blockchain. Please contact admin to register you first.",
        });
      }
    } catch (checkError) {
      console.log("Error checking voter registration:", checkError.message);
      // Continue if check fails - let the vote attempt handle it
    }

    // Get voter's blockchain address
    const accounts = await getAccounts();
    const voterAddress = accounts[voter_id % accounts.length] || accounts[1];

    // Get party's blockchain ID
    const party = await PartyInfo.findByPk(party_id);
    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found in database",
      });
    }

    if (party.BlockchainId === null || party.BlockchainId === undefined) {
      return res.status(400).json({
        success: false,
        message: "Party is not registered in blockchain. Please contact admin.",
      });
    }

    // 1. Record party vote on blockchain using BlockchainId
    const blockchainResult = await blockchainService.voteForParty(
      voter_id,
      party.BlockchainId, // Use blockchain ID instead of database ID
      voterAddress
    );

    // 2. Save indirect vote record to PostgreSQL database
    const indirectVote = await IndirectVoteInfo.create({
      VoterId: voter_id,
      PartyId: party_id,
      District: req.body.district || "Unknown",
      AreaNo: req.body.area_no || 1,
      VoteTime: new Date(),
      TransactionHash: blockchainResult.transactionHash,
      BlockNumber: blockchainResult.blockNumber,
    });

    // 3. Update vote count for party in this area
    const district = req.body.district || "Unknown";
    const areaNo = req.body.area_no || 1;

    const [partyVoteCount, created] = await PartyVoteCount.findOrCreate({
      where: {
        PartyId: party_id,
        District: district,
        AreaNo: areaNo,
      },
      defaults: {
        VoteCount: 1,
        LastUpdated: new Date(),
      },
    });

    if (!created) {
      await partyVoteCount.increment("VoteCount");
      await partyVoteCount.update({ LastUpdated: new Date() });
    }

    res.status(201).json({
      success: true,
      message: "Party vote cast successfully",
      data: {
        indirectVote: indirectVote,
        blockchain: serializeBigInt(blockchainResult),
      },
    });
  } catch (error) {
    console.error("Error casting party vote:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check if voter has voted for a party
const checkPartyVoteStatus = async (req, res) => {
  try {
    const { voter_id } = req.params;

    // Check blockchain
    const hasVotedBlockchain = await blockchainService.hasVoterVotedForParty(
      parseInt(voter_id)
    );

    // Check database
    const indirectVotes = await IndirectVoteInfo.findAll({
      where: { VoterId: voter_id },
    });

    res.status(200).json({
      success: true,
      hasVoted: hasVotedBlockchain,
      votesCount: indirectVotes.length,
      votes: indirectVotes,
    });
  } catch (error) {
    console.error("Error checking party vote status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get total party votes cast
const getTotalPartyVotes = async (req, res) => {
  try {
    const totalVotes = await blockchainService.getTotalPartyVotesCast();

    res.status(200).json({
      success: true,
      totalPartyVotes: totalVotes,
    });
  } catch (error) {
    console.error("Error getting total party votes:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get comprehensive party vote report for Election Commission
const getPartyVoteReport = async (req, res) => {
  try {
    const { district, area_no } = req.query;

    // Build where clause based on filters
    const whereClause = {};
    if (district) whereClause.District = district;
    if (area_no) whereClause.AreaNo = parseInt(area_no);

    const votes = await IndirectVoteInfo.findAll({
      where: whereClause,
      include: [
        {
          model: VoterInfo,
          attributes: ["id", "voter_id", "full_name", "District", "AreaNo"],
        },
        {
          model: PartyInfo,
          attributes: [
            "id",
            "PartyName",
            "PartyLogo",
            "District",
            "AreaNo",
            "BlockchainId",
          ],
        },
      ],
      order: [["VoteTime", "DESC"]],
    });

    // Format the data for election commission
    const formattedData = votes.map((vote) => ({
      voteId: vote.id,
      voterId: vote.VoterInfo?.voter_id || vote.VoterId,
      voterName: vote.VoterInfo?.full_name || "Unknown",
      partyId: vote.PartyInfo?.id || vote.PartyId,
      partyName: vote.PartyInfo?.PartyName || "Unknown",
      district: vote.District,
      areaNo: vote.AreaNo,
      voteTime: vote.VoteTime,
      transactionHash: vote.TransactionHash,
      blockNumber: vote.BlockNumber,
    }));

    // Get vote counts by party
    const voteCounts = {};
    formattedData.forEach((vote) => {
      const key = vote.partyName;
      voteCounts[key] = (voteCounts[key] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      totalVotes: formattedData.length,
      voteCounts: voteCounts,
      votes: formattedData,
    });
  } catch (error) {
    console.error("Error generating party vote report:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get party vote results by district and area from PartyVoteCount table
const getPartyResultsByArea = async (req, res) => {
  try {
    const { district, area_no } = req.query;

    // Build where clause
    const whereClause = {};
    if (district) whereClause.District = district;
    if (area_no) whereClause.AreaNo = parseInt(area_no);

    // Fetch aggregated results
    const results = await PartyVoteCount.findAll({
      where: whereClause,
      include: [
        {
          model: PartyInfo,
          attributes: [
            "id",
            "PartyName",
            "PartyAbbreviation",
            "District",
            "AreaNo",
            "BlockchainId",
          ],
        },
      ],
      order: [["VoteCount", "DESC"]],
    });

    // Group by district and area
    const groupedResults = {};
    results.forEach((result) => {
      const key = `${result.District}-${result.AreaNo}`;
      if (!groupedResults[key]) {
        groupedResults[key] = {
          district: result.District,
          areaNo: result.AreaNo,
          totalVotes: 0,
          parties: [],
        };
      }

      groupedResults[key].totalVotes += result.VoteCount;
      groupedResults[key].parties.push({
        partyId: result.PartyInfo?.id,
        partyName: result.PartyInfo?.PartyName,
        partyAbbreviation: result.PartyInfo?.PartyAbbreviation,
        blockchainId: result.PartyInfo?.BlockchainId,
        voteCount: result.VoteCount,
        lastUpdated: result.LastUpdated,
      });
    });

    res.status(200).json({
      success: true,
      totalAreas: Object.keys(groupedResults).length,
      data: Object.values(groupedResults),
    });
  } catch (error) {
    console.error("Error getting party results by area:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all parties from blockchain only (no database)
const getAllPartiesFromBlockchain = async (req, res) => {
  try {
    console.log("📡 Fetching parties directly from blockchain...");

    // Get parties from blockchain only
    const blockchainParties =
      await blockchainService.getAllPartiesWithResults();

    res.status(200).json({
      success: true,
      count: blockchainParties.length,
      data: blockchainParties,
      source: "blockchain",
      message: "Data fetched directly from blockchain",
    });
  } catch (error) {
    console.error("Error getting parties from blockchain:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addParty,
  getPartyById,
  getPartyCount,
  getAllPartiesWithResults,
  getAllPartiesFromDB,
  getAllPartiesFromBlockchain,
  voteForParty,
  checkPartyVoteStatus,
  getTotalPartyVotes,
  getPartyVoteReport,
  getPartyResultsByArea,
};
