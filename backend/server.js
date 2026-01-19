require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { spawn } = require("child_process");
const app = express();
const startServer = require("./config/startServer");
const { testBlockchainConnection } = require("./config/blockchain");
const routes = require("./Routes");

// Global variable to store the Python process
let faceApiProcess = null;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for photo uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Voting System Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      voters: "/api/voters",
      candidates: "/api/candidates",
      vote: "/api/vote",
      results: "/api/votes/results",
    },
  });
});

// Function to start Face Recognition API
function startFaceRecognitionAPI() {
  const faceApiPath = path.join(
    __dirname,
    "..",
    "face_recognition_using_Opencv"
  );
  const pythonScript = path.join(faceApiPath, "face_recognition_api.py");

  console.log("\n🚀 Starting Face Recognition API...");
  console.log(`📂 Face API Path: ${faceApiPath}`);
  console.log(`🐍 Python Script: ${pythonScript}`);

  // Try python command first, falls back if needed
  faceApiProcess = spawn("python", [pythonScript], {
    cwd: faceApiPath,
    stdio: ["ignore", "pipe", "pipe"],
  });

  faceApiProcess.stdout.on("data", (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`[Face API] ${output}`);
    }
  });

  faceApiProcess.stderr.on("data", (data) => {
    const output = data.toString().trim();
    if (
      output &&
      !output.includes("WARNING") &&
      !output.includes("Restarting with")
    ) {
      console.error(`[Face API] ${output}`);
    }
  });

  faceApiProcess.on("close", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Face Recognition API exited with code ${code}`);
      console.log("💡 Tip: Ensure Python and all dependencies are installed:");
      console.log(
        "   pip install flask flask-cors waitress face_recognition opencv-python dlib"
      );
    }
  });

  faceApiProcess.on("error", (error) => {
    console.error("❌ Failed to start Face Recognition API:", error.message);
    console.log("💡 Make sure Python is installed and in your system PATH");
    console.log("💡 You can verify with: python --version");
  });

  // Give the Python process a moment to start
  setTimeout(() => {
    console.log("✅ Face Recognition API started on http://localhost:5001");
  }, 2000);
}

// Graceful shutdown handler
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down servers...");

  if (faceApiProcess) {
    console.log("Stopping Face Recognition API...");
    faceApiProcess.kill();
  }

  process.exit(0);
});

process.on("SIGTERM", () => {
  if (faceApiProcess) {
    faceApiProcess.kill();
  }
  process.exit(0);
});

// Start server with blockchain connection test
startServer(app, async () => {
  // Start Face Recognition API first
  startFaceRecognitionAPI();

  // Test blockchain connection after DB is connected
  // try {
  //   await testBlockchainConnection();
  // } catch (error) {
  //   console.error("⚠️  Blockchain connection test failed:", error.message);
  //   console.log(
  //     "⚠️  Server will continue running without blockchain verification"
  //   );
  // }
});
