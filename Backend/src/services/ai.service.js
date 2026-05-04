const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

/**
 * Zod schema for structured AI output
 */
const interviewReportSchema = z.object({
  title: z.string().describe("Job title"),
  matchScore: z.number().describe("Score between 0 and 100"),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),
});

/**
 * Generate Interview Report using Gemini AI
 */
const generateInterviewReport = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  try {
    const prompt = `
You are an expert interview coach.

Analyze the following candidate profile and job description.

Return:
- matchScore (0-100)
- technicalQuestions (with intention + answer)
- behavioralQuestions (with intention + answer)
- skillGaps (with severity)
- preparationPlan (day-wise)

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(interviewReportSchema),
      },
    });

    const parsed = JSON.parse(response.text);

    /**
     * 🔥 Strong parser for messy AI output
     */
    const safeParse = (item) => {
      if (typeof item !== "string") return item;

      try {
        const cleaned = item.replace(/,\s*$/, "").replace(/`/g, ""); // remove backticks

        return JSON.parse(cleaned);
      } catch {
        return item;
      }
    };

    const fixArray = (arr = []) => arr.map(safeParse);

    parsed.technicalQuestions = fixArray(parsed.technicalQuestions);
    parsed.behavioralQuestions = fixArray(parsed.behavioralQuestions);
    parsed.skillGaps = fixArray(parsed.skillGaps);
    parsed.preparationPlan = fixArray(parsed.preparationPlan);

    return parsed;
  } catch (error) {
    console.error("AI Error:", error.message);
    throw new Error("Failed to generate interview report");
  }
};

module.exports = {
  generateInterviewReport,
};
