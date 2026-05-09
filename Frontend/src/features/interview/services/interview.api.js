import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

/**
 * Generate a new interview report.
 * Sends resume PDF, self-description, and job description to backend.
 *
 * @param {{ resume?: File, selfDescription: string, jobDescription: string }} payload
 */
export const generateInterviewReport = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  const formData = new FormData();

  if (resume) {
    formData.append("resume", resume);
  }

  formData.append("selfDescription", selfDescription);
  formData.append("jobDescription", jobDescription);

  const response = await api.post("/api/interview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Fetch all interview reports of the logged-in user.
 */
export const getInterviewReports = async () => {
  const response = await api.get("/api/interview/reports");

  return response.data;
};

/**
 * Fetch one interview report by ID.
 *
 * @param {{ interviewId: string }} payload
 */
export const getInterviewReportById = async ({ interviewId }) => {
  const response = await api.get(`/api/interview/report/${interviewId}`);

  return response.data;
};

/**
 * Generate and download tailored resume PDF.
 *
 * @param {{ interviewReportId: string }} payload
 */
export const generateResumePdf = async ({ interviewReportId }) => {
  const response = await api.post(
    `/api/interview/resume/pdf/${interviewReportId}`,
    {},
    {
      responseType: "blob",
    },
  );

  return response.data;
};
