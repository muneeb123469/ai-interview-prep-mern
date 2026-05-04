const multer = require("multer");

/**
 * Store file in memory (not disk)
 */
const storage = multer.memoryStorage();

/**
 * File filter (only PDF allowed)
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
  fileFilter,
});

module.exports = upload;
