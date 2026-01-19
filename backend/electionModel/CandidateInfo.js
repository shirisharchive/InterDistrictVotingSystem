const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ElectionAreaInfo = require("./ElectionAreaInfo");

const CandidateInfo = sequelize.define(
  "CandidateInfo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    CandidateName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CandidateParty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CandidatePosition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CandidateElectionLogo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CandidateImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    BlockchainId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    District: {
      type: DataTypes.STRING,
      allowNull: false,
      // Note: Composite foreign key (District, AreaNo) cannot be defined in Sequelize column references
      // The constraint is handled at database level or application level
    },
    AreaNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Note: Composite foreign key (District, AreaNo) cannot be defined in Sequelize column references
      // The constraint is handled at database level or application level
    },
  },
  {
    tableName: "CandidateInfo",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["CandidateParty", "CandidatePosition", "District", "AreaNo"],
        name: "unique_party_position_per_area",
      },
    ],
  }
);

// Note: Sequelize doesn't support composite foreign keys directly
// The relationship is maintained through the two separate foreign key columns

module.exports = CandidateInfo;
