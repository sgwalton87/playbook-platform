import Link from "next/link";
import ForbiddenState from "@/components/auth/ForbiddenState";
import EvidenceReviewActions from "@/components/evidence/EvidenceReviewActions";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function VerificationQueuePage() {
  const authorization = await resolveServerAuthorization({ permission: "verify_evidence" });
  if (!authorization.authorized) return <ForbiddenState reason="Select an active Scholar relationship with evidence verification permission." />;
  const supabase = await createServerSupabaseClient();
  const { data: requests, error } = await supabase.from("evidence_verification_requests").select("id,evidence_id,status,request_note,requested_at").eq("scholar_id", authorization.scholarId).in("status", ["pending", "in_review"]).order("requested_at");
  if (error) throw new Error("Verification queue unavailable.");
  const evidenceIds = (requests || []).map((request) => request.evidence_id);
  const { data: evidence } = evidenceIds.length ? await supabase.from("evidence").select("id,title,source,source_type,last_observed_at").in("id", evidenceIds) : { data: [] };
  const evidenceById = new Map((evidence || []).map((item) => [item.id, item]));
  return <main style={{ maxWidth: 960, margin: "0 auto", padding: 36 }}><header><p>Evidence Review</p><h1>Pending verification queue</h1><p>Review only evidence shared through the active Scholar relationship.</p><Link href="/evidence">Return to Evidence Center</Link></header>
    {(requests || []).length === 0 ? <section role="status"><h2>No pending requests</h2><p>The authorized queue contains no evidence awaiting review.</p></section> : <section style={{ display: "grid", gap: 16 }}>{(requests || []).map((request) => { const item = evidenceById.get(request.evidence_id); return <article key={request.id} style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 20 }}><h2>{item?.title || "Evidence"}</h2><p>{item?.source || "Source unavailable"} · {item?.source_type || "unknown source"}</p><p>{request.request_note || "No request note."}</p><EvidenceReviewActions evidenceId={request.evidence_id} requestId={request.id} /></article>; })}</section>}
  </main>;
}
