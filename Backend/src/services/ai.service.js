const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

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
 * Gemini-native JSON schema for resume HTML generation
 */
const resumePdfSchema = {
  type: "object",
  properties: {
    html: {
      type: "string",
      description:
        "Complete clean HTML document for an ATS-friendly professional resume",
    },
  },
  required: ["html"],
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
    const maxAttempts = MODELS.length;

    while (attempts < maxAttempts) {
      try {
        const model = MODELS[attempts];
        console.log(`Trying model: ${model}`);

        response = await ai.models.generateContent({
          model,
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
        await new Promise((res) => setTimeout(res, 10000 * attempts)); // 10s, 20s
      }
    }

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (error) {
    console.error("AI Error:", error.message);
    throw new Error("Failed to generate interview report");
  }
};

/**
 * @desc Convert HTML content into PDF buffer using Puppeteer
 * @param {string} htmlContent - Resume HTML content
 * @returns {Buffer} PDF buffer
 */
const generatePdfFromHtml = async (htmlContent) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        right: "14mm",
        bottom: "18mm",
        left: "14mm",
      },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("PDF generation error:", error.message);
    throw new Error("Failed to generate PDF");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * @desc Generate ATS-friendly tailored resume PDF using Gemini + Puppeteer
 * @param {string} resume - Existing resume text
 * @param {string} selfDescription - Candidate self description
 * @param {string} jobDescription - Target job description
 * @returns {Buffer} PDF buffer
 */
const generateResumePdf = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  try {
    const prompt = `
You are an expert resume writer and ATS optimization specialist.

Create a professional ATS-friendly resume tailored specifically for the given job description.

Rules:
- Return ONLY valid JSON matching the schema.
- Generate a complete HTML document inside the "html" field.
- The resume should look professional, clean, and simple.
- The resume should be ATS-friendly and easy to parse.
- Avoid complicated layouts, tables, heavy graphics, or images.
- Use readable sections such as Summary, Skills, Experience, Projects, Education.
- Tailor the wording to the target job description.
- Highlight relevant skills and experience.
- Make it sound human-written, not AI-generated.
- Keep it ideally 1 to 2 pages when converted to PDF.
- Use simple inline CSS inside the HTML.
- Do not include markdown.
- Do not wrap the HTML in code fences.

Truthfulness rules:
- Do NOT invent personal information.
- Do NOT invent candidate name, phone number, email, LinkedIn, GitHub, address, company names, university names, dates, job titles, or experience.
- Use only information provided in the resume text and self-description.
- If personal information is missing, omit that section completely instead of using placeholders.
- If experience details are missing, do not create fake companies or fake roles.
- You may improve wording, formatting, and relevance, but you must not fabricate facts.
- If the candidate lacks a skill from the job description, do not add it as an existing skill. Only highlight related transferable skills.

--- EXISTING RESUME TEXT ---
${resume || "Resume not provided"}

--- SELF DESCRIPTION ---
${selfDescription || "Self description not provided"}

--- TARGET JOB DESCRIPTION ---
${jobDescription}
`;

    let response;
    let attempts = 0;
    const maxAttempts = MODELS.length;

    while (attempts < maxAttempts) {
      try {
        const model = MODELS[attempts];
        console.log(`Trying model for resume PDF: ${model}`);

        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: resumePdfSchema,
          },
        });
        break;
      } catch (err) {
        attempts++;
        console.warn(`Resume PDF attempt ${attempts} failed:`, err.message);
        if (attempts === maxAttempts) throw err;
        await new Promise((res) => setTimeout(res, 10000 * attempts));
      }
    }

    const parsed = JSON.parse(response.text);

    if (!parsed.html) {
      throw new Error("AI did not return resume HTML");
    }

    const pdfBuffer = await generatePdfFromHtml(parsed.html);
    return pdfBuffer;
  } catch (error) {
    console.error("Resume PDF AI error:", error.message);
    throw new Error("Failed to generate resume PDF");
  }
};

module.exports = {
  generateInterviewReport,
  generateResumePdf,
  generatePdfFromHtml,
};
