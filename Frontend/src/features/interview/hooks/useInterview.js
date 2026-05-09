import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/auth.context";
import { InterviewContext } from "../interview.context";
import {
  generateInterviewReport,
  getInterviewReports,
  getInterviewReportById,
  generateResumePdf,
} from "../services/interview.api";

/**
 * Converts text into a safe file name.
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
 * Custom hook for interview report logic.
 * It connects API layer with Interview Context state.
 */
const useInterview = () => {
  const { loading, setLoading, report, setReport, reports, setReports } =
    useContext(InterviewContext);

  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext);
  /**
   * Generate a new AI interview report.
   */
  const generateReport = async ({
    resume,
    selfDescription,
    jobDescription,
  }) => {
    try {
      setLoading(true);

      const data = await generateInterviewReport({
        resume,
        selfDescription,
        jobDescription,
      });

      setReport(data.interviewReport);

      navigate(`/interview/${data.interviewReport._id}`);

      return data.interviewReport;
    } catch (error) {
      alert(error.response?.data?.message || "Failed to generate report");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch all previous reports of logged-in user.
   */
  const getReports = async () => {
    try {
      setLoading(true);

      const data = await getInterviewReports();

      setReports(data.reports || []);

      return data.reports || [];
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch reports");
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch one report by ID.
   */
  const getReportById = async ({ interviewId }) => {
    try {
      setLoading(true);

      const data = await getInterviewReportById({ interviewId });

      setReport(data.interviewReport);

      return data.interviewReport;
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch report");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download ATS-friendly resume PDF.
   */
  const getResumePdf = async ({ interviewReportId }) => {
    try {
      setLoading(true);

      const pdfBlob = await generateResumePdf({ interviewReportId });

      const blob = new Blob([pdfBlob], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const username = sanitizeFileName(authUser?.username || "candidate");
      const jobTitle = sanitizeFileName(report?.title || "target-role");

      link.download = `${username}_${jobTitle}_resume.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to download resume PDF");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    report,
    reports,
    generateReport,
    getReports,
    getReportById,
    getResumePdf,
  };
};

export default useInterview;
