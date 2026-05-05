const express = require("express");
const authUser = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");

const {
  generateInterviewReportController,
  getAllInterviewReportsController,
  getInterviewReportByIdController,
  generateResumePdfController,
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

router.get("/reports", authUser, getAllInterviewReportsController);

router.get("/report/:interviewId", authUser, getInterviewReportByIdController);

router.post(
  "/resume/pdf/:interviewReportId",
  authUser,
  generateResumePdfController,
);

module.exports = router;
