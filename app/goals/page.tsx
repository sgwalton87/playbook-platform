import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Goals | Playbook" };

const states = [
  ["Loading", "Goal evidence is being checked. No recommendation appears while sources are unresolved."],
  ["Empty", "No Scholar-confirmed goal exists yet. Missing goals are never inferred from profile data."],
  ["Success", "A confirmed goal shows its owner, revision history, evidence, next action, and alternatives."],
  ["Error", "A failed save preserves the Scholar’s draft and offers an explicit retry."],
  ["Permission", "Only the Scholar may confirm or revise a personal goal; supporters require scoped consent."],
  ["Offline", "Drafting may continue locally, but confirmation waits for a trusted connection."],
  ["Stale evidence", "Guidance pauses when supporting evidence is outdated or its provenance is unavailable."],
  ["Recovery", "The Scholar can review sources, revise the draft, retry, or return to the journey without losing history."],
] as const;

export default function GoalsPage() {
  return (
    <main className="scholar-remediation-page">
      <header className="scholar-remediation-hero">
        <p className="scholar-remediation-eyebrow">Scholar-owned direction</p>
        <h1>Goals remain yours to define, revise, or reject.</h1>
        <p>
          Playbook structures evidence and possible next actions. It never turns a prediction,
          supporter suggestion, or missing record into your decision.
        </p>
        <nav aria-label="Goal workflow" className="scholar-remediation-actions">
          <Link href="/profile">Review identity</Link>
          <Link href="/journey">Review journey</Link>
          <Link href="/opportunities">Compare opportunities</Link>
        </nav>
      </header>

      <section aria-labelledby="goal-workspace" className="scholar-remediation-panel">
        <h2 id="goal-workspace">Goal workspace</h2>
        <div role="status" className="scholar-remediation-status">
          <strong>No confirmed goal is available.</strong>
          <span>
            Start with a private draft. Confirmation, sharing, and consequential guidance remain
            unavailable until you choose a goal and its supporting evidence is current.
          </span>
        </div>
      </section>

      <section aria-labelledby="goal-states" className="scholar-remediation-panel">
        <h2 id="goal-states">Required experience states</h2>
        <div className="scholar-remediation-grid">
          {states.map(([name, description]) => (
            <article key={name}>
              <h3>{name}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="scholar-remediation-boundary">
        <strong>Human authority:</strong> saving a draft is not confirmation. Playbook must show
        evidence, confidence, alternatives, and consequences before asking the Scholar to confirm.
      </aside>
    </main>
  );
}
