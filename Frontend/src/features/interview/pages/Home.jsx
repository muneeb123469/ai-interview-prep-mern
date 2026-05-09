import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import useAuth from "../../auth/hooks/useAuth";
import useInterview from "../hooks/useInterview";

import "../../../style/Home.scss";

function Home() {
  const { user, handleLogout } = useAuth();
  const { loading, reports, generateReport, getReports } = useInterview();

  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resume, setResume] = useState(null);

  useEffect(() => {
    getReports();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      event.target.value = "";
      return;
    }

    setResume(file);
  };

  const submitHandler = async () => {
    if (!jobDescription.trim()) {
      alert("Job description is required");
      return;
    }

    if (!resume && !selfDescription.trim()) {
      alert("Please upload a resume or add a self-description");
      return;
    }

    await generateReport({
      resume,
      selfDescription,
      jobDescription,
    });
  };

  return (
    <main className="home-page">
      <div className="home-container">
        <header className="home-topbar">
          <div>
            <span>Logged in as</span>
            <strong>{user?.username || "User"}</strong>
          </div>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <section className="home-hero">
          <span className="eyebrow">AI-Powered Career Preparation</span>
          <h1>
            Create Your Custom <span>Interview Plan</span>
          </h1>
          <p>
            Upload your resume, paste a target job description, and let AI build
            a personalized interview strategy with skill gaps, questions, and a
            preparation roadmap.
          </p>
        </section>

        <section className="strategy-card">
          <div className="strategy-grid">
            <div className="strategy-panel">
              <h2>Target Job Description</h2>
              <p className="panel-subtitle">
                Paste the complete job description so the AI can understand the
                exact role requirements.
              </p>

              <div className="field-label">
                <span>Job Description</span>
                <span className="required">Required</span>
              </div>

              <textarea
                className="home-textarea"
                maxLength={5000}
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />

              <p className="char-count">{jobDescription.length} / 5000 chars</p>
            </div>

            <div className="strategy-panel">
              <h2>Your Profile</h2>
              <p className="panel-subtitle">
                Add your resume and a short self-description for better
                personalization.
              </p>

              <div className="upload-box">
                <input
                  id="resume"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />

                <label htmlFor="resume">
                  <span className="upload-icon">↑</span>
                  <strong>{resume ? resume.name : "Upload Resume"}</strong>
                  <span>PDF only, maximum 3MB</span>
                </label>
              </div>

              <div className="field-label">
                <span>Quick Self-Description</span>
              </div>

              <textarea
                className="home-textarea self-description"
                placeholder="Example: I am a junior MERN stack developer with React, Node.js, Express, and MongoDB project experience..."
                value={selfDescription}
                onChange={(event) => setSelfDescription(event.target.value)}
              />

              <div className="info-box">
                Add either a resume or self-description. Adding both gives the
                AI better context for your interview plan.
              </div>
            </div>
          </div>

          <div className="strategy-footer">
            <p>
              {loading
                ? "Loading your interview plan..."
                : "AI-Powered Strategy Generation · Approx 30s"}
            </p>

            <button type="button" onClick={submitHandler} disabled={loading}>
              {loading ? "Generating..." : "Generate My Interview Strategy"}
            </button>
          </div>
        </section>

        <section className="previous-reports">
          <h2>Previous Reports</h2>

          <div className="report-list">
            {reports.length === 0 ? (
              <article className="report-card">
                <div>
                  <h3>No reports yet</h3>
                  <p>Your generated reports will appear here.</p>
                </div>
              </article>
            ) : (
              reports.map((report) => (
                <article className="report-card" key={report._id}>
                  <div>
                    <h3>{report.title}</h3>
                    <p>
                      Match Score: {report.matchScore}% · Created:{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link to={`/interview/${report._id}`}>Open Report</Link>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;
