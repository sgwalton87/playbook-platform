import Link from "next/link";
import ForbiddenState from "@/components/auth/ForbiddenState";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { canRelationship } from "@/lib/permissions";
import { mapEvidenceRow } from "@/lib/scholar/models/evidence";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import RequestVerificationButton from "@/components/evidence/RequestVerificationButton";

export default async function EvidenceCenterPage({ searchParams }: { searchParams: Promise<{ scholarId?: string }> }) {
  const { scholarId } = await searchParams;
  const decision = await resolveServerAuthorization({ scholarId, permission: "view_evidence" });
  if (!decision.authorized) return <ForbiddenState reason="An active Scholar relationship with evidence access is required." />;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("evidence").select("*").eq("owner_id", decision.scholarId).is("deleted_at", null).order("last_observed_at", { ascending: false });
  if (error) throw new Error("Evidence could not be loaded from the authorized source.");
  const evidence = (data || []).map(mapEvidenceRow);
  const canReview = decision.relationship ? canRelationship(decision.relationship.relationship, "verify_evidence") : false;
  const canViewRecord = decision.relationship ? canRelationship(decision.relationship.relationship, "view_progress") : true;

  return <main style={{ maxWidth: 1040, margin: "0 auto", padding: "36px 24px" }}>
    <header style={{ marginBottom: 28 }}>
      <p style={{ color: "#C2410C", fontWeight: 800 }}>Evidence Center</p>
      <h1>Trusted evidence, with its history attached.</h1>
      <p>Every item identifies its owner, source, consent boundary, observation time, and verification state.</p>
      {canViewRecord && <Link href={`/record?scholarId=${decision.scholarId}`}>Return to Scholar Record</Link>}
      {canReview && <> · <Link href="/evidence/verification-queue">Open verification queue</Link></>}
    </header>

    {evidence.length === 0 ? <section role="status" style={{ padding: 28, border: "1px solid #CBD5E1", borderRadius: 16 }}>
      <h2>No authorized evidence is available</h2>
      <p>This is a missing-data state, not a claim that the Scholar has no accomplishments.</p>
      {canViewRecord && <Link href={`/record?scholarId=${decision.scholarId}`}>Review the Scholar Record</Link>}
    </section> : <section aria-label="Evidence items" style={{ display: "grid", gap: 16 }}>
      {evidence.map((item) => <article key={item.id} style={{ padding: 24, border: "1px solid #CBD5E1", borderRadius: 16, background: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div><p style={{ margin: 0, color: "#64748B" }}>{item.type}</p><h2>{item.title}</h2></div>
          <strong>{item.verificationState}</strong>
        </div>
        {item.description && <p>{item.description}</p>}
        <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          <div><dt>Owner</dt><dd>{item.ownerId}</dd></div>
          <div><dt>Source</dt><dd>{item.source || "Source name unavailable"} · {item.sourceType}</dd></div>
          <div><dt>Last observed</dt><dd>{new Date(item.lastObservedAt).toLocaleDateString()}</dd></div>
          <div><dt>Visibility and consent</dt><dd>{item.visibility} · {item.consentScope}</dd></div>
          <div><dt>Verification actor</dt><dd>{item.verificationActorRole || "Not reviewed"}</dd></div>
          <div><dt>State reason</dt><dd>{item.stateReason || "No reason recorded"}</dd></div>
        </dl>
        {item.url && <p><a href={item.url} rel="noreferrer">Open source evidence</a></p>}
        {decision.relationship === null && item.verificationState !== "verified" && <RequestVerificationButton evidenceId={item.id} />}
      </article>)}
    </section>}
  </main>;
}
