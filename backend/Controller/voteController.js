const blockchainService = require("../SmartContract/blockchainService");
const VoteInfo = require("../electionModel/VoteInfo");
const VoterInfo = require("../electionModel/VoterInfo");
const CandidateInfo = require("../electionModel/CandidateInfo");
const CandidateVoteCount = require("../electionModel/CandidateVoteCount");
const { getAccounts } = require("../config/blockchain");

// Helper function to convert BigInt to string for JSON serialization
const serializeBigInt = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
};

// Cast a vote
const castVote = async (req, res) => {
  try {
    const { voter_id, candidate_id, election_area_id } = req.body;

    // Verify voter exists in database
    const voter = await VoterInfo.findByPk(voter_id);
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found in database",
      });
    }

    // Check if voter has already voted
    if (voter.HasVoted === 1) {
      return res.status(403).json({
        success: false,
        message:
          "You have already cast your vote. Each voter can only vote once.",
      });
    }

    // Check if voter is registered in blockchain
    try {
      const isRegistered = await blockchainService.isVoterRegistered(voter_id);
      if (!isRegistered) {
        return res.status(400).json({
          success: false,
          message:
            "Voter is not registered in the blockchain. Please login first to complete registration.",
        });
      }
    } catch (checkError) {
      console.log("Error checking voter registration:", checkError.message);
      // Continue if check fails - let the vote attempt handle it
    }

    // Get voter's blockchain address (use account based on voter_id or default)
    const accounts = await getAccounts();
    const voterAddress = accounts[voter_id % accounts.length] || accounts[1];

    // Get candidate's blockchain ID
    const candidate = await CandidateInfo.findByPk(candidate_id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found in database",
      });
    }

    if (
      candidate.BlockchainId === null ||
      candidate.BlockchainId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate is not registered in blockchain. Please contact admin.",
      });
    }

    // 1. Record vote on blockchain using BlockchainId
    const blockchainResult = await blockchainService.vote(
      voter_id,
      candidate.BlockchainId, // Use blockchain ID instead of database ID
      voterAddress,
    );

    // 2. Save vote record to PostgreSQL database
    const vote = await VoteInfo.create({
      VoterId: voter_id,
      VoterIdString: voter.VoterId, // Store the actual voter ID string
      CandidateId: candidate_id,
      District: req.body.district || "Unknown",
      AreaNo: req.body.area_no || 1,
      VoteTime: new Date(),
    });

    // 3. Update vote count for candidate in this area
    const district = req.body.district || "Unknown";
    const areaNo = req.body.area_no || 1;

    const [voteCount, created] = await CandidateVoteCount.findOrCreate({
      where: {
        CandidateId: candidate_id,
        District: district,
        AreaNo: areaNo,
      },
      defaults: {
        VoteCount: 0,
        LastUpdated: new Date(),
      },
    });

    if (!created) {
      await voteCount.increment("VoteCount");
      await voteCount.update({ LastUpdated: new Date() });
    }

    // 4. Update voter's HasVoted status
    await VoterInfo.update({ HasVoted: 1 }, { where: { id: voter_id } });

    res.status(201).json({
      success: true,
      message: "Vote cast successfully",
      data: {
        vote: vote,
        blockchain: serializeBigInt(blockchainResult),
      },
    });
  } catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get total votes cast
