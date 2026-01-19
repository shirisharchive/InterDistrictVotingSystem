const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const VoterInfo = require("./VoterInfo");
const CandidateInfo = require("./CandidateInfo");
const ElectionAreaInfo = require("./ElectionAreaInfo");

const VoteInfo = sequelize.define(
  "VoteInfo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    VoterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: VoterInfo,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    VoterIdString: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Actual voter ID string for easier reference",
    },
    CandidateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CandidateInfo,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    District: {
      type: DataTypes.STRING,
      allowNull: false,
      // Note: Composite foreign key cannot be defined in Sequelize column references
    },
    AreaNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Note: Composite foreign key cannot be defined in Sequelize column references
    },
    VoteTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when vote was cast",
    },
    TransactionHash: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Blockchain transaction hash",
    },
    BlockNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Blockchain block number",
    },
  },
  {
    tableName: "VoteInfo",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["VoterId", "District", "AreaNo"],
        name: "one_direct_vote_per_voter_per_area",
      },
    ],
    defaultScope: {
      include: [
        {
          model: VoterInfo,
          attributes: ["VoterId", "VoterName"],
        },
        {
          model: CandidateInfo,
          attributes: ["CandidateName", "CandidateParty", "BlockchainId"],
        },
      ],
    },
    scopes: {
      withoutIncludes: {
        include: [],
      },
    },
  }
);

// Relationships
VoteInfo.belongsTo(VoterInfo, { foreignKey: "VoterId", targetKey: "id" });
VoteInfo.belongsTo(CandidateInfo, {
  foreignKey: "CandidateId",
  targetKey: "id",
});
// Note: Sequelize doesn't support composite foreign keys directly

module.exports = VoteInfo;
