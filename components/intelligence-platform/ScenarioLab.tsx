"use client";

import { useMemo, useState } from "react";
import { calculateImpact, explainImpact, runScenario, type ScenarioType } from "@/lib/intelligence-platform";

const scenarios: { label: string; value: ScenarioType }[] = [
  { label: "Raise Algebra from B to A", value: "raise_grade" },
  { label: "Submit FAFSA", value: "submit_fafsa" },
  { label: "Verify Biology Evidence", value: "verify_evidence" },
  { label: "Complete Internship", value: "complete_internship" },
  { label: "Add Mentor", value: "add_mentor" },
];

export default function ScenarioLab() {
  const [selected, setSelected] = useState<ScenarioType>("submit_fafsa");

  const scenario = useMemo(() => runScenario(selected), [selected]);
  const impact = useMemo(() => calculateImpact(scenario.changes), [scenario]);
  const explanation = useMemo(() => explainImpact({
    scenarioTitle: scenario.title,
    scholarshipImpact: impact.scholarshipImpact,
    totalSignalGain: impact.totalSignalGain,
  }), [scenario, impact]);

  return (
    <section style={card}>
      <p style={eyebrow}>Scenario Lab</p>
      <h2 style={title}>What if?</h2>

      <div style={buttons}>
        {scenarios.map((item) => (
          <button
            key={item.value}
            onClick={() => setSelected(item.value)}
            style={{
              ...button,
              background: selected === item.value ? "#0F172A" : "#fff",
              color: selected === item.value ? "#fff" : "#0F172A",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ImpactPreview impact={impact} changes={scenario.changes} />
      <ExplanationPanel explanation={explanation} />
    </section>
  );
}

function ImpactPreview({ impact, changes }: LegacyValue) {
  return (
    <div style={impactBox}>
      <p style={eyebrow}>Impact Preview</p>
      <div style={metricGrid}>
        <Metric label="Academic DNA" value={`+${changes.academicDNA}%`} />
        <Metric label="Opportunity" value={`+${changes.opportunityScore}%`} />
        <Metric label="Trust" value={`+${changes.trustScore}%`} />
        <Metric label="Scholarship" value={impact.scholarshipImpact} />
      </div>
    </div>
  );
}

function ExplanationPanel({ explanation }: { explanation: string }) {
  return (
    <div style={explainBox}>
      <p style={eyebrow}>Explanation</p>
      <p style={{ color:"#0F172A", lineHeight:1.6, margin:"8px 0 0" }}>{explanation}</p>
    </div>
  );
}

function Metric({ label, value }: { label:string; value:string }) {
  return (
    <div style={metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const card: React.CSSProperties = { background:"#fff", border:"1px solid #E2E8F0", borderRadius:24, padding:24, boxShadow:"0 16px 40px rgba(15,23,42,.06)" };
const eyebrow: React.CSSProperties = { fontSize:11, letterSpacing:".14em", textTransform:"uppercase", fontWeight:950, color:"#F97316", margin:0 };
const title: React.CSSProperties = { fontSize:26, color:"#0F172A", margin:"8px 0" };
const buttons: React.CSSProperties = { display:"flex", flexWrap:"wrap", gap:8, margin:"16px 0" };
const button: React.CSSProperties = { border:"1px solid #E2E8F0", borderRadius:999, padding:"9px 11px", cursor:"pointer", fontWeight:850 };
const impactBox: React.CSSProperties = { border:"1px solid #E2E8F0", borderRadius:18, padding:16, marginTop:16 };
const metricGrid: React.CSSProperties = { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginTop:12 };
const metric: React.CSSProperties = { display:"grid", gap:5, background:"#F8FAFC", borderRadius:14, padding:12, color:"#0F172A", fontSize:13 };
const explainBox: React.CSSProperties = { background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:18, padding:16, marginTop:16 };