const getTotalVotes = async (req, res) => {
  try {
    const totalVotes = await blockchainService.getTotalVotesCast();

    res.status(200).json({
      success: true,
      totalVotes: totalVotes,
    });
  } catch (error) {
    console.error("Error getting total votes:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get voting results
const getVotingResults = async (req, res) => {
  try {
    const candidates = await blockchainService.getAllCandidatesWithResults();

    // Group by position
    const resultsByPosition = {};
    candidates.forEach((candidate) => {
      if (!resultsByPosition[candidate.position]) {
        resultsByPosition[candidate.position] = [];
      }
      resultsByPosition[candidate.position].push(candidate);
    });

    // Sort candidates by vote count within each position
    for (const position in resultsByPosition) {
      resultsByPosition[position].sort((a, b) => b.voteCount - a.voteCount);
    }

    res.status(200).json({
      success: true,
      data: resultsByPosition,
    });
  } catch (error) {
    console.error("Error getting results:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check if voter has voted (from database)
const checkVoterStatus = async (req, res) => {
  try {
    const { voter_id } = req.params;

    const votes = await VoteInfo.findAll({
      where: { VoterId: voter_id },
    });

    const hasVoted = votes.length > 0;

    res.status(200).json({
      success: true,
      hasVoted: hasVoted,
      votesCount: votes.length,
      votes: votes,
    });
  } catch (error) {
    console.error("Error checking voter status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get vote history from database with detailed information
const getVoteHistory = async (req, res) => {
  try {
    const votes = await VoteInfo.findAll({
      include: [
        {
          model: VoterInfo,
          attributes: ["id", "VoterId", "VoterName", "District", "AreaNo"],
        },
        {
          model: CandidateInfo,
          attributes: [
            "id",
            "CandidateName",
            "CandidateParty",
            "CandidatePosition",
            "District",
            "AreaNo",
          ],
        },
      ],
      order: [["VoteTime", "DESC"]],
      limit: req.query.limit ? parseInt(req.query.limit) : 1000,
    });

    res.status(200).json({
      success: true,
      count: votes.length,
      data: votes,
    });
  } catch (error) {
    console.error("Error getting vote history:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get comprehensive vote report for Election Commission
const getElectionCommissionReport = async (req, res) => {
  try {
    const { district, area_no } = req.query;

    // Build where clause based on filters
    const whereClause = {};
    if (district) whereClause.District = district;
    if (area_no) whereClause.AreaNo = parseInt(area_no);

    const votes = await VoteInfo.findAll({
      where: whereClause,
      include: [
        {
          model: VoterInfo,
          attributes: ["id", "VoterId", "VoterName", "District", "AreaNo"],
        },
        {
          model: CandidateInfo,
          attributes: [
            "id",
            "CandidateName",
            "CandidateParty",
            "CandidatePosition",
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
      candidateId: vote.CandidateInfo?.id || vote.CandidateId,
      candidateName: vote.CandidateInfo?.CandidateName || "Unknown",
      candidateParty: vote.CandidateInfo?.CandidateParty || "Unknown",
      candidatePosition: vote.CandidateInfo?.CandidatePosition || "Unknown",
      district: vote.District,
      areaNo: vote.AreaNo,
      voteTime: vote.VoteTime,
      transactionHash: vote.TransactionHash,
      blockNumber: vote.BlockNumber,
    }));

    // Get vote counts by candidate
    const voteCounts = {};
    formattedData.forEach((vote) => {
      const key = `${vote.candidateName} (${vote.candidateParty})`;
      voteCounts[key] = (voteCounts[key] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      totalVotes: formattedData.length,
      voteCounts: voteCounts,
      votes: formattedData,
    });
  } catch (error) {
    console.error("Error generating election commission report:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get verified votes - only returns votes where BlockchainId matches
const getVerifiedVotes = async (req, res) => {
  try {
    const { district, area_no } = req.query;

    // Build where clause based on filters
    const whereClause = {};
    if (district) whereClause.District = district;
    if (area_no) whereClause.AreaNo = parseInt(area_no);

    // Fetch votes from database with candidate BlockchainId
    const votes = await VoteInfo.findAll({
      where: whereClause,
      include: [
        {
          model: VoterInfo,
          attributes: ["id", "VoterId", "VoterName", "District", "AreaNo"],
        },
        {
          model: CandidateInfo,
          attributes: [
            "id",
            "CandidateName",
            "CandidateParty",
            "CandidatePosition",
            "District",
            "AreaNo",
            "BlockchainId",
          ],
        },
      ],
      order: [["VoteTime", "DESC"]],
    });

    // Filter votes - only include if candidate has BlockchainId
    const verifiedVotes = [];
    const unverifiedVotes = [];

    for (const vote of votes) {
      const candidate = vote.CandidateInfo;

      if (!candidate) {
        unverifiedVotes.push({
          voteId: vote.id,
          reason: "Candidate not found",
        });
        continue;
      }

      // Check if candidate has BlockchainId
      if (
        candidate.BlockchainId === null ||
        candidate.BlockchainId === undefined
      ) {
        unverifiedVotes.push({
          voteId: vote.id,
          candidateId: candidate.id,
          candidateName: candidate.CandidateName,
          reason: "Candidate not registered in blockchain",
        });
        continue;
      }

      // Verify candidate exists in blockchain with the same ID
      try {
        const blockchainCandidate = await blockchainService.getCandidate(
          candidate.BlockchainId,
        );

        // Match candidate name and party
        if (
          blockchainCandidate.name === candidate.CandidateName &&
          blockchainCandidate.party === candidate.CandidateParty
        ) {
          verifiedVotes.push({
            voteId: vote.id,
            voterId: vote.VoterInfo?.VoterId || vote.VoterId,
            voterName: vote.VoterInfo?.VoterName || "Unknown",
            candidateId: candidate.id,
            candidateBlockchainId: candidate.BlockchainId,
            candidateName: candidate.CandidateName,
            candidateParty: candidate.CandidateParty,
            candidatePosition: candidate.CandidatePosition,
            blockchainVoteCount: blockchainCandidate.voteCount,
            district: vote.District,
            areaNo: vote.AreaNo,
            voteTime: vote.VoteTime,
            transactionHash: vote.TransactionHash,
            blockNumber: vote.BlockNumber,
            verified: true,
          });
        } else {
          unverifiedVotes.push({
            voteId: vote.id,
            candidateId: candidate.id,
            candidateName: candidate.CandidateName,
            reason: "Candidate details mismatch with blockchain",
            databaseData: {
              name: candidate.CandidateName,
              party: candidate.CandidateParty,
            },
            blockchainData: {
              name: blockchainCandidate.name,
              party: blockchainCandidate.party,
            },
          });
        }
      } catch (error) {
        unverifiedVotes.push({
          voteId: vote.id,
          candidateId: candidate.id,
          candidateName: candidate.CandidateName,
          reason: `Blockchain verification failed: ${error.message}`,
        });
      }
    }

    res.status(200).json({
      success: true,
      totalVotes: votes.length,
      verifiedVotes: verifiedVotes.length,
      unverifiedVotes: unverifiedVotes.length,
      data: {
        verified: verifiedVotes,
        unverified: unverifiedVotes,
      },
    });
  } catch (error) {
    console.error("Error getting verified votes:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get vote results by district and area from CandidateVoteCount table
const getResultsByArea = async (req, res) => {
  try {
    const { district, area_no } = req.query;

    // Build where clause
    const whereClause = {};
    if (district) whereClause.District = district;
    if (area_no) whereClause.AreaNo = parseInt(area_no);

    // Fetch aggregated results
    const results = await CandidateVoteCount.findAll({
      where: whereClause,
      include: [
        {
          model: CandidateInfo,
          attributes: [
            "id",
            "CandidateName",
            "CandidateParty",
            "CandidatePosition",
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
          candidates: [],
        };
      }

      groupedResults[key].totalVotes += result.VoteCount;
      groupedResults[key].candidates.push({
        candidateId: result.CandidateInfo?.id,
        candidateName: result.CandidateInfo?.CandidateName,
        candidateParty: result.CandidateInfo?.CandidateParty,
        candidatePosition: result.CandidateInfo?.CandidatePosition,
        blockchainId: result.CandidateInfo?.BlockchainId,
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
    console.error("Error getting results by area:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  castVote,
  getTotalVotes,
  getVotingResults,
  checkVoterStatus,
  getVoteHistory,
  getElectionCommissionReport,
  getVerifiedVotes,
  getResultsByArea,
};
