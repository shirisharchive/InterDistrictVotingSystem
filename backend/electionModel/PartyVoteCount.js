const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const PartyInfo = require("./PartyInfo");
const ElectionAreaInfo = require("./ElectionAreaInfo");

const PartyVoteCount = sequelize.define(
  "PartyVoteCount",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      comment: "Total votes received by this party in this area",
    },
    LastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Last time this count was updated",
    },
  },
  {
    tableName: "PartyVoteCount",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["PartyId", "District", "AreaNo"],
        name: "unique_party_area_count",
      },
      {
        fields: ["District", "AreaNo"],
        name: "idx_party_district_area",
      },
    ],
  }
);

// Relationships
PartyVoteCount.belongsTo(PartyInfo, {
  foreignKey: "PartyId",
  targetKey: "id",
});

module.exports = PartyVoteCount;
