const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { Sequelize } = require("sequelize");

/**
 * Middleware to verify admin authentication
 */
const verifyAdminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin token not provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "admin_secret_key",
    );
    req.adminUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

/**
 * Middleware to verify admin has access to specific district/area
 */
const verifyDistrictAccess = async (req, res, next) => {
  try {
    const adminId = req.adminUser.adminId;
    const isSuperAdmin = req.adminUser.isSuperAdmin;
    const { districtId, areaNo } = req.query || req.body;

    if (!adminId) {
      return res.status(403).json({
        success: false,
        message: "Admin ID not found in token",
      });
    }

    // Super admins have access to all districts/areas
    if (isSuperAdmin) {
      // For super admins, create a virtual assignment or use requested params
      req.adminAssignment = {
        admin_id: adminId,
        district: districtId || null,
        area: areaNo || null,
        is_super_admin: true,
      };
      return next();
    }

    // Query database to get admin's assigned district and area from admins table
    const query = `
      SELECT admin_id, district, area, is_super_admin 
      FROM admins 
      WHERE admin_id = $1
    `;

    const result = await db.query(query, {
      bind: [adminId],
      type: Sequelize.QueryTypes.SELECT,
    });

    if (result.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin not found",
      });
    }

    const adminAssignment = result[0];

    // Check if admin has district and area assigned
    if (!adminAssignment.district || !adminAssignment.area) {
      return res.status(403).json({
        success: false,
        message: "Admin has no assigned district or area",
      });
    }

    // Check if admin is requesting data from their assigned district
    if (districtId && districtId != adminAssignment.district) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You can only access ${adminAssignment.district} district`,
      });
    }

    // Check if admin is requesting data from their assigned area (if specified)
    if (areaNo && parseInt(areaNo) !== parseInt(adminAssignment.area)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You can only access area ${adminAssignment.area}`,
      });
    }

    // Store admin assignment in request for later use
    req.adminAssignment = adminAssignment;
    next();
  } catch (error) {
    console.error("Error verifying district access:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying admin access",
    });
  }
};

/**
 * Middleware to verify admin is super admin (can manage all districts)
 */
const verifySuperAdmin = async (req, res, next) => {
  try {
    const adminId = req.adminUser.adminId;

    const query = `
      SELECT is_super_admin FROM admins 
      WHERE admin_id = $1
    `;

    const result = await db.query(query, {
      bind: [adminId],
      type: Sequelize.QueryTypes.SELECT,
    });

    if (result.length === 0 || !result[0].is_super_admin) {
      return res.status(403).json({
        success: false,
        message: "Only super admins can access this resource",
      });
    }

    next();
  } catch (error) {
    console.error("Error verifying super admin:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying admin permissions",
    });
  }
};

module.exports = {
  verifyAdminAuth,
  verifyDistrictAccess,
  verifySuperAdmin,
};
