const db = require("../config/database");
const { Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * Admin Login
 */
exports.adminLogin = async (req, res) => {
  try {
    const { adminEmail, password } = req.body;

    if (!adminEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Get admin from database
    const result = await db.query(`SELECT * FROM admins WHERE email = $1`, {
      bind: [adminEmail],
      type: Sequelize.QueryTypes.SELECT,
    });

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const admin = result[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.admin_id,
        adminEmail: admin.email,
        isSuperAdmin: admin.is_super_admin,
      },
      process.env.JWT_SECRET || "admin_secret_key",
      { expiresIn: "24h" },
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token: token,
      admin: {
        adminId: admin.admin_id,
        name: admin.admin_name,
        email: admin.email,
        isSuperAdmin: admin.is_super_admin,
        district: admin.district || null,
        area: admin.area || null,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during admin login",
    });
  }
};

/**
 * Get voting results for admin's district
 */
exports.getDistrictResults = async (req, res) => {
  try {
    const adminAssignment = req.adminAssignment;
    const { districtId, areaNo } = req.query;
    const isSuperAdmin = adminAssignment.is_super_admin;

    // For super admins, show all or filter by district/area if specified
    if (isSuperAdmin && !adminAssignment.district) {
      let query = `
        SELECT 
          c.id as candidate_id,
          c."CandidateName" as candidate_name,
          c."CandidateImage" as candidate_image,
          c."District" as district,
          c."AreaNo" as area_no,
          c."CandidateParty" as party_name,
          COUNT(v.id) as vote_count,
          ROUND(100.0 * COUNT(v.id) / 
            NULLIF((SELECT COUNT(*) FROM "VoteInfo"), 0), 2) as vote_percentage
        FROM "CandidateInfo" c
        LEFT JOIN "VoteInfo" v ON c.id = v."CandidateId"
      `;

      let params = [];
      let whereConditions = [];

      // Add district filter if specified
      if (districtId) {
        params.push(districtId);
        whereConditions.push(`c."District" = $${params.length}`);
      }

      // Add area filter if specified
      if (areaNo) {
        params.push(areaNo);
        whereConditions.push(`c."AreaNo" = $${params.length}`);
      }

      if (whereConditions.length > 0) {
        query += ` WHERE ${whereConditions.join(" AND ")}`;
      }

      query += ` GROUP BY c.id, c."CandidateName", c."CandidateImage", c."District", c."AreaNo", c."CandidateParty"
                 ORDER BY vote_count DESC`;

      const results =
        params.length > 0
          ? await db.query(query, {
              bind: params,
              type: Sequelize.QueryTypes.SELECT,
            })
          : await db.query(query, { type: Sequelize.QueryTypes.SELECT });

      return res.status(200).json({
        success: true,
        data: results,
        district: districtId || "All Districts",
        area: areaNo || "All Areas",
        message: "Candidate results retrieved successfully",
      });
    }

    // Regular admin - must have district assignment
    const district = districtId || adminAssignment.district;
    const area = areaNo || adminAssignment.area;

    if (!district) {
      return res.status(400).json({
        success: false,
        message: "No district assignment found for admin",
      });
    }

    // Build query based on admin assignment
    let query = `
      SELECT 
        c.id as candidate_id,
        c."CandidateName" as candidate_name,
        c."CandidateImage" as candidate_image,
        c."CandidateParty" as party_name,
        c."District" as district,
        c."AreaNo" as area_no,
        COUNT(v.id) as vote_count,
        ROUND(100.0 * COUNT(v.id) / 
          NULLIF((SELECT COUNT(*) FROM "VoteInfo"), 0), 2) as vote_percentage
      FROM "CandidateInfo" c
      LEFT JOIN "VoteInfo" v ON c.id = v."CandidateId"
      WHERE c."District" = $1
    `;

    let params = [district];

    // Add area filter if specified
    if (area) {
      query += ` AND c."AreaNo" = $2`;
      params.push(area);
    }

    query += ` GROUP BY c.id, c."CandidateName", c."CandidateImage", c."CandidateParty", c."District", c."AreaNo"
               ORDER BY vote_count DESC`;

    const results = await db.query(query, {
      bind: params,
      type: Sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: results,
      district: district,
      area: area || "All",
      message: "District results retrieved successfully",
    });
  } catch (error) {
    console.error("Get district results error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving district results",
    });
  }
};

/**
 * Get party results for admin's district
 */
