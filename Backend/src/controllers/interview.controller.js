const mongoose = require("mongoose");
const InterviewReportModel = require("../models/interviewReport.model");
const {
  generateInterviewReport,
  generateResumePdf,
  generatePdfFromHtml,
} = require("../services/ai.service");
const pdfParse = require("pdf-parse");

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
      resume: resumeText,
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

    // Guard against invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

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

/**
 * @desc   Builds an improved fallback resume HTML when AI quota is exhausted.
 *         Produces a proper resume layout instead of a report summary.
 * @param  {object} report - The interview report document from MongoDB
 * @returns {string} HTML string
 */
const buildFallbackResumeHtml = (report) => {
  const skillGaps = report.skillGaps || [];
  const resumeLines = (report.resume || report.resumeText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const candidateName = resumeLines[0] || "Candidate";
  const contactLine = resumeLines[1] || "";

  // Build experience/content lines skipping name and contact
  const bodyLines = resumeLines.slice(2);

  const bodyHtml = bodyLines
    .map((line) => {
      if (line.startsWith("•") || line.startsWith("-")) {
        return `<ul><li>${line.replace(/^[•\-]\s*/, "")}</li></ul>`;
      }
      // Detect section headers (all caps or ends with colon)
      if (line === line.toUpperCase() && line.length > 3) {
        return `<h2>${line}</h2>`;
      }
      return `<p>${line}</p>`;
    })
    .join("");

  const skillGapsHtml = skillGaps
    .map((gap) => {
      const colorMap = {
        high: "#c0392b",
        medium: "#e67e22",
        low: "#27ae60",
      };
      const color = colorMap[gap.severity] || "#333";
      return `<li style="color:${color}"><strong>${gap.skill}</strong> — Priority: ${gap.severity}</li>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Resume – ${candidateName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            color: #222;
            line-height: 1.6;
            padding: 36px 48px;
            font-size: 13px;
          }
          h1 {
            font-size: 24px;
            color: #1a1a2e;
            margin-bottom: 2px;
          }
          .contact {
            color: #555;
            font-size: 12px;
            margin-bottom: 6px;
          }
          .match-badge {
            display: inline-block;
            background: #e8f5e9;
            color: #2e7d32;
            padding: 2px 12px;
            border-radius: 12px;
            font-size: 12px;
            margin-bottom: 18px;
          }
          h2 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #1a1a2e;
            border-bottom: 1.5px solid #1a1a2e;
            padding-bottom: 3px;
            margin: 18px 0 8px;
          }
          p { margin-bottom: 5px; }
          ul {
            padding-left: 18px;
            margin-bottom: 4px;
          }
          li { margin-bottom: 3px; }
          .summary {
            color: #444;
            margin-bottom: 6px;
            font-style: italic;
          }
          .skill-gaps-note {
            font-size: 11px;
            color: #888;
            margin-bottom: 6px;
          }
        </style>
      </head>
      <body>

        <h1>${candidateName}</h1>
        <p class="contact">${contactLine}</p>
        <span class="match-badge">
          Match Score: ${report.matchScore || 0}% — ${report.title || "Target Role"}
        </span>

        ${
          report.selfDescription
            ? `<h2>Professional Summary</h2>
               <p class="summary">${report.selfDescription}</p>`
            : ""
        }

        ${bodyHtml}

        ${
          skillGaps.length > 0
            ? `<h2>Skills to Develop for This Role</h2>
               <p class="skill-gaps-note">
                 These skills are required by the job description and should be prioritized:
               </p>
               <ul>${skillGapsHtml}</ul>`
            : ""
        }

      </body>
    </html>
  `;
};

/**
 * Converts any text into a safe filename.
 * Example: "Senior Full Stack Developer" -> "senior-full-stack-developer"
 */
const sanitizeFileName = (value = "resume") => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * @desc   Generate and download ATS-friendly resume PDF
 * @route  POST /api/interview/resume/pdf/:interviewReportId
 * @access Private
 */
const generateResumePdfController = async (req, res) => {
  try {
    const { interviewReportId } = req.params;

    // Guard against invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(interviewReportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await InterviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user._id,
    }).populate("user", "username");

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    let pdfBuffer;

    try {
      // First try AI-powered resume generation
      pdfBuffer = await generateResumePdf({
        resume: report.resume || report.resumeText || "",
        selfDescription: report.selfDescription || "",
        jobDescription: report.jobDescription || "",
      });
    } catch (aiError) {
      // If Gemini quota is exhausted, use improved fallback
      console.warn("AI resume generation failed. Using fallback PDF.");
      const fallbackHtml = buildFallbackResumeHtml(report);
      pdfBuffer = await generatePdfFromHtml(fallbackHtml);
    }

    res.setHeader("Content-Type", "application/pdf");
    const username = sanitizeFileName(req.user.username || "candidate");
    const jobTitle = sanitizeFileName(report.title || "target-role");

    const fileName = `${username}_${jobTitle}_resume.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Generate resume PDF error:", error);

    return res.status(500).json({
      message: "Failed to generate resume PDF",
    });
  }
};

module.exports = {
  generateInterviewReportController,
  getAllInterviewReportsController,
  getInterviewReportByIdController,
  generateResumePdfController,
};
