"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRoleTour } from "@/lib/guided-experience";
import { getRoleDefinition, normalizePlaybookRole } from "@/lib/roles/registry";
import { PlaybookCard, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage } from "@/components/ui";

export default function OnboardingTour() {
  const params = useSearchParams();
  const role = normalizePlaybookRole(params.get("role"));
  const destination = getRoleDefinition(role).osRoute;
  const steps = getRoleTour(role);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  function finish() {
    window.localStorage.setItem(`playbook:tutorial-completed:${role}`, new Date().toISOString());
    window.location.href = destination;
  }

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="First Login Tutorial"
        title={`Welcome to ${getRoleDefinition(role).osLabel}.`}
        subtitle="Take this quick guided tour before opening your role-specific Playbook experience."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Tutorial Progress" value={`${progress}%`} />
        <PlaybookMetric label="Current Step" value={`${stepIndex + 1} of ${steps.length}`} />
      </PlaybookMetrics>

      <PlaybookCard eyebrow={`Tutorial Step ${stepIndex + 1}`} title={step.title}>
        <p style={{ color: "#64748B", fontSize: 18, lineHeight: 1.7 }}>{step.body}</p>
        <p style={{ color: "#94A3B8", fontSize: 13 }}>You will be able to open this area after the tutorial.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          {stepIndex > 0 && (
            <button type="button" onClick={() => setStepIndex((index) => index - 1)} style={secondaryButton}>
              Back
            </button>
          )}
          {isLast ? (
            <button type="button" onClick={finish} style={primaryButton}>Begin in {getRoleDefinition(role).osLabel}</button>
          ) : (
            <button type="button" onClick={() => setStepIndex((index) => index + 1)} style={primaryButton}>
              Continue →
            </button>
          )}
        </div>
      </PlaybookCard>
    </PlaybookPage>
  );
}

const primaryButton: React.CSSProperties = { border: 0, borderRadius: 999, background: "#F97316", color: "#FFFFFF", padding: "14px 22px", fontWeight: 900, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 999, background: "#FFFFFF", color: "#0F172A", padding: "14px 22px", fontWeight: 900, cursor: "pointer" };
