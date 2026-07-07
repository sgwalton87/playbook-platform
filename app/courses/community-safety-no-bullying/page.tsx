"use client";

import { COMMUNITY_SAFETY_COURSE } from "@/lib/courses/communitySafetyCourse";

export default function CommunitySafetyCoursePage() {
  const course = COMMUNITY_SAFETY_COURSE;

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Required Course · {course.minutes} minutes · {course.points} points</p>
        <h1 style={title}>{course.title}</h1>
        <p style={lead}>{course.summary}</p>
      </section>

      <section style={grid}>
        {course.modules.map((module, i) => (
          <article key={module.title} style={card}>
            <p style={eyebrow}>Module {i + 1}</p>
            <h2>{module.title}</h2>
            <p>{module.lesson}</p>
            <div style={reflection}>
              <strong>Reflection:</strong> {module.reflection}
            </div>
          </article>
        ))}
      </section>

      <section style={card}>
        <p style={eyebrow}>Knowledge Check</p>
        <h2>Quick Quiz</h2>
        {course.quiz.map((q, i) => (
          <div key={q.question} style={quizItem}>
            <strong>{i + 1}. {q.question}</strong>
            <ul>
              {q.choices.map((choice) => (
                <li key={choice}>{choice}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F8F7F4",
  color: "#0F172A",
  padding: 24,
};

const hero: React.CSSProperties = {
  background: "#0F172A",
  color: "#F8F7F4",
  borderRadius: 34,
  padding: "clamp(34px,6vw,80px)",
  marginBottom: 20,
};

const eyebrow: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: "#F97316",
  fontWeight: 900,
};

const title: React.CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  fontSize: "clamp(48px,8vw,92px)",
  lineHeight: .9,
  textTransform: "uppercase",
  margin: "10px 0",
};

const lead: React.CSSProperties = {
  fontSize: 22,
  lineHeight: 1.45,
  maxWidth: 900,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: 16,
};

const card: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 24,
  padding: 24,
  marginBottom: 16,
};

const reflection: React.CSSProperties = {
  background: "#FFF7ED",
  border: "1px solid #FED7AA",
  borderRadius: 16,
  padding: 14,
  marginTop: 14,
};

const quizItem: React.CSSProperties = {
  borderTop: "1px solid #E2E8F0",
  padding: "16px 0",
};
