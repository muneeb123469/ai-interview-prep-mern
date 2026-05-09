import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useInterview from "../hooks/useInterview";
import "../../../style/interview.scss";

function Interview() {
  const { interviewId } = useParams();
  const { loading, report, getReportById, getResumePdf } = useInterview();

  useEffect(() => {
    if (interviewId) {
      getReportById({ interviewId });
    }
  }, [interviewId]);

  const handleDownloadResume = async () => {
    await getResumePdf({
      interviewReportId: interviewId,
    });
  };

  if (loading && !report) {
    return (
      <main className="interview-page">
        <div className="interview-container">
          <div className="report-content">
            <p>Loading interview report...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="interview-page">
        <div className="interview-container">
          <div className="report-content">
            <h2>Report not found</h2>
            <p>
              This interview report does not exist or you do not have access.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const technicalQuestions = report.technicalQuestions || [];
  const behavioralQuestions = report.behavioralQuestions || [];
  const skillGaps = report.skillGaps || [];
  const preparationPlan = report.preparationPlan || [];

  return (
    <main className="interview-page">
      <div className="interview-container">
        <nav className="interview-nav">
          <div className="report-title">
            <h1>{report.title || "Interview Report"}</h1>
            <p>Your personalized AI-generated interview preparation report.</p>
          </div>

          <button
            className="download-btn"
            type="button"
            onClick={handleDownloadResume}
            disabled={loading}
          >
            ↓ {loading ? "Preparing..." : "Download Resume"}
          </button>
        </nav>

        <section className="match-card">
          <span>Match Score</span>
          <strong>{report.matchScore || 0}%</strong>
        </section>

        <div className="interview-layout">
          <aside className="interview-sidebar">
            <h3>Sections</h3>
            <a href="#technical">Technical Questions</a>
            <a href="#behavioral">Behavioral Questions</a>
            <a href="#roadmap">Road Map</a>
          </aside>

          <section className="report-content">
            <section className="report-section" id="technical">
              <div className="section-heading">
                <h2>Technical Questions</h2>
                <p>
                  Role-specific questions you should prepare before the
                  interview.
                </p>
              </div>

              {technicalQuestions.length === 0 ? (
                <p>No technical questions available.</p>
              ) : (
                technicalQuestions.map((item, index) => (
                  <article className="question-card" key={index}>
                    <h3>{item.question}</h3>
                    <div className="meta">Why they ask: {item.intention}</div>
                    <p>{item.answer}</p>
                  </article>
                ))
              )}
            </section>

            <section className="report-section" id="behavioral">
              <div className="section-heading">
                <h2>Behavioral Questions</h2>
                <p>
                  Practice these to communicate your experience with confidence.
                </p>
              </div>

              {behavioralQuestions.length === 0 ? (
                <p>No behavioral questions available.</p>
              ) : (
                behavioralQuestions.map((item, index) => (
                  <article className="question-card" key={index}>
                    <h3>{item.question}</h3>
                    <div className="meta">Why they ask: {item.intention}</div>
                    <p>{item.answer}</p>
                  </article>
                ))
              )}
            </section>

            <section className="report-section" id="roadmap">
              <div className="section-heading">
                <h2>Preparation Road Map</h2>
                <p>A focused day-by-day plan to close your gaps.</p>
              </div>

              {preparationPlan.length === 0 ? (
                <p>No preparation plan available.</p>
              ) : (
                preparationPlan.map((day, index) => (
                  <article className="day-card" key={index}>
                    <h3>
                      Day {day.day}: {day.focus}
                    </h3>

                    <ul>
                      {(day.tasks || []).map((task, taskIndex) => (
                        <li key={taskIndex}>{task}</li>
                      ))}
                    </ul>
                  </article>
                ))
              )}
            </section>
          </section>

          <aside className="skill-panel">
            <h3>Skill Gaps</h3>

            <div className="skill-list">
              {skillGaps.length === 0 ? (
                <p>No skill gaps available.</p>
              ) : (
                skillGaps.map((gap, index) => (
                  <div className="skill-item" key={index}>
                    <span className="skill-name">{gap.skill}</span>
                    <span className={`severity ${gap.severity}`}>
                      {gap.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Interview;
