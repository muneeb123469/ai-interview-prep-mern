const mongoose = require("mongoose");

/**
 * Sub-schema: Technical Question
 */
const technicalQuestionSchema = new mongoose.Schema(
  {
    question: String,
    intention: String,
    answer: String,
  },
  { _id: false },
);

/**
 * Sub-schema: Behavioral Question
 */
const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: String,
    intention: String,
    answer: String,
  },
  { _id: false },
);

/**
 * Sub-schema: Skill Gap
 */
const skillGapSchema = new mongoose.Schema(
  {
    skill: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
    },
  },
  { _id: false },
);

/**
 * Sub-schema: Preparation Plan
 */
const preparationPlanSchema = new mongoose.Schema(
  {
    day: Number,
    focus: String,
    tasks: [String],
  },
  { _id: false },
);

/**
 * Main Interview Report Schema
 */
const interviewReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    title: {
      type: String,
      default: "Interview Report",
    },

    jobDescription: String,
    resume: String,
    selfDescription: String,

    matchScore: Number,

    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
  },
  {
    timestamps: true,
  },
);

const InterviewReportModel = mongoose.model(
  "interviewReports",
  interviewReportSchema,
);

module.exports = InterviewReportModel;
