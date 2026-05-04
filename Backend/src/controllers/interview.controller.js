const InterviewReportModel = require("../models/interviewReport.model");
const { generateInterviewReport } = require("../services/ai.service");
const pdfParse = require("pdf-parse");
/**
 * @desc   Dynamically imports pdf-parse (ESM-only package)
 * @returns {Function} pdfParse function
 */

/**
 * @desc   Normalizes an array field from the AI response.
 *         Guards against the AI returning arrays of strings instead of objects.
 * @param  {any} value - The raw value from the AI response
 * @returns {Array} - A safe array of objects (empty array if invalid)
 */
const safeArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item !== null && typeof item === "object");
};

/**
 * @desc   Generate interview report
 * @route  POST /api/interview
 * @access Private
 */
const generateInterviewReportController = async (req, res) => {
  try {
    const { selfDescription, jobDescription } = req.body;

    // 1. Validation
    if (!jobDescription) {
      return res.status(400).json({
        message: "Job description is required",
      });
    }

    // 2. Extract resume text from uploaded PDF
    let resumeText = "";
    if (req.file) {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } catch (pdfError) {
        console.warn("PDF parse failed:", pdfError.message);
        resumeText = "";
      }
    }

    // 3. Call AI service
    const aiReport = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });

    // 4. Validate AI response shape before saving
    if (!aiReport || typeof aiReport !== "object") {
      return res
        .status(500)
        .json({ message: "AI returned an invalid response" });
    }

    // 5. Save to database
    const report = await InterviewReportModel.create({
      user: req.user._id,
      title: aiReport.title || "Interview Report",
      jobDescription,
      resumeText,
      selfDescription,
      matchScore:
        typeof aiReport.matchScore === "number" ? aiReport.matchScore : 0,
      technicalQuestions: safeArray(aiReport.technicalQuestions),
      behavioralQuestions: safeArray(aiReport.behavioralQuestions),
      skillGaps: safeArray(aiReport.skillGaps),
      preparationPlan: safeArray(aiReport.preparationPlan),
    });

    // 6. Send response
    return res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport: report,
    });
  } catch (error) {
    console.error("Interview error:", error);
    return res.status(500).json({
      message: "Failed to generate interview report",
    });
  }
};

/**
 * @desc   Get all interview reports of logged-in user
 * @route  GET /api/interview/reports
 * @access Private
 */
const getAllInterviewReportsController = async (req, res) => {
  try {
    const reports = await InterviewReportModel.find({
      user: req.user._id,
    })
      .select("title matchScore createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Interview reports fetched successfully",
      reports,
    });
  } catch (error) {
    console.error("Get all reports error:", error);

    return res.status(500).json({
      message: "Failed to fetch interview reports",
    });
  }
};

/**
 * @desc   Get single interview report by ID
 * @route  GET /api/interview/report/:interviewId
 * @access Private
 */
const getInterviewReportByIdController = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const report = await InterviewReportModel.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    return res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReport: report,
    });
  } catch (error) {
    console.error("Get report by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch interview report",
    });
  }
};

module.exports = {
  generateInterviewReportController,
  getAllInterviewReportsController,
  getInterviewReportByIdController,
};
