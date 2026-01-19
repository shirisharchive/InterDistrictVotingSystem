const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const VoterInfo = require("./VoterInfo");
const PartyInfo = require("./PartyInfo");
const ElectionAreaInfo = require("./ElectionAreaInfo");

const IndirectVoteInfo = sequelize.define(
  "IndirectVoteInfo",
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
    PartyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PartyInfo,
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
    tableName: "IndirectVoteInfo",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["VoterId", "District", "AreaNo"],
        name: "one_indirect_vote_per_voter_per_area",
      },
    ],
  }
);

// Relationships
IndirectVoteInfo.belongsTo(VoterInfo, {
  foreignKey: "VoterId",
  targetKey: "id",
});
IndirectVoteInfo.belongsTo(PartyInfo, {
  foreignKey: "PartyId",
  targetKey: "id",
});
// Note: Sequelize doesn't support composite foreign keys directly

module.exports = IndirectVoteInfo;
