const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

/**
 * Gemini-native JSON schema for structured output
 */
const interviewReportSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "The job title from the job description",
    },
    matchScore: {
      type: "number",
      description:
        "A score between 0 and 100 indicating how well the candidate matches the job",
    },
    technicalQuestions: {
      type: "array",
      description: "List of technical interview questions",
      items: {
        type: "object",
        properties: {
          question: { type: "string", description: "The technical question" },
          intention: {
            type: "string",
            description: "Why the interviewer asks this",
          },
          answer: {
            type: "string",
            description: "How the candidate should answer it",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: "array",
      description: "List of behavioral interview questions",
      items: {
        type: "object",
        properties: {
          question: { type: "string", description: "The behavioral question" },
          intention: {
            type: "string",
            description: "Why the interviewer asks this",
          },
          answer: {
            type: "string",
            description: "How the candidate should answer it",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: "array",
      description: "Skills the candidate is missing for this role",
      items: {
        type: "object",
        properties: {
          skill: { type: "string", description: "The missing skill" },
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "How critical this gap is",
          },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: "array",
      description: "A day-by-day preparation plan for the candidate",
      items: {
        type: "object",
        properties: {
          day: { type: "number", description: "Day number" },
          focus: {
            type: "string",
            description: "The main topic to focus on this day",
          },
          tasks: {
            type: "array",
            description: "List of tasks for this day",
            items: { type: "string" },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: [
    "title",
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

/**
 * @desc   Generate Interview Report using Gemini AI
 * @param  {string} resume - Extracted resume text
 * @param  {string} selfDescription - Candidate's self description
 * @param  {string} jobDescription - Target job description
 * @returns {object} Structured interview report
 */
const generateInterviewReport = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  try {
    const prompt = `
You are an expert interview coach and career advisor.

Carefully analyze the candidate profile and the job description below.
Generate a comprehensive, detailed interview preparation report.

Your response MUST include:
- title: exact job title from the job description
- matchScore: integer 0-100 based on how well the candidate fits
- technicalQuestions: at least 5 technical questions relevant to the role
- behavioralQuestions: at least 4 behavioral questions
- skillGaps: skills mentioned in the job description that the candidate lacks
- preparationPlan: a 7-day study plan with specific daily tasks

--- CANDIDATE RESUME ---
${resume || "Not provided"}

--- SELF DESCRIPTION ---
${selfDescription || "Not provided"}

--- JOB DESCRIPTION ---
${jobDescription}
`;

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema,
          },
        });
        break; // success, exit the loop
      } catch (err) {
        attempts++;
        console.warn(`Gemini attempt ${attempts} failed:`, err.message);
        if (attempts === maxAttempts) throw err;
        await new Promise((res) => setTimeout(res, 2000 * attempts)); // wait 2s, 4s
      }
    }

    const parsed = JSON.parse(response.text);

    return parsed;
  } catch (error) {
    console.error("AI Error:", error.message);
    throw new Error("Failed to generate interview report");
  }
};

module.exports = { generateInterviewReport };
