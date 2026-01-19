const express = require("express");
const router = express.Router();

// Import controllers
const voterController = require("../Controller/voterController");
const candidateController = require("../Controller/candidateController");
const voteController = require("../Controller/voteController");
const partyController = require("../Controller/partyController");

// Import routes
const adminRoutes = require("./adminRoutes");

// Import middleware
const {
  verifyBlockchainConnection,
  verifyContractOwner,
} = require("../Middleware/blockchainAuth");
const {
  uploadCandidateImage,
  uploadPartyLogo,
} = require("../Middleware/uploadMiddleware");

// Import contract address manager
const contractManager = require("../contractAddressManager");

// Apply blockchain connection middleware to all routes
router.use(verifyBlockchainConnection);

// ============ Voter Routes ============
router.post(
  "/voters/register",
  verifyContractOwner,
  voterController.registerVoter,
);
router.post(
  "/voters/register-with-photo",
  verifyContractOwner,
  voterController.registerVoterWithPhoto,
);
router.get("/voters/count", voterController.getTotalVoterCount);
router.get("/voters/:voter_id", voterController.getVoterById);
router.get("/voters", voterController.getAllVoters);
router.post("/voters/register-face", voterController.registerFaceData);
router.post(
  "/voters/verify-credentials",
  voterController.verifyVoterCredentials,
);
router.post("/voters/verify-face", voterController.verifyVoterFace);
router.get("/voters/can-vote/:voterId", voterController.canVote);

// ============ Candidate Routes ============
router.post(
  "/candidates/register",
  verifyContractOwner,
  (req, res, next) => {
    uploadCandidateImage(req, res, (err) => {
      if (err) {
        console.error("❌ File upload error:", err.message);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      console.log("✅ File upload middleware passed");
      next();
    });
  },
  candidateController.addCandidate,
);
router.post(
  "/candidates/sync-blockchain",
  verifyContractOwner,
  candidateController.syncCandidatesToBlockchain,
);
router.get("/candidates/count", candidateController.getCandidateCount);
router.get(
  "/candidates/results",
  candidateController.getAllCandidatesWithResults,
);
router.get("/candidates/:candidateId", candidateController.getCandidateById);
router.get("/candidates", candidateController.getAllCandidatesFromDB);
// New: Get candidates directly from blockchain (works even if DB is deleted)
router.get(
  "/candidates/blockchain/all",
  candidateController.getAllCandidatesFromBlockchain,
);

// ============ Voting Routes ============
router.post("/vote", voteController.castVote);
router.get("/votes/total", voteController.getTotalVotes);
router.get("/votes/results", voteController.getVotingResults);
router.get("/votes/results/area", voteController.getResultsByArea);
router.get("/votes/history", voteController.getVoteHistory);
router.get("/votes/report", voteController.getElectionCommissionReport);
router.get("/votes/verified", voteController.getVerifiedVotes);
router.get("/votes/status/:voter_id", voteController.checkVoterStatus);

// ============ Party Routes ============
router.post(
  "/parties/register",
  verifyContractOwner,
  (req, res, next) => {
    uploadPartyLogo(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  partyController.addParty,
);
router.get("/parties/count", partyController.getPartyCount);
router.get("/parties/results", partyController.getAllPartiesWithResults);
router.get("/parties/:partyId", partyController.getPartyById);
router.get("/parties", partyController.getAllPartiesFromDB);
// New: Get parties directly from blockchain (works even if DB is deleted)
router.get(
  "/parties/blockchain/all",
  partyController.getAllPartiesFromBlockchain,
);

// ============ Indirect Voting (Party Voting) Routes ============
router.post("/vote/party", partyController.voteForParty);
router.get("/vote/party/total", partyController.getTotalPartyVotes);
router.get("/vote/party/results/area", partyController.getPartyResultsByArea);
router.get("/vote/party/report", partyController.getPartyVoteReport);
router.get(
  "/vote/party/status/:voter_id",
  partyController.checkPartyVoteStatus,
);

// ============ Health Check ============
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Voting System API is running",
    timestamp: new Date().toISOString(),
  });
});

// ============ Contract Address Management ============
router.get("/contract/address", async (req, res) => {
  try {
    const verification = await contractManager.verifyContractAddress();
    res.status(200).json({
      success: true,
      ...verification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/contract/verify", async (req, res) => {
  try {
    const result = await contractManager.verifyContractAddress();

    if (result.matches === false) {
      res.status(409).json({
        success: false,
        message: "Contract address mismatch - database may be out of sync",
        ...result,
        recommendation: "Run recovery script or reset database",
      });
    } else if (result.matches === null) {
      res.status(200).json({
        success: true,
        message: "No previous contract address saved",
        ...result,
        recommendation: "Save current contract address",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Contract address verified successfully",
        ...result,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/contract/address/save", verifyContractOwner, async (req, res) => {
  try {
    const result = await contractManager.saveCurrentContractAddress();
    res.status(200).json({
      success: true,
      message: "Contract address saved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============ Admin Routes ============
router.use("/admin", adminRoutes);

module.exports = router;
