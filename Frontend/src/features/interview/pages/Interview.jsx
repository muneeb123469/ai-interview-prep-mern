import "../../../style/interview.scss";

const dummyReport = {
  title: "Junior MERN Stack Developer",
  matchScore: 78,
  technicalQuestions: [
    {
      question:
        "How would you design a secure authentication flow using Node.js, Express, MongoDB, JWT, and cookies?",
      intention:
        "To test your understanding of real-world authentication and protected APIs.",
      answer:
        "Explain registration, password hashing with bcrypt, JWT generation, storing tokens in HTTP-only cookies, auth middleware, protected routes, and secure logout using token blacklist.",
    },
    {
      question:
        "What is the difference between React Context API and Redux or Zustand?",
      intention: "To check your frontend state management understanding.",
      answer:
        "Context API is useful for small to medium global state like authentication, while Redux/Zustand are better for complex application-wide state with more predictable updates and better developer tooling.",
    },
  ],
  behavioralQuestions: [
    {
      question:
        "Tell me about a time you faced a difficult bug while building a MERN project.",
      intention:
        "To evaluate problem-solving, debugging, and communication skills.",
      answer:
        "Use the STAR method. Explain the situation, the bug, the debugging steps, how you fixed it, and what you learned.",
    },
    {
      question:
        "How do you handle learning a technology that is required for a job but you are not strong in yet?",
      intention: "To test adaptability and learning mindset.",
      answer:
        "Explain your learning plan: documentation, small practice projects, tutorials, asking seniors, and applying the skill in real features.",
    },
  ],
  skillGaps: [
    { skill: "TypeScript", severity: "high" },
    { skill: "Unit Testing", severity: "medium" },
    { skill: "Redux/Zustand", severity: "medium" },
    { skill: "Deployment", severity: "low" },
  ],
  preparationPlan: [
    {
      day: 1,
      focus: "React and JavaScript revision",
      tasks: [
        "Revise React hooks and component lifecycle",
        "Practice JavaScript ES6+ concepts",
        "Build a small form with validation",
      ],
    },
    {
      day: 2,
      focus: "Backend APIs and authentication",
      tasks: [
        "Revise Express routes and controllers",
        "Practice JWT authentication flow",
        "Test APIs using Postman",
      ],
    },
    {
      day: 3,
      focus: "MongoDB and Mongoose",
      tasks: [
        "Practice schema design",
        "Revise CRUD operations",
        "Understand references and population",
      ],
    },
  ],
};

function Interview() {
  const report = dummyReport;

  return (
    <main className="interview-page">
      <div className="interview-container">
        <nav className="interview-nav">
          <div className="report-title">
            <h1>{report.title}</h1>
            <p>Your personalized AI-generated interview preparation report.</p>
          </div>

          <button className="download-btn" type="button">
            ↓ Download Resume
          </button>
        </nav>

        <section className="match-card">
          <span>Match Score</span>
          <strong>{report.matchScore}%</strong>
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

              {report.technicalQuestions.map((item, index) => (
                <article className="question-card" key={index}>
                  <h3>{item.question}</h3>
                  <div className="meta">Why they ask: {item.intention}</div>
                  <p>{item.answer}</p>
                </article>
              ))}
            </section>

            <section className="report-section" id="behavioral">
              <div className="section-heading">
                <h2>Behavioral Questions</h2>
                <p>
                  Practice these to communicate your experience with confidence.
                </p>
              </div>

              {report.behavioralQuestions.map((item, index) => (
                <article className="question-card" key={index}>
                  <h3>{item.question}</h3>
                  <div className="meta">Why they ask: {item.intention}</div>
                  <p>{item.answer}</p>
                </article>
              ))}
            </section>

            <section className="report-section" id="roadmap">
              <div className="section-heading">
                <h2>Preparation Road Map</h2>
                <p>A focused day-by-day plan to close your gaps.</p>
              </div>

              {report.preparationPlan.map((day) => (
                <article className="day-card" key={day.day}>
                  <h3>
                    Day {day.day}: {day.focus}
                  </h3>
                  <ul>
                    {day.tasks.map((task, index) => (
                      <li key={index}>{task}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>
          </section>

          <aside className="skill-panel">
            <h3>Skill Gaps</h3>

            <div className="skill-list">
              {report.skillGaps.map((gap, index) => (
                <div className="skill-item" key={index}>
                  <span className="skill-name">{gap.skill}</span>
                  <span className={`severity ${gap.severity}`}>
                    {gap.severity}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Interview;
