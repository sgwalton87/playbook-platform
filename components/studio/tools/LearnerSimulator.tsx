"use client";

import { generateDemoLearner } from "@/lib/studio/tools";

export default function LearnerSimulator() {
  const learner = generateDemoLearner();

  return (
    <main style={page}>
      <p style={eyebrow}>Learner Simulator</p>
      <h1 style={pageTitle}>Generate a realistic demo learner.</h1>

      <section style={card}>
        <p style={eyebrow}>Generated learner</p>
        <h2 style={title}>{learner.name}</h2>
        <p style={body}>Grade {learner.gradeLevel} • {learner.pathway}</p>
        <strong style={score}>{learner.trustScore}% Trust</strong>

        <div style={grid}>
          <div>
            <h3>Courses</h3>
            {learner.courses.map(course => <p key={course.name} style={item}>{course.name} • {course.grade}</p>)}
          </div>
          <div>
            <h3>Achievements</h3>
            {learner.achievements.map(achievement => <p key={achievement} style={item}>{achievement}</p>)}
          </div>
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 16px 40px rgba(15,23,42,.06)"};
const grid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginTop:18};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0 22px"};
const title: React.CSSProperties = {fontSize:30,color:"#0F172A",margin:"8px 0"};
const body: React.CSSProperties = {fontSize:14,color:"#64748B"};
const score: React.CSSProperties = {display:"inline-flex",background:"#DCFCE7",color:"#166534",borderRadius:999,padding:"8px 11px",fontSize:13};
const item: React.CSSProperties = {border:"1px solid #E2E8F0",borderRadius:12,padding:10,color:"#0F172A"};
