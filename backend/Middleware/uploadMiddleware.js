const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../uploads");
const candidatesDir = path.join(uploadDir, "candidates");
const partiesDir = path.join(uploadDir, "parties");

[uploadDir, candidatesDir, partiesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for candidate images
const candidateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, candidatesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "candidate-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for party logos
const partyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, partiesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "party-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept images - VERY LENIENT
const imageFilter = function (req, file, cb) {
  console.log("📎 File received:", {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  // If no file or empty, skip it
  if (!file || !file.originalname || file.size === 0) {
    console.log("⏭️  Skipping empty file field");
    return cb(null, false); // Skip this file
  }

  // Accept all common image formats and variations
  const allowedExtensions = /jpeg|jpg|png|gif|webp|bmp|svg|ico|tiff|tif/i;
  const allowedMimeTypes = /^image\//i; // Accept anything starting with "image/"

  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedMimeTypes.test(file.mimetype);

  // Accept if EITHER extension OR mimetype matches (very lenient)
  if (mimetype || extname) {
    console.log("✅ File accepted:", file.originalname, `(${file.mimetype})`);
    return cb(null, true);
  } else {
    // Even if validation fails, log warning but ACCEPT the file anyway
    console.log(
      "⚠️  File type unclear but accepting anyway:",
      file.originalname,
      `(${file.mimetype})`,
    );
    return cb(null, true); // Accept it anyway!
  }
};

// Multer configurations
const uploadCandidateImage = multer({
  storage: candidateStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (increased)
  fileFilter: imageFilter,
}).fields([
  { name: "candidate_photo", maxCount: 1 },
  { name: "party_logo", maxCount: 1 },
]);

const uploadPartyLogo = multer({
  storage: partyStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (increased)
  fileFilter: imageFilter,
}).single("party_logo");

module.exports = {
  uploadCandidateImage,
  uploadPartyLogo,
};
