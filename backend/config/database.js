const { Sequelize } = require("sequelize");

// Function to create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  const dbName = process.env.DB_NAME || "voting_system";
  const dbUser = process.env.DB_USER || "postgres";
  const dbPassword = process.env.DB_PASSWORD || "root";
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = process.env.DB_PORT || 5432;

  // Connect to default 'postgres' database to create our database
  const tempSequelize = new Sequelize({
    dialect: "postgres",
    host: dbHost,
    port: dbPort,
    database: "postgres",
    username: dbUser,
    password: dbPassword,
    logging: false,
  });

  try {
    await tempSequelize.authenticate();

    // Check if database exists
    const [results] = await tempSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );

    if (results.length === 0) {
      // Database doesn't exist, create it
      await tempSequelize.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully.`);
    }
  } catch (error) {
    console.error("Error checking/creating database:", error.message);
  } finally {
    await tempSequelize.close();
  }
};

// PostgreSQL connection configuration
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "voting_system",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",

  // Connection pool configuration
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  // Logging
  logging: false,

  // Timezone
  timezone: "+00:00",

  // Define options
  define: {
    freezeTableName: true,
    timestamps: false,
  },
});

// Test connection
const testConnection = async () => {
  try {
    // First, ensure database exists
    await createDatabaseIfNotExists();

    // Then connect to it
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established successfully.");

    // Add BlockchainId columns if they don't exist
    try {
      await sequelize.query(
        'ALTER TABLE "CandidateInfo" ADD COLUMN IF NOT EXISTS "BlockchainId" INTEGER;'
      );
      await sequelize.query(
        'ALTER TABLE "PartyInfo" ADD COLUMN IF NOT EXISTS "BlockchainId" INTEGER;'
      );
      console.log("✅ Database schema updated (BlockchainId columns added).");
    } catch (schemaError) {
      // Ignore if columns already exist
      console.log("Database schema check completed.");
    }
  } catch (error) {
    console.error("❌ Unable to connect to PostgreSQL:", error);
    process.exit(1);
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
