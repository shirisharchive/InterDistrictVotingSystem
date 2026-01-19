require("dotenv").config();
const { Sequelize } = require("sequelize");

async function fixVoterIdColumn() {
  try {
    const dbName = process.env.DB_NAME || "voting_system";
    const dbUser = process.env.DB_USER || "postgres";
    const dbPassword = process.env.DB_PASSWORD || "root";
    const dbHost = process.env.DB_HOST || "localhost";
    const dbPort = process.env.DB_PORT || 5432;

    // First create database if it doesn't exist
    console.log("🔄 Checking/creating database...");
    const tempSequelize = new Sequelize({
      dialect: "postgres",
      host: dbHost,
      port: dbPort,
      database: "postgres",
      username: dbUser,
      password: dbPassword,
      logging: false,
    });

    await tempSequelize.authenticate();
    const [results] = await tempSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );

    if (results.length === 0) {
      await tempSequelize.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created`);
    } else {
      console.log(`✅ Database '${dbName}' exists`);
    }
    await tempSequelize.close();

    // Now connect to the actual database
    const sequelize = new Sequelize({
      dialect: "postgres",
      host: dbHost,
      port: dbPort,
      database: dbName,
      username: dbUser,
      password: dbPassword,
      logging: false,
    });

    console.log("🔄 Fixing VoterId column in VoterInfo table...");

    // Check if table exists
    const [tables] = await sequelize.query(`
      SELECT tablename FROM pg_tables WHERE tablename = 'VoterInfo';
    `);

    if (tables.length === 0) {
      console.log("ℹ️  VoterInfo table doesn't exist yet. Run db:sync first.");
      await sequelize.close();
      process.exit(0);
      return;
    }

    // Drop the existing unique constraint if it exists
    await sequelize.query(`
      DO $$ 
      BEGIN
        ALTER TABLE "VoterInfo" DROP CONSTRAINT IF EXISTS "VoterInfo_VoterId_key";
      EXCEPTION
        WHEN undefined_object THEN
          NULL;
      END $$;
    `);

    console.log("✅ Dropped existing constraints");

    // Ensure the column is VARCHAR(255)
    await sequelize.query(`
      ALTER TABLE "VoterInfo" 
      ALTER COLUMN "VoterId" TYPE VARCHAR(255);
    `);

    console.log("✅ Column type updated to VARCHAR(255)");

    // Add unique constraint
    await sequelize.query(`
      DO $$ 
      BEGIN
        ALTER TABLE "VoterInfo" 
        ADD CONSTRAINT "VoterInfo_VoterId_key" UNIQUE ("VoterId");
      EXCEPTION
        WHEN duplicate_table THEN
          NULL;
      END $$;
    `);

    console.log("✅ Unique constraint added");

    // Ensure NOT NULL
    await sequelize.query(`
      ALTER TABLE "VoterInfo" 
      ALTER COLUMN "VoterId" SET NOT NULL;
    `);

    console.log("✅ VoterId column fixed successfully!");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixVoterIdColumn();