exports.getPartyResults = async (req, res) => {
  try {
    const adminAssignment = req.adminAssignment;
    const { districtId, areaNo } = req.query;
    const isSuperAdmin = adminAssignment.is_super_admin;

    // For super admins, show all or filter by district/area if specified
    if (isSuperAdmin && !adminAssignment.district) {
      let query = `
        SELECT 
          p.id as party_id,
          p."PartyName" as party_name,
          p."PartyLogo" as party_logo,
          p."District" as district,
          p."AreaNo" as area_no,
          COUNT(v.id) as vote_count,
          ROUND(100.0 * COUNT(v.id) / 
            NULLIF((SELECT COUNT(*) FROM "IndirectVoteInfo"), 0), 2) as vote_percentage
        FROM "PartyInfo" p
        LEFT JOIN "IndirectVoteInfo" v ON p.id = v."PartyId"
      `;

      let params = [];
      let whereConditions = [];

      // Add district filter if specified
      if (districtId) {
        params.push(districtId);
        whereConditions.push(`p."District" = $${params.length}`);
      }

      // Add area filter if specified
      if (areaNo) {
        params.push(areaNo);
        whereConditions.push(`p."AreaNo" = $${params.length}`);
      }

      if (whereConditions.length > 0) {
        query += ` WHERE ${whereConditions.join(" AND ")}`;
      }

      query += ` GROUP BY p.id, p."PartyName", p."PartyLogo", p."District", p."AreaNo"
                 ORDER BY vote_count DESC`;

      const results =
        params.length > 0
          ? await db.query(query, {
              bind: params,
              type: Sequelize.QueryTypes.SELECT,
            })
          : await db.query(query, { type: Sequelize.QueryTypes.SELECT });

      return res.status(200).json({
        success: true,
        data: results,
        district: districtId || "All Districts",
        area: areaNo || "All Areas",
        message: "Party results retrieved successfully",
      });
    }

    // Regular admin - must have district assignment
    const district = districtId || adminAssignment.district;
    const area = areaNo || adminAssignment.area;

    if (!district) {
      return res.status(400).json({
        success: false,
        message: "No district assignment found for admin",
      });
    }

    let query = `
      SELECT 
        p.id as party_id,
        p."PartyName" as party_name,
        p."PartyLogo" as party_logo,
        p."District" as district,
        p."AreaNo" as area_no,
        COUNT(v.id) as vote_count,
        ROUND(100.0 * COUNT(v.id) / 
          NULLIF((SELECT COUNT(*) FROM "IndirectVoteInfo"), 0), 2) as vote_percentage
      FROM "PartyInfo" p
      LEFT JOIN "IndirectVoteInfo" v ON p.id = v."PartyId"
      WHERE p."District" = $1
    `;

    let params = [district];

    if (area) {
      query += ` AND p."AreaNo" = $2`;
      params.push(area);
    }

    query += ` GROUP BY p.id, p."PartyName", p."PartyLogo", p."District", p."AreaNo"
               ORDER BY vote_count DESC`;

    const results = await db.query(query, {
      bind: params,
      type: Sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: results,
      district: district,
      area: area || "All",
      message: "Party results retrieved successfully",
    });
  } catch (error) {
    console.error("Get party results error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving party results",
    });
  }
};

