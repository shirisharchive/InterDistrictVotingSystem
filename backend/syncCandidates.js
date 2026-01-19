const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";

async function syncCandidates() {
  try {
    console.log("🔄 Syncing candidates to blockchain...\n");

    const response = await axios.post(
      `${API_BASE_URL}/candidates/sync-blockchain`
    );

    console.log("✅ Response:", response.data);
    console.log("\n📊 Summary:");
    console.log(`   - Synced: ${response.data.synced}`);
    console.log(`   - Failed: ${response.data.failed}`);

    if (response.data.results && response.data.results.length > 0) {
      console.log("\n📋 Details:");
      response.data.results.forEach((result) => {
        if (result.success) {
          console.log(
            `   ✅ ${result.name} (ID: ${result.candidateId}) -> Blockchain ID: ${result.blockchainId}`
          );
        } else {
          console.log(
            `   ❌ ${result.name} (ID: ${result.candidateId}) -> Error: ${result.error}`
          );
        }
      });
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Error:", error.response.data);
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

// Check if axios is available
try {
  syncCandidates();
} catch (error) {
  console.error(
    "❌ Make sure the backend server is running on http://localhost:5000"
  );
  console.error("   Run: npm start");
}
