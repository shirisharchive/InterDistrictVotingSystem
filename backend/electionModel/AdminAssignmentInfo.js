const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * AdminAssignmentInfo Model
 * Represents admin assignments to districts and areas
 * This is an alternative to storing assignment in the admins table
 */
const AdminAssignmentInfo = sequelize.define(
  "AdminAssignmentInfo",
  {
    assignment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "admins",
        key: "admin_id",
      },
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "District assigned to this admin",
    },
    area: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Area number assigned to this admin",
    },
    is_super_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this admin has super admin privileges",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    tableName: "admin_assignments",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ["admin_id"],
      },
      {
        fields: ["district", "area"],
      },
      {
        fields: ["admin_id", "district", "area"],
        unique: true,
      },
    ],
  },
);

module.exports = AdminAssignmentInfo;
