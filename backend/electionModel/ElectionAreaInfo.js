const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ElectionAreaInfo = sequelize.define(
  "ElectionAreaInfo",
  {
    District: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      comment: "District name",
    },
    AreaNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "Area number within the district",
    },
  },
  {
    tableName: "ElectionAreaInfo",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["District", "AreaNo"],
      },
    ],
  }
);

module.exports = ElectionAreaInfo;
