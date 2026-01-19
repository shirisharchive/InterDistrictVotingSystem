const sequelize = require("../config/database");
const ElectionAreaInfo = require("./ElectionAreaInfo");
const CandidateInfo = require("./CandidateInfo");
const VoterInfo = require("./VoterInfo");
const PartyInfo = require("./PartyInfo");
const VoteInfo = require("./VoteInfo");
const IndirectVoteInfo = require("./IndirectVoteInfo");
const CandidateVoteCount = require("./CandidateVoteCount");
const PartyVoteCount = require("./PartyVoteCount");
const AdminInfo = require("./AdminInfo");
const AdminAssignmentInfo = require("./AdminAssignmentInfo");

/**
 * Sync all models and create CHECK constraints for area validation
 */
const syncDatabase = async () => {
  try {
    console.log("🔄 Syncing database models...");

    // Sync all models (creates tables)
    await sequelize.sync({ force: false }); // Set to true to drop and recreate tables

    console.log("✅ All models synced successfully");

    // Add CHECK constraints for area validation
    await addCheckConstraints();

    console.log("✅ Database setup complete!");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    throw error;
  }
};

/**
 * Add CHECK constraints to ensure votes match voter/candidate/party areas
 */
const addCheckConstraints = async () => {
  try {
    console.log("🔄 Adding CHECK constraints...");

    const queryInterface = sequelize.getQueryInterface();

    // Check constraint for VoteInfo - vote area matches candidate area
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_vote_candidate_area'
        ) THEN
          ALTER TABLE "VoteInfo" ADD CONSTRAINT chk_vote_candidate_area
          CHECK (
            EXISTS (
              SELECT 1 FROM "CandidateInfo" 
              WHERE "CandidateInfo".id = "VoteInfo"."CandidateId" 
              AND "CandidateInfo"."District" = "VoteInfo"."District" 
              AND "CandidateInfo"."AreaNo" = "VoteInfo"."AreaNo"
            )
          );
        END IF;
      END $$;
    `);

    // Check constraint for VoteInfo - vote area matches voter area
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_vote_voter_area'
        ) THEN
          ALTER TABLE "VoteInfo" ADD CONSTRAINT chk_vote_voter_area
          CHECK (
            EXISTS (
              SELECT 1 FROM "VoterInfo" 
              WHERE "VoterInfo".id = "VoteInfo"."VoterId" 
              AND "VoterInfo"."District" = "VoteInfo"."District" 
              AND "VoterInfo"."AreaNo" = "VoteInfo"."AreaNo"
            )
          );
        END IF;
      END $$;
    `);

    // Check constraint for IndirectVoteInfo - vote area matches party area
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_indirect_vote_party_area'
        ) THEN
          ALTER TABLE "IndirectVoteInfo" ADD CONSTRAINT chk_indirect_vote_party_area
          CHECK (
            EXISTS (
              SELECT 1 FROM "PartyInfo" 
              WHERE "PartyInfo".id = "IndirectVoteInfo"."PartyId" 
              AND "PartyInfo"."District" = "IndirectVoteInfo"."District" 
              AND "PartyInfo"."AreaNo" = "IndirectVoteInfo"."AreaNo"
            )
          );
        END IF;
      END $$;
    `);

    // Check constraint for IndirectVoteInfo - vote area matches voter area
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_indirect_vote_voter_area'
        ) THEN
          ALTER TABLE "IndirectVoteInfo" ADD CONSTRAINT chk_indirect_vote_voter_area
          CHECK (
            EXISTS (
              SELECT 1 FROM "VoterInfo" 
              WHERE "VoterInfo".id = "IndirectVoteInfo"."VoterId" 
              AND "VoterInfo"."District" = "IndirectVoteInfo"."District" 
              AND "VoterInfo"."AreaNo" = "IndirectVoteInfo"."AreaNo"
            )
          );
        END IF;
      END $$;
    `);

    console.log("✅ CHECK constraints added successfully");
  } catch (error) {
    console.log(
      "⚠️  CHECK constraints may already exist or error occurred:",
      error.message,
    );
  }
};

// Export models and sync function
module.exports = {
  sequelize,
  ElectionAreaInfo,
  CandidateInfo,
  VoterInfo,
  PartyInfo,
  VoteInfo,
  IndirectVoteInfo,
  CandidateVoteCount,
  PartyVoteCount,
  AdminInfo,
  AdminAssignmentInfo,
  syncDatabase,
};
