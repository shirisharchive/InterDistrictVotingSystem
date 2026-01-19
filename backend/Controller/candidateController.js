const blockchainService = require("../SmartContract/blockchainService");
const CandidateInfo = require("../electionModel/CandidateInfo");

// Helper function to convert BigInt to string for JSON serialization
const serializeBigInt = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
};

// Add a new candidate (both in DB and blockchain)
const addCandidate = async (req, res) => {
  try {
    console.log("📝 Candidate registration request received");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const candidateData = req.body;

    // Handle file uploads if present
    let candidatePhotoUrl = candidateData.candidate_photo_url || "";
    let partyLogoUrl = candidateData.candidate_party_logo_url || "";

    if (req.files) {
      if (req.files.candidate_photo) {
        candidatePhotoUrl = `/uploads/candidates/${req.files.candidate_photo[0].filename}`;
      }
      if (req.files.party_logo) {
        partyLogoUrl = `/uploads/parties/${req.files.party_logo[0].filename}`;
      }
    }

    //todo:Encrypt the candidate data before saving to DB

    // Prepare data for database - Map frontend field names to database column names
    const dbData = {
      CandidateName: candidateData.candidate_name,
      CandidateParty: candidateData.party_name,
      CandidatePosition: candidateData.position,
      CandidateImage: candidatePhotoUrl,
      CandidateElectionLogo: partyLogoUrl,
      District: candidateData.District,
      AreaNo: parseInt(candidateData.AreaNo),
    };

    // 1. First, register candidate on blockchain (MANDATORY)
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.addCandidate(
        candidateData.candidate_name,
        candidateData.party_name,
        candidateData.position,
        candidateData.District,
        parseInt(candidateData.AreaNo),
        candidatePhotoUrl,
        partyLogoUrl,
      );
      console.log(
        `✅ Candidate registered on blockchain with ID: ${blockchainResult.blockchainId}`,
      );
    } catch (blockchainErr) {
      console.error(
        "❌ Blockchain registration failed:",
        blockchainErr.message,
      );
      throw new Error(
        `Blockchain registration failed: ${blockchainErr.message}. Please ensure Ganache is running on http://localhost:7545`,
      );
    }

    // 2. Only save to database if blockchain registration succeeded
    dbData.BlockchainId = blockchainResult.blockchainId;
    const candidate = await CandidateInfo.create(dbData);

    console.log(
      `✅ Candidate ${candidate.id} saved to database with BlockchainId: ${blockchainResult.blockchainId}`,
    );

    res.status(201).json({
      success: true,
      message:
        "Candidate registered successfully on both blockchain and database",
      data: {
        candidate: candidate,
        blockchain: serializeBigInt(blockchainResult),
      },
    });
  } catch (error) {
    console.error("Error registering candidate:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get candidate by blockchain ID
const getCandidateById = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await blockchainService.getCandidate(
      parseInt(candidateId),
    );

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    console.error("Error getting candidate:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get total candidate count
const getCandidateCount = async (req, res) => {
  try {
    const count = await blockchainService.getCandidateCount();

    res.status(200).json({
      success: true,
      totalCandidates: count,
    });
  } catch (error) {
    console.error("Error getting candidate count:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all candidates with vote counts
const getAllCandidatesWithResults = async (req, res) => {
  try {
    // Get candidates from blockchain with vote counts
    const blockchainCandidates =
      await blockchainService.getAllCandidatesWithResults();

    // Get candidates from database with District and AreaNo
    const dbCandidates = await CandidateInfo.findAll();

    // Merge blockchain data with database data
    const candidatesWithFullInfo = blockchainCandidates.map((bcCandidate) => {
      // Find matching database candidate by BlockchainId
      const dbCandidate = dbCandidates.find(
        (db) => db.BlockchainId === bcCandidate.id,
      );

      return {
        ...bcCandidate,
        district: dbCandidate?.District || "N/A",
        areaNo: dbCandidate?.AreaNo || "N/A",
        dbId: dbCandidate?.id,
      };
    });

    res.status(200).json({
      success: true,
      count: candidatesWithFullInfo.length,
      data: candidatesWithFullInfo,
    });
  } catch (error) {
    console.error("Error getting candidates:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all candidates from database
const getAllCandidatesFromDB = async (req, res) => {
  try {
    const candidates = await CandidateInfo.findAll();

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    console.error("Error getting candidates:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Sync candidates to blockchain (assign BlockchainId to candidates that don't have it)
const syncCandidatesToBlockchain = async (req, res) => {
  try {
    // Find all candidates without blockchain IDs
    const candidatesWithoutBlockchainId = await CandidateInfo.findAll({
      where: {
        BlockchainId: null,
      },
    });

    if (candidatesWithoutBlockchainId.length === 0) {
      return res.status(200).json({
        success: true,
        message: "All candidates are already synced to blockchain",
        synced: 0,
      });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const candidate of candidatesWithoutBlockchainId) {
      try {
        const blockchainResult = await blockchainService.addCandidate(
          candidate.CandidateName,
          candidate.CandidateParty,
          candidate.CandidatePosition,
          candidate.CandidateImage || "",
          candidate.CandidateElectionLogo || "",
        );

        await candidate.update({ BlockchainId: blockchainResult.blockchainId });

        results.push({
          candidateId: candidate.id,
          name: candidate.CandidateName,
          blockchainId: blockchainResult.blockchainId,
          success: true,
        });
        successCount++;

        console.log(
          `✅ Synced candidate ${candidate.id} to blockchain with ID: ${blockchainResult.blockchainId}`,
        );
      } catch (error) {
        results.push({
          candidateId: candidate.id,
          name: candidate.CandidateName,
          success: false,
          error: error.message,
        });
        failCount++;

        console.error(
          `❌ Failed to sync candidate ${candidate.id}:`,
          error.message,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced ${successCount} candidate(s) to blockchain. ${failCount} failed.`,
      synced: successCount,
      failed: failCount,
      results: results,
    });
  } catch (error) {
    console.error("Error syncing candidates to blockchain:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all candidates from blockchain only (no database)
const getAllCandidatesFromBlockchain = async (req, res) => {
  try {
    console.log("📡 Fetching candidates directly from blockchain...");

    // Get candidates from blockchain only
    const blockchainCandidates =
      await blockchainService.getAllCandidatesWithResults();

    res.status(200).json({
      success: true,
      count: blockchainCandidates.length,
      data: blockchainCandidates,
      source: "blockchain",
      message: "Data fetched directly from blockchain",
    });
  } catch (error) {
    console.error("Error getting candidates from blockchain:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addCandidate,
  getCandidateById,
  getCandidateCount,
  getAllCandidatesWithResults,
  getAllCandidatesFromDB,
  getAllCandidatesFromBlockchain,
  syncCandidatesToBlockchain,
};
