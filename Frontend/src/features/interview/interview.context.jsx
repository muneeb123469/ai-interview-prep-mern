import { createContext, useState } from "react";

export const InterviewContext = createContext(null);

/**
 * InterviewProvider stores interview report state globally.
 * It helps Home and Interview pages share report data.
 */
export const InterviewProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);

  const value = {
    loading,
    setLoading,
    report,
    setReport,
    reports,
    setReports,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
