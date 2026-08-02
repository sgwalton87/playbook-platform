import Link from "next/link";
import type { TrustSummary } from "@/lib/launch-readiness";

export default function TrustSummaryCard({ summary, title = "Trust and readiness" }: { summary: TrustSummary; title?: string }) {
  return <section aria-labelledby="trust-summary-title" style={{ background: "#fff", border: "1px solid #CBD5E1", borderRadius: 18, padding: 22 }}>
    <p>Explainable trust summary</p><h2 id="trust-summary-title">{title}: {summary.score}%</h2>
    <progress value={summary.score} max={100}>{summary.score}%</progress><p>Level: {summary.level.replaceAll("_", " ")}</p>
    <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>{summary.signals.map((signal) => <div key={signal.id}><dt>{signal.label}</dt><dd>{signal.value} · +{signal.points}</dd></div>)}</dl>
    {summary.nextSteps[0] && <p><Link href={summary.nextSteps[0].href}>{summary.nextSteps[0].label}</Link> — {summary.nextSteps[0].reason}</p>}
  </section>;
}
