const express = require("express");
const authUser = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");

const {
  generateInterviewReportController,
} = require("../controllers/interview.controller");

const router = express.Router();

/**
 * POST /api/interview
 */
router.post(
  "/",
  authUser,
  upload.single("resume"),
  generateInterviewReportController,
);

module.exports = router;