/**
 * Get admin dashboard summary
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    const adminAssignment = req.adminAssignment;
    const districtId = adminAssignment.district;
    const areaNo = adminAssignment.area;
    const isSuperAdmin = adminAssignment.is_super_admin;

    // For super admins without specific district/area, show overall stats
    if (isSuperAdmin && !districtId) {
      // Get overall statistics
      const votersQuery = `SELECT COUNT(*) as total_voters FROM "VoterInfo"`;
      const votersResult = await db.query(votersQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });

      const votesQuery = `SELECT COUNT(*) as votes_cast FROM "VoteInfo"`;
      const votesResult = await db.query(votesQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });

      const leadingQuery = `
        SELECT c."CandidateName" as candidate_name, c."CandidateParty" as party_name, COUNT(v.id) as vote_count
        FROM "CandidateInfo" c
        LEFT JOIN "VoteInfo" v ON c.id = v."CandidateId" AND 1=1
        GROUP BY c.id, c."CandidateName", c."CandidateParty"
        ORDER BY vote_count DESC
        LIMIT 1
      `;
      const leadingResult = await db.query(leadingQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });

      const leadingPartyQuery = `
        SELECT p."PartyName" as party_name, COUNT(v.id) as vote_count
        FROM "PartyInfo" p
        LEFT JOIN "IndirectVoteInfo" v ON p.id = v."PartyId"
        GROUP BY p.id, p."PartyName"
        ORDER BY vote_count DESC
        LIMIT 1
      `;
      const leadingPartyResult = await db.query(leadingPartyQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });

      const totalVoters = parseInt(votersResult[0]?.total_voters || 0);
      const votesCast = parseInt(votesResult[0]?.votes_cast || 0);
      const turnout =
        totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(2) : 0;

      return res.status(200).json({
        success: true,
        data: {
          district: "All Districts",
          area: "All Areas",
          totalVoters: totalVoters,
          votesCast: votesCast,
          turnout: turnout + "%",
          leadingCandidate: leadingResult[0] || null,
          leadingParty: leadingPartyResult[0] || null,
        },
        message: "Dashboard data retrieved successfully",
      });
    }

    // Get total voters in area
    const votersQuery = `
      SELECT COUNT(*) as total_voters
      FROM "VoterInfo"
      WHERE "District" = $1 AND "AreaNo" = $2
    `;
    const votersResult = await db.query(votersQuery, {
      bind: [districtId, areaNo],
      type: Sequelize.QueryTypes.SELECT,
    });

    // Get votes cast
    const votesQuery = `
      SELECT COUNT(*) as votes_cast
      FROM "VoteInfo"
      WHERE "VoterId" IN (
        SELECT "VoterId" FROM "VoterInfo" WHERE "District" = $1 AND "AreaNo" = $2
      )
    `;
    const votesResult = await db.query(votesQuery, {
      bind: [districtId, areaNo],
      type: Sequelize.QueryTypes.SELECT,
    });

    // Get leading candidate
    const leadingQuery = `
      SELECT c."CandidateName" as candidate_name, c."CandidateParty" as party_name, COUNT(v.id) as vote_count
      FROM "CandidateInfo" c
      LEFT JOIN "VoteInfo" v ON c.id = v."CandidateId" AND 1=1
      WHERE c."District" = $1 AND c."AreaNo" = $2
      GROUP BY c.id, c."CandidateName", c."CandidateParty"
      ORDER BY vote_count DESC
      LIMIT 1
    `;
    const leadingResult = await db.query(leadingQuery, {
      bind: [districtId, areaNo],
      type: Sequelize.QueryTypes.SELECT,
    });

    // Get leading party
    const leadingPartyQuery = `
      SELECT p."PartyName" as party_name, COUNT(v.id) as vote_count
      FROM "PartyInfo" p
      LEFT JOIN "IndirectVoteInfo" v ON p.id = v."PartyId"
      WHERE p."District" = $1 AND p."AreaNo" = $2
      GROUP BY p.id, p."PartyName"
      ORDER BY vote_count DESC
      LIMIT 1
    `;
    const leadingPartyResult = await db.query(leadingPartyQuery, {
      bind: [districtId, areaNo],
      type: Sequelize.QueryTypes.SELECT,
    });

    const totalVoters = parseInt(votersResult[0]?.total_voters || 0);
    const votesCast = parseInt(votesResult[0]?.votes_cast || 0);
    const turnout =
      totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(2) : 0;

    return res.status(200).json({
      success: true,
      data: {
        district: districtId,
        area: areaNo,
        totalVoters: totalVoters,
        votesCast: votesCast,
        turnout: turnout + "%",
        leadingCandidate: leadingResult[0] || null,
        leadingParty: leadingPartyResult[0] || null,
      },
      message: "Dashboard data retrieved successfully",
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving dashboard data",
    });
  }
};

/**
 * Get list of admins (super admin only)
 */
