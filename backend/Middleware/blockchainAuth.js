const blockchainService = require("../SmartContract/blockchainService");

// Middleware to verify blockchain connection
const verifyBlockchainConnection = async (req, res, next) => {
  try {
    await blockchainService.initialize();
    next();
  } catch (error) {
    console.error("Blockchain connection error:", error);
    res.status(503).json({
      success: false,
      message: "Blockchain service unavailable",
      error: error.message,
    });
  }
};

// Middleware to verify contract owner (admin operations)
const verifyContractOwner = async (req, res, next) => {
  try {
    // Get owner from contract
    const contractOwner = await blockchainService.getContractOwner();

    // You can add additional checks here based on your authentication
    // For now, we just verify the contract has an owner
    if (!contractOwner) {
      return res.status(403).json({
        success: false,
        message: "Contract owner verification failed",
      });
    }

    req.contractOwner = contractOwner;
    next();
  } catch (error) {
    console.error("Owner verification error:", error);
    res.status(500).json({
      success: false,
      message: "Owner verification failed",
      error: error.message,
    });
  }
};

module.exports = {
  verifyBlockchainConnection,
  verifyContractOwner,
};
