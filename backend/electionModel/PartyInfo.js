const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ElectionAreaInfo = require("./ElectionAreaInfo");

const PartyInfo = sequelize.define(
  "PartyInfo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    PartyName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Political party name (unique per area)",
    },
    PartyLogo: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "URL or path to party logo image",
    },
    BlockchainId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
  },
  {
    tableName: "PartyInfo",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["PartyName", "District", "AreaNo"],
        name: "unique_party_per_area",
      },
    ],
  }
);

// Note: Sequelize doesn't support composite foreign keys directly

module.exports = PartyInfo;