exports.getAdmins = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.admin_id as id, 
        a.admin_name as name, 
        a.email, 
        a.is_super_admin,
        a.district, 
        a.area,
        CASE 
          WHEN a.is_super_admin = true THEN 'Super Admin'
          ELSE 'District Admin'
        END as type
      FROM admins a
      ORDER BY a.is_super_admin DESC, a.admin_id ASC
    `;

    const results = await db.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    // Format the results
    const formattedResults = results.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      type: admin.type,
      district: admin.district || "-",
      area: admin.area || "-",
      isSuperAdmin: admin.is_super_admin,
    }));

    return res.status(200).json({
      success: true,
      data: formattedResults,
      message: "Admins retrieved successfully",
    });
  } catch (error) {
    console.error("Get admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving admins",
    });
  }
};

/**
 * Create new admin (super admin only)
 */
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, district, area, isSuperAdmin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Validate district and area for non-super admins
    if (!isSuperAdmin && (!district || !area)) {
      return res.status(400).json({
        success: false,
        message: "District and area are required for district admins",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin with district and area in admins table
    const query = `
      INSERT INTO admins (admin_name, email, password_hash, is_super_admin, district, area, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING admin_id, admin_name as name, email, is_super_admin, district, area
    `;

    const result = await db.query(query, {
      bind: [
        name,
        email,
        hashedPassword,
        isSuperAdmin || false,
        isSuperAdmin ? null : district,
        isSuperAdmin ? null : parseInt(area),
      ],
      type: Sequelize.QueryTypes.INSERT,
    });

    const newAdmin = result[0][0];

    // Also create admin_assignments entry for backward compatibility
    if (!isSuperAdmin && district && area) {
      try {
        const assignQuery = `
          INSERT INTO admin_assignments (admin_id, district_id, area_no)
          VALUES ($1, $2, $3)
        `;
        await db.query(assignQuery, {
          bind: [newAdmin.admin_id, district, parseInt(area)],
          type: Sequelize.QueryTypes.INSERT,
        });
      } catch (assignError) {
        console.warn(
          "Admin assignments insert failed (may already exist):",
          assignError.message,
        );
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        adminId: newAdmin.admin_id,
        name: newAdmin.name,
        email: newAdmin.email,
        isSuperAdmin: newAdmin.is_super_admin,
        district: newAdmin.district || null,
        area: newAdmin.area || null,
      },
      message: "Admin created successfully",
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating admin: " + error.message,
    });
  }
};

/**
 * Update admin district/area assignment (super admin only)
 */
exports.updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { name, district, area } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    // Check if admin exists
    const checkQuery = `SELECT admin_id, is_super_admin FROM admins WHERE admin_id = $1`;
    const adminCheck = await db.query(checkQuery, {
      bind: [adminId],
      type: Sequelize.QueryTypes.SELECT,
    });

    if (adminCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Prevent updating super admin
    if (adminCheck[0].is_super_admin) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify super admin assignments",
      });
    }

    // Build update query dynamically
    const updates = [];
    const binds = [];
    let bindIndex = 1;

    if (name) {
      updates.push(`name = $${bindIndex}`);
      binds.push(name);
      bindIndex++;
    }

    if (district) {
      updates.push(`district = $${bindIndex}`);
      binds.push(district);
      bindIndex++;
    }

    if (area) {
      updates.push(`area = $${bindIndex}`);
      binds.push(parseInt(area));
      bindIndex++;
    }

    if (updates.length > 0) {
      binds.push(adminId);
      const updateQuery = `UPDATE admins SET ${updates.join(", ")} WHERE admin_id = $${bindIndex}`;
      await db.query(updateQuery, {
        bind: binds,
        type: Sequelize.QueryTypes.UPDATE,
      });

      // Also update admin_assignments for backward compatibility
      if (district && area) {
        try {
          const assignmentCheck = await db.query(
            `SELECT * FROM admin_assignments WHERE admin_id = $1`,
            {
              bind: [adminId],
              type: Sequelize.QueryTypes.SELECT,
            },
          );

          if (assignmentCheck.length > 0) {
            await db.query(
              `UPDATE admin_assignments SET district_id = $1, area_no = $2 WHERE admin_id = $3`,
              {
                bind: [district, parseInt(area), adminId],
                type: Sequelize.QueryTypes.UPDATE,
              },
            );
          } else {
            await db.query(
              `INSERT INTO admin_assignments (admin_id, district_id, area_no) VALUES ($1, $2, $3)`,
              {
                bind: [adminId, district, parseInt(area)],
                type: Sequelize.QueryTypes.INSERT,
              },
            );
          }
        } catch (assignError) {
          console.warn("Admin assignments update failed:", assignError.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
    });
  } catch (error) {
    console.error("Update admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating admin: " + error.message,
    });
  }
};

/**
 * Delete admin (super admin only)
 */
exports.deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    // Check if admin exists and is not super admin
    const checkQuery = `SELECT admin_id, is_super_admin FROM admins WHERE admin_id = $1`;
    const adminCheck = await db.query(checkQuery, {
      bind: [adminId],
      type: Sequelize.QueryTypes.SELECT,
    });

    if (adminCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (adminCheck[0].is_super_admin) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin",
      });
    }

    // Delete admin assignments first (foreign key constraint)
    await db.query(`DELETE FROM admin_assignments WHERE admin_id = $1`, {
      bind: [adminId],
      type: Sequelize.QueryTypes.DELETE,
    });

    // Delete admin
    await db.query(`DELETE FROM admins WHERE admin_id = $1`, {
      bind: [adminId],
      type: Sequelize.QueryTypes.DELETE,
    });

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting admin: " + error.message,
    });
  }
};

/**
 * Fetch blockchain data by contract address (super admin only)
 */
exports.fetchBlockchainData = async (req, res) => {
  try {
    const { contractAddress, district, area } = req.body;

    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        message: "Contract address is required",
      });
    }

    // Import Web3 and contract ABI
    const { Web3 } = require("web3");
    const VotingContract = require("../../Contract/build/contracts/Voting.json");

    // Connect to blockchain
    const web3 = new Web3(
      process.env.BLOCKCHAIN_URL || "http://localhost:7545",
    );
    const contract = new web3.eth.Contract(VotingContract.abi, contractAddress);

    // Fetch candidates from blockchain
    const candidateCount = await contract.methods.getCandidateCount().call();
    const candidates = [];

    for (let i = 0; i < candidateCount; i++) {
      const candidate = await contract.methods.getCandidate(i).call();

      // Filter by district and area if provided
      if (
        district &&
        candidate.district.toLowerCase() !== district.toLowerCase()
      )
        continue;
      if (area && parseInt(candidate.areaNo) !== parseInt(area)) continue;

      candidates.push({
        id: i,
        name: candidate.name,
        party: candidate.party,
        position: candidate.position,
        district: candidate.district,
        areaNo: parseInt(candidate.areaNo),
        voteCount: parseInt(candidate.voteCount),
        candidatePhotoUrl: candidate.candidatePhotoUrl,
        candidatePartyLogoUrl: candidate.candidatePartyLogoUrl,
      });
    }

    // Fetch parties from blockchain
    const partyCount = await contract.methods.getPartyCount().call();
    const parties = [];

    for (let i = 0; i < partyCount; i++) {
      const party = await contract.methods.getParty(i).call();

      // Filter by district and area if provided
      if (district && party.district.toLowerCase() !== district.toLowerCase())
        continue;
      if (area && parseInt(party.areaNo) !== parseInt(area)) continue;

      parties.push({
        id: i,
        name: party.partyName,
        district: party.district,
        areaNo: parseInt(party.areaNo),
        voteCount: parseInt(party.voteCount),
        partyLogoUrl: party.partyLogoUrl,
      });
    }

    // Fetch total votes
    const totalVotes = await contract.methods.getTotalVotesCast().call();

    return res.status(200).json({
      success: true,
      data: {
        contractAddress,
        filter: {
          district: district || "All",
          area: area || "All",
        },
        candidates,
        parties,
        totalVotes: parseInt(totalVotes),
      },
      message: "Blockchain data fetched successfully",
    });
  } catch (error) {
    console.error("Fetch blockchain data error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching blockchain data: " + error.message,
    });
  }
};

/**
 * Register candidate (admin only - restricted to their district/area)
 */
exports.registerCandidate = async (req, res) => {
  try {
    const adminAssignment = req.adminAssignment;
    const { candidateName, candidateParty, candidatePosition, district, area } =
      req.body;

    // Check if admin is trying to register candidate for their assigned district AND area
    if (!adminAssignment.is_super_admin) {
      // Both district AND area must match
      if (district !== adminAssignment.district) {
        return res.status(403).json({
          success: false,
          message: `You can only register candidates for ${adminAssignment.district} district`,
        });
      }

      if (parseInt(area) !== parseInt(adminAssignment.area)) {
        return res.status(403).json({
          success: false,
          message: `You can only register candidates for area ${adminAssignment.area}. You tried to register for area ${area}.`,
        });
      }
    }

    // Delegate to the candidate controller
    const candidateController = require("./candidateController");
    return candidateController.addCandidate(req, res);
  } catch (error) {
    console.error("Register candidate error:", error);
    return res.status(500).json({
      success: false,
      message: "Error registering candidate",
    });
  }
};
