const express = require("express");
const router = express.Router();
const adminController = require("../Controller/adminController");
const voterController = require("../Controller/voterController");
const candidateController = require("../Controller/candidateController");
const {
  verifyAdminAuth,
  verifyDistrictAccess,
  verifySuperAdmin,
} = require("../Middleware/adminAuth");
const { uploadCandidateImage } = require("../Middleware/uploadMiddleware");

/**
 * Public Routes (No authentication required)
 */

// Admin login
router.post("/login", adminController.adminLogin);

/**
 * Protected Routes (Authentication required)
 */

// Get admin dashboard (with district/area access control)
router.get(
  "/dashboard",
  verifyAdminAuth,
  verifyDistrictAccess,
  adminController.getAdminDashboard,
);

// Get district candidate results
router.get(
  "/results/candidates",
  verifyAdminAuth,
  verifyDistrictAccess,
  adminController.getDistrictResults,
);

// Get district party results
router.get(
  "/results/parties",
  verifyAdminAuth,
  verifyDistrictAccess,
  adminController.getPartyResults,
);

/**
 * Admin Registration Routes
 */

// Admin can register voters from ANY district/area
router.post("/voters/register", verifyAdminAuth, voterController.registerVoter);

router.post(
  "/voters/register-with-photo",
  verifyAdminAuth,
  voterController.registerVoterWithPhoto,
);

// Admin can register candidates ONLY for their district/area
router.post(
  "/candidates/register",
  verifyAdminAuth,
  verifyDistrictAccess,
  uploadCandidateImage,
  adminController.registerCandidate,
);

/**
 * Super Admin Only Routes
 */

// Get all admins
router.get(
  "/admins",
  verifyAdminAuth,
  verifySuperAdmin,
  adminController.getAdmins,
);

// Create new admin (super admin only)
router.post(
  "/admins/create",
  verifyAdminAuth,
  verifySuperAdmin,
  adminController.createAdmin,
);

// Update admin district/area (super admin only)
router.put(
  "/admins/:adminId",
  verifyAdminAuth,
  verifySuperAdmin,
  adminController.updateAdmin,
);

// Delete admin (super admin only)
router.delete(
  "/admins/:adminId",
  verifyAdminAuth,
  verifySuperAdmin,
  adminController.deleteAdmin,
);

// Fetch blockchain data by contract address (super admin only)
router.post(
  "/blockchain/fetch",
  verifyAdminAuth,
  verifySuperAdmin,
  adminController.fetchBlockchainData,
);

module.exports = router;
