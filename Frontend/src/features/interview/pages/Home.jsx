import { Link } from "react-router-dom";
import "../../../style/Home.scss";

const dummyReports = [
  {
    _id: "1",
    title: "Frontend Engineer",
    matchScore: 72,
    createdAt: "2026-05-05",
  },
  {
    _id: "2",
    title: "MERN Stack Developer",
    matchScore: 81,
    createdAt: "2026-05-04",
  },
];

function Home() {
  return (
    <main className="home-page">
      <div className="home-container">
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
              />

              <p className="char-count">0 / 5000 chars</p>
            </div>

            <div className="strategy-panel">
              <h2>Your Profile</h2>
              <p className="panel-subtitle">
                Add your resume and a short self-description for better
                personalization.
              </p>

              <div className="upload-box">
                <input id="resume" type="file" accept="application/pdf" />
                <label htmlFor="resume">
                  <span className="upload-icon">↑</span>
                  <strong>Upload Resume</strong>
                  <span>PDF only, maximum 3MB</span>
                </label>
              </div>

              <div className="field-label">
                <span>Quick Self-Description</span>
              </div>

              <textarea
                className="home-textarea self-description"
                placeholder="Example: I am a junior MERN stack developer with React, Node.js, Express, and MongoDB project experience..."
              />

              <div className="info-box">
                Add either a resume or self-description. Adding both gives the
                AI better context for your interview plan.
              </div>
            </div>
          </div>

          <div className="strategy-footer">
            <p>AI-Powered Strategy Generation · Approx 30s</p>
            <button type="button">Generate My Interview Strategy</button>
          </div>
        </section>

        <section className="previous-reports">
          <h2>Previous Reports</h2>

          <div className="report-list">
            {dummyReports.map((report) => (
              <article className="report-card" key={report._id}>
                <div>
                  <h3>{report.title}</h3>
                  <p>
                    Match Score: {report.matchScore}% · Created:{" "}
                    {report.createdAt}
                  </p>
                </div>

                <Link to={`/interview/${report._id}`}>Open Report</Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;
