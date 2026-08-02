"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PlaybookBadge } from "@/components/ui/PlaybookBadge";

export type NILComplianceQueueItem = {
  id: string;
  scholarId: string;
  brandName: string;
  opportunityTitle: string;
  opportunityType: string;
  stage: string;
  contractStatus: string;
  disclosureStatus: string;
  complianceStatus: string;
  jurisdiction: string | null;
  institutionName: string | null;
  agreementReference: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  updatedAt: string;
};

export default function NILComplianceQueue({ items }: { items: NILComplianceQueueItem[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function review(event: FormEvent<HTMLFormElement>, dealId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(dealId);
    setMessage(null);
    const response = await fetch("/api/admin/nil-compliance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ dealId, decision: form.get("decision"), reason: form.get("reason") }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setSaving(null);
    setMessage(response.ok ? "Compliance decision recorded with immutable audit evidence." : payload?.error ?? "Decision failed safely.");
    if (response.ok) router.refresh();
  }

  if (items.length === 0) return <p className="athlete-os-empty">No NIL compliance submissions currently require review.</p>;
  return <><div aria-live="polite" className="athlete-os-notice">{message ?? "Decisions require a reason and never guarantee commercial outcomes."}</div><div className="athlete-os-list">{items.map((item) => <article className="athlete-os-list-card athlete-os-list-card--nil" key={item.id}>
    <div><div className="athlete-os-badges"><PlaybookBadge>{item.complianceStatus}</PlaybookBadge><PlaybookBadge>{item.stage}</PlaybookBadge></div><h2>{item.opportunityTitle}</h2><p>{item.brandName} · {item.opportunityType.replaceAll("_", " ")}</p></div>
    <dl><div><dt>Athlete</dt><dd>{item.scholarId}</dd></div><div><dt>Agreement</dt><dd>{item.agreementReference ?? "Missing"}</dd></div><div><dt>Jurisdiction</dt><dd>{item.jurisdiction ?? "Missing"}</dd></div><div><dt>Institution</dt><dd>{item.institutionName ?? "Not supplied"}</dd></div><div><dt>Disclosure</dt><dd>{item.disclosureStatus}</dd></div><div><dt>Source</dt><dd>{item.sourceName ?? "Athlete recorded"}</dd></div></dl>
    <form className="athlete-os-compliance" onSubmit={(event) => review(event, item.id)}><label className="athlete-os-field"><span>Decision</span><select name="decision" defaultValue="approved"><option value="approved">Approve</option><option value="changes_required">Require changes</option><option value="rejected">Reject</option></select></label><label className="athlete-os-field"><span>Reason</span><textarea name="reason" required minLength={3} maxLength={2000} rows={3} /></label><button className="playbook-button" disabled={saving === item.id} type="submit">{saving === item.id ? "Recording…" : "Record compliance decision"}</button></form>
  </article>)}</div></>;
}
