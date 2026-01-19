const blockchainService = require("../SmartContract/blockchainService");
const VoterInfo = require("../electionModel/VoterInfo");
const fs = require("fs");
const path = require("path");

// Helper function to convert BigInt to string for JSON serialization
const serializeBigInt = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
};

// Helper function to save photo file and return path
const saveVoterPhoto = (photoBase64, voterId) => {
  try {
    const uploadsDir = path.join(__dirname, "..", "uploads", "voters");

    // Create uploads/voters directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");

    // Determine file extension based on MIME type or use jpg as default
    let extension = "jpg";
    if (photoBase64.includes("image/png")) {
      extension = "png";
    } else if (photoBase64.includes("image/webp")) {
      extension = "webp";
    }

    const filename = `voter_${voterId}_${Date.now()}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));

    // Return relative path for database
    return `/uploads/voters/${filename}`;
  } catch (error) {
    console.error("Error saving voter photo:", error);
    throw error;
  }
};

// Register a new voter (database only - blockchain registration happens on login)
const registerVoter = async (req, res) => {
  try {
    const voterData = req.body;

    // 1. Save voter to PostgreSQL database only
    const voter = await VoterInfo.create(voterData);

    // Note: Blockchain registration will happen automatically when voter logs in
    // after biometric verification. This keeps admin registration fast.

    res.status(201).json({
      success: true,
      message: "Voter registered successfully in database",
      data: {
        voter: voter,
      },
    });
  } catch (error) {
    console.error("Error registering voter:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get total voter count from blockchain
const getTotalVoterCount = async (req, res) => {
  try {
    const count = await blockchainService.getTotalVoterCount();

    res.status(200).json({
      success: true,
      totalVoters: count,
    });
  } catch (error) {
    console.error("Error getting voter count:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get voter details from database
const getVoterById = async (req, res) => {
  try {
    const { voter_id } = req.params;

    const voter = await VoterInfo.findOne({
      where: { voter_id: voter_id },
    });

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found",
      });
    }

    res.status(200).json({
      success: true,
      data: voter,
    });
  } catch (error) {
    console.error("Error getting voter:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all voters from database
const getAllVoters = async (req, res) => {
  try {
    const voters = await VoterInfo.findAll();

    res.status(200).json({
      success: true,
      count: voters.length,
      data: voters,
    });
  } catch (error) {
    console.error("Error getting voters:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Register face data for a voter
const registerFaceData = async (req, res) => {
  try {
    const { voterId, faceData } = req.body;

    if (!voterId || !faceData) {
      return res.status(400).json({
        success: false,
        message: "Voter ID and face data are required",
      });
    }

    // Find voter by VoterId
    const voter = await VoterInfo.findOne({
      where: { VoterId: voterId },
    });

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found",
      });
    }

    // Update face data
    await voter.update({
      FaceData: faceData,
      FaceRegisteredAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Face data registered successfully",
      data: {
        voterId: voter.VoterId,
        voterName: voter.VoterName,
        faceRegisteredAt: voter.FaceRegisteredAt,
      },
    });
  } catch (error) {
    console.error("Error registering face data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify voter by DOB and VoterId after face recognition
const verifyVoterCredentials = async (req, res) => {
  try {
    const { voterId, dob, faceVerified } = req.body;

    if (!voterId || !dob) {
      return res.status(400).json({
        success: false,
        message: "Voter ID and Date of Birth are required",
      });
    }

    if (!faceVerified) {
      return res.status(403).json({
        success: false,
        message: "Face verification required before login",
      });
    }

    // Find voter
    const voter = await VoterInfo.findOne({
      where: {
        VoterId: voterId,
        DateOfBirth: dob,
      },
    });

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if already voted - prevent login if already participated
    if (voter.HasVoted === 1) {
      return res.status(403).json({
        success: false,
        message:
          "You have already participated in this election and cannot vote again",
      });
    }

    // Register voter to blockchain on successful login (if not already registered)
    try {
      const isRegistered = await blockchainService.isVoterRegistered(voter.id);

      if (!isRegistered) {
        console.log(`Registering voter ${voter.id} to blockchain on login...`);
        const blockchainResult = await blockchainService.registerVoter(
          voter.id,
        );
        console.log(
          `✅ Voter ${voter.id} successfully registered to blockchain:`,
          blockchainResult,
        );
      } else {
        console.log(`Voter ${voter.id} already registered on blockchain`);
      }
    } catch (blockchainError) {
      console.error(
        `⚠️ Blockchain registration error for voter ${voter.id}:`,
        blockchainError.message,
      );
      // Don't block login if blockchain registration fails - voter can still proceed
      // This allows for error recovery scenarios
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: voter.id,
        voterId: voter.VoterId,
        voterName: voter.VoterName,
        district: voter.District,
        areaNo: voter.AreaNo,
      },
    });
  } catch (error) {
    console.error("Error verifying voter:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Register voter with photo and automatically generate face encoding
const registerVoterWithPhoto = async (req, res) => {
  try {
    const { VoterName, VoterId, DateOfBirth, District, AreaNo, photo } =
      req.body;

    if (!photo) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    // 1. Send photo to face recognition API to generate encoding (REQUIRED)
    const axios = require("axios");
    let faceApiResponse;

    try {
      faceApiResponse = await axios.post(
        "http://localhost:5001/api/face-recognition/register",
        {
          image: photo,
        },
        {
          timeout: 30000, // 30 second timeout
        },
      );
    } catch (faceApiError) {
      // Check if it's a network/connection error (API down)
      if (
        faceApiError.code === "ECONNREFUSED" ||
        faceApiError.code === "ETIMEDOUT" ||
        !faceApiError.response
      ) {
        console.error(
          "❌ Face recognition API unavailable:",
          faceApiError.message,
        );
        return res.status(400).json({
          success: false,
          message:
            "Face recognition service unavailable. Please ensure the face recognition API is running.",
        });
      }

      // It's an HTTP error response from the API (e.g., 400 for no face detected)
      // Let it continue to check the response below
      faceApiResponse = faceApiError.response;
    }

    // Check if face was detected successfully
    if (!faceApiResponse.data.success) {
      console.error("❌ Face detection failed:", faceApiResponse.data.message);
      return res.status(400).json({
        success: false,
        message:
          faceApiResponse.data.message ||
          "No face detected in the image. Please upload a clear photo showing your face directly facing the camera with good lighting.",
      });
    }

    // 2. Get the face encoding from the response
    const faceEncoding = faceApiResponse.data.faceEncoding;

    if (!faceEncoding) {
      return res.status(400).json({
        success: false,
        message:
          "Failed to generate face encoding. Please try again with a clearer photo.",
      });
    }

    console.log("✅ Face encoding generated successfully");

    // 3. Save voter photo file
    const photoPath = saveVoterPhoto(photo, VoterId);

    // 4. Save voter to PostgreSQL database with face data and photo path
    const voter = await VoterInfo.create({
      VoterName,
      VoterId,
      DateOfBirth,
      District,
      AreaNo,
      HasVoted: 0,
      FaceData: faceEncoding,
      FaceRegisteredAt: new Date(),
      PhotoPath: photoPath,
    });

    // Note: Blockchain registration will happen automatically when voter logs in
    // after biometric verification. This keeps admin registration fast.

    res.status(201).json({
      success: true,
      message: "Voter registered successfully with face data",
      data: {
        voter: voter,
      },
    });
  } catch (error) {
    console.error("Error registering voter with photo:", error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

// Verify voter face and set IsFaceMatched flag
const verifyVoterFace = async (req, res) => {
  try {
    const { voterId, dob, photo } = req.body;

    if (!voterId || !dob) {
      return res.status(400).json({
        success: false,
        message: "Voter ID and Date of Birth are required",
      });
    }

    if (!photo) {
      return res.status(400).json({
        success: false,
        message: "Photo is required for face verification",
      });
    }

    // Find voter
    const voter = await VoterInfo.findOne({
      where: {
        VoterId: voterId,
        DateOfBirth: dob,
      },
    });

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found with given credentials",
      });
    }

    // Check if already voted
    if (voter.HasVoted === 1) {
      return res.status(403).json({
        success: false,
        message: "You have already voted. Voting is not allowed twice.",
      });
    }

    // Send photo to face recognition API for verification
    const axios = require("axios");
    const faceApiResponse = await axios.post(
      "http://localhost:5001/api/face-recognition/verify",
      {
        image: photo,
        storedEncoding: voter.FaceData,
      },
    );

    if (!faceApiResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: "Face verification failed: " + faceApiResponse.data.message,
      });
    }

    // Face matched successfully - set IsFaceMatched = 1
    await voter.update({
      IsFaceMatched: 1,
      FaceVerifiedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Face verification successful",
      data: {
        id: voter.id,
        voterId: voter.VoterId,
        voterName: voter.VoterName,
        district: voter.District,
        areaNo: voter.AreaNo,
        isFaceMatched: voter.IsFaceMatched,
      },
    });
  } catch (error) {
    console.error("Error verifying voter face:", error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

// Check if voter can vote (must have face matched)
const canVote = async (req, res) => {
  try {
    const { voterId } = req.params;

    const voter = await VoterInfo.findOne({
      where: { VoterId: voterId },
    });

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found",
      });
    }

    // Check IsFaceMatched flag
    if (voter.IsFaceMatched === 0) {
      return res.status(403).json({
        success: false,
        message: "Face verification required before voting",
        canVote: false,
      });
    }

    // Check if already voted
    if (voter.HasVoted === 1) {
      return res.status(403).json({
        success: false,
        message: "You have already voted",
        canVote: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Voter is eligible to vote",
      canVote: true,
      data: {
        voterId: voter.VoterId,
        voterName: voter.VoterName,
        isFaceMatched: voter.IsFaceMatched,
        hasVoted: voter.HasVoted,
      },
    });
  } catch (error) {
    console.error("Error checking voting eligibility:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerVoter,
  getTotalVoterCount,
  getVoterById,
  getAllVoters,
  registerFaceData,
  verifyVoterCredentials,
  registerVoterWithPhoto,
  verifyVoterFace,
  canVote,
};
