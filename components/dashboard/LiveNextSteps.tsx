import Link from "next/link";
import type { TrustSummary } from "@/lib/launch-readiness";

export default function LiveNextSteps({ trust }: { trust: TrustSummary }) {
  return <section aria-labelledby="live-next-steps" style={{ background: "#fff", border: "1px solid #CBD5E1", borderRadius: 18, padding: 22 }}><h2 id="live-next-steps">Your live next steps</h2>
    {trust.nextSteps.length === 0 ? <p role="status">No evidence-backed next step is currently required. Review opportunities or continue documenting growth.</p> : <ol>{trust.nextSteps.map((step) => <li key={step.id}><Link href={step.href}>{step.label}</Link><p>{step.reason} · {step.priority} priority</p></li>)}</ol>}
  </section>;
}
