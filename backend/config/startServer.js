require("dotenv").config();
const { testConnection } = require("./database");
const contractManager = require("../contractAddressManager");

const startServer = (app, onDbConnected) => {
  app.listen(process.env.SERVER_PORT, "localhost", async (error) => {
    if (!error) {
      console.log(`Server is on`);
      console.log("Press ctrl+c to exit");
      await testConnection();

      // Verify contract address on startup
      try {
        console.log("\n" + "=".repeat(60));
        const verification = await contractManager.verifyContractAddress();
        console.log("=".repeat(60) + "\n");

        if (verification.matches === false) {
          console.log(
            "⚠️  WARNING: Consider running recovery or reset scripts"
          );
        }
      } catch (error) {
        console.error("⚠️  Could not verify contract address:", error.message);
      }

      // Call callback after DB is connected
      if (onDbConnected && typeof onDbConnected === "function") {
        onDbConnected();
      }
    } else {
      console.log("Error establishing the connection of server");
    }
  });
};

module.exports = startServer;
