/**
 * Migration script to add IsFaceMatched column to VoterInfo table
 * This tracks whether a voter's face has been successfully verified during login
 * 0 = face not verified, 1 = face verified
 */

const sequelize = require("./config/database");
const { DataTypes } = require("sequelize");

async function addIsFaceMatchedColumn() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection successful\n");

    const VoterInfo = sequelize.define(
      "VoterInfo",
      {
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
      }
    );

    console.log("🔄 Checking if IsFaceMatched column already exists...");
    const columns = await sequelize
      .getQueryInterface()
      .describeTable("VoterInfo");

    if (columns.IsFaceMatched) {
      console.log("✅ IsFaceMatched column already exists\n");
      return;
    }

    console.log("🔄 Adding IsFaceMatched column to VoterInfo table...");
    await sequelize
      .getQueryInterface()
      .addColumn("VoterInfo", "IsFaceMatched", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "0 = face not verified, 1 = face verified during login",
      });

    console.log("✅ IsFaceMatched column added successfully\n");
    console.log("📋 Column Details:");
    console.log("   - Name: IsFaceMatched");
    console.log("   - Type: INTEGER (0 or 1)");
    console.log("   - Default: 0 (not verified)");
    console.log("   - Purpose: Track face verification during login\n");
    console.log("✨ Migration completed!");
  } catch (error) {
    console.error("❌ Error during migration:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
addIsFaceMatchedColumn();
