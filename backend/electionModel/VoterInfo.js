const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ElectionAreaInfo = require("./ElectionAreaInfo");

const VoterInfo = sequelize.define(
  "VoterInfo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    VoterName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    VoterId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Unique voter identification number",
    },
    DateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Voter's date of birth (YYYY-MM-DD)",
    },
    FaceData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Face encoding data stored as JSON string",
    },
    FaceRegisteredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when face was registered",
    },
    PhotoPath: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Path to voter's photo file",
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
    HasVoted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0 = not voted, 1 = voted",
    },
    IsFaceMatched: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0 = face not verified, 1 = face verified during login",
    },
  },
  {
    tableName: "VoterInfo",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["VoterId"],
        name: "unique_voter_id",
      },
    ],
  }
);

// Note: Sequelize doesn't support composite foreign keys directly
// The relationship is maintained through the two separate foreign key columns
// VoterInfo.belongsTo(ElectionAreaInfo, {
//   foreignKey: 'District',
//   targetKey: 'District',
// });

module.exports = VoterInfo;
