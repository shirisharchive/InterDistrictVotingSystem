const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Migration Script: Remove PassportNo column and Add FaceData columns
 *
 * This script:
 * 1. Removes the PassportNo column from VoterInfo table
 * 2. Adds FaceData column to store face encoding as JSON text
 * 3. Adds FaceRegisteredAt column to track when face was registered
 */

async function migrateDatabase() {
  try {
    console.log("Starting database migration...");

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Check if PassportNo column exists and remove it
      console.log("Removing PassportNo column...");
      await sequelize.query(
        `ALTER TABLE "VoterInfo" DROP COLUMN IF EXISTS "PassportNo";`,
        { transaction }
      );
      console.log("✓ PassportNo column removed");

      // Drop the unique constraint on PassportNo if it exists
      await sequelize.query(`DROP INDEX IF EXISTS "unique_passport_no";`, {
        transaction,
      });
      console.log("✓ Unique passport constraint removed");

      // Add FaceData column if it doesn't exist
      console.log("Adding FaceData column...");
      await sequelize.query(
        `ALTER TABLE "VoterInfo" 
         ADD COLUMN IF NOT EXISTS "FaceData" TEXT;`,
        { transaction }
      );
      console.log("✓ FaceData column added");

      // Add FaceRegisteredAt column if it doesn't exist
      console.log("Adding FaceRegisteredAt column...");
      await sequelize.query(
        `ALTER TABLE "VoterInfo" 
         ADD COLUMN IF NOT EXISTS "FaceRegisteredAt" TIMESTAMP WITH TIME ZONE;`,
        { transaction }
      );
      console.log("✓ FaceRegisteredAt column added");

      // Add comment to FaceData column
      await sequelize.query(
        `COMMENT ON COLUMN "VoterInfo"."FaceData" IS 'Face encoding data stored as JSON string';`,
        { transaction }
      );

      // Add comment to FaceRegisteredAt column
      await sequelize.query(
        `COMMENT ON COLUMN "VoterInfo"."FaceRegisteredAt" IS 'Timestamp when face was registered';`,
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      console.log("\n✅ Database migration completed successfully!");
      console.log("\nChanges made:");
      console.log("  - Removed: PassportNo column");
      console.log("  - Added: FaceData column (TEXT)");
      console.log("  - Added: FaceRegisteredAt column (TIMESTAMP)");

      // Display table structure
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'VoterInfo'
        ORDER BY ordinal_position;
      `);

      console.log("\nCurrent VoterInfo table structure:");
      console.table(columns);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = migrateDatabase;
