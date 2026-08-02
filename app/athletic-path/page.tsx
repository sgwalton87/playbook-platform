import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Athletic Path | Playbook" };

const evidence = [
  ["Development", "Scholar-confirmed training goals and dated evidence; never inferred readiness."],
  ["Achievement", "Verified results retain source, observation time, reviewer, and provenance."],
  ["Recruiting", "Eligibility and recruiting guidance remain unavailable without current governed evidence."],
  ["Well-being", "Sensitive health or safety information stays private unless the Scholar grants scoped consent."],
] as const;

export default function AthleticPathPage() {
  return (
    <main className="scholar-remediation-page">
      <header className="scholar-remediation-hero scholar-remediation-hero--dark">
        <p className="scholar-remediation-eyebrow">Athletic path</p>
        <h1>Understand the path without surrendering the decision.</h1>
        <p>
          Athletic development, achievement, recruiting readiness, and opportunity pathways must
          remain evidence-backed, permission-aware, and confirmed by the Scholar.
        </p>
        <nav aria-label="Athletic path workflow" className="scholar-remediation-actions">
          <Link href="/scholar-athlete-os">Open athlete workspace</Link>
          <Link href="/goals">Review goals</Link>
          <Link href="/opportunities">Evaluate opportunities</Link>
        </nav>
      </header>

      <section aria-labelledby="athletic-status" className="scholar-remediation-panel">
        <h2 id="athletic-status">Athletic pathway status</h2>
        <div role="status" className="scholar-remediation-status">
          <strong>No verified athletic pathway summary is available.</strong>
          <span>
            This is an unavailable state—not zero progress. Review evidence or return later; no
            recruiting or eligibility conclusion will be fabricated.
          </span>
        </div>
      </section>

      <section aria-labelledby="athletic-evidence" className="scholar-remediation-panel">
        <h2 id="athletic-evidence">Evidence and permission boundaries</h2>
        <div className="scholar-remediation-grid">
          {evidence.map(([name, description]) => (
            <article key={name}><h3>{name}</h3><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section aria-labelledby="athletic-recovery" className="scholar-remediation-panel">
        <h2 id="athletic-recovery">Failure and recovery</h2>
        <p><strong>State contract:</strong> Loading, Empty, Success, Error, Permission, Offline, Stale evidence, and Recovery.</p>
        <ul>
          <li>Loading preserves the previous trusted state and announces progress.</li>
          <li>Offline mode permits review but blocks confirmation and evidence submission.</li>
          <li>Stale evidence shows its observation date and suspends consequential guidance.</li>
          <li>Permission denial explains the boundary without exposing private information.</li>
          <li>Errors retain the Scholar’s place and provide retry, evidence review, and human-support paths.</li>
        </ul>
      </section>

      <aside className="scholar-remediation-boundary">
        <strong>Confirmation required:</strong> coaches, institutions, and intelligence tools may
        explain options; only the Scholar can confirm an athletic milestone or chosen path.
      </aside>
    </main>
  );
}
