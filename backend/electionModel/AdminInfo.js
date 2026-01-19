const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * AdminInfo Model
 * Represents admin users in the system
 */
const AdminInfo = sequelize.define(
  "AdminInfo",
  {
    admin_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "District assigned to this admin (null for super admins)",
    },
    area: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Area number assigned to this admin (null for super admins)",
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "admins",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ["email"],
        unique: true,
      },
      {
        fields: ["district", "area"],
      },
    ],
  },
);

module.exports = AdminInfo;
