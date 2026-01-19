/**
 * Migration script to add PhotoPath column to VoterInfo table
 * Run this BEFORE registering new voters with photos
 */

const sequelize = require("./config/database");
const { DataTypes } = require("sequelize");

async function addPhotoPathColumn() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection successful\n");

    const VoterInfo = sequelize.define(
      "VoterInfo",
      {
        PhotoPath: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: "Path to voter's photo file",
        },
      },
      {
        tableName: "VoterInfo",
        timestamps: false,
      }
    );

    console.log("🔄 Checking if PhotoPath column already exists...");
    const columns = await sequelize
      .getQueryInterface()
      .describeTable("VoterInfo");

    if (columns.PhotoPath) {
      console.log("✅ PhotoPath column already exists\n");
      return;
    }

    console.log("🔄 Adding PhotoPath column to VoterInfo table...");
    await sequelize.getQueryInterface().addColumn("VoterInfo", "PhotoPath", {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Path to voter's photo file",
    });

    console.log("✅ PhotoPath column added successfully\n");
    console.log("✨ Migration completed!");
    console.log("\nNow you can register voters with photos.");
  } catch (error) {
    console.error("❌ Error during migration:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
addPhotoPathColumn();
