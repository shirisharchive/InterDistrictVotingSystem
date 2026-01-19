const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const CandidateInfo = require("./CandidateInfo");
const ElectionAreaInfo = require("./ElectionAreaInfo");

const CandidateVoteCount = sequelize.define(
  "CandidateVoteCount",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      comment: "Election district",
    },
    AreaNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Area number within district",
    },
    VoteCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Total votes received by this candidate in this area",
    },
    LastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Last time this count was updated",
    },
  },
  {
    tableName: "CandidateVoteCount",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["CandidateId", "District", "AreaNo"],
        name: "unique_candidate_area_count",
      },
      {
        fields: ["District", "AreaNo"],
        name: "idx_district_area",
      },
    ],
  }
);

// Relationships
CandidateVoteCount.belongsTo(CandidateInfo, {
  foreignKey: "CandidateId",
  targetKey: "id",
});

module.exports = CandidateVoteCount;
