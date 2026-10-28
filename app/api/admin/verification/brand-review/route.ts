import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { UUID } from "@/lib/brand-verification/documents";
import { buildReviewMessage, type ReviewOutcome } from "@/lib/verification/templates";
import { dispatchReviewEmail } from "@/lib/verification/delivery";
const headers = { "Cache-Control": "no-store, private" };
export async function GET(request: NextRequest) {
 const { supabase, user } = await requireUser();
 if (!user) return NextResponse.json({ error: "Sign in to review verification." }, { status: 401 });
 const id = request.nextUrl.searchParams.get("requestId") || "";
 if (!UUID.test(id)) return NextResponse.json({ error: "Valid request ID required." }, { status: 400 });
 const result = await supabase.rpc("get_brand_review_context", { requested_id: id });
 if (result.error) return NextResponse.json({ error: "Reviewer access or request unavailable." }, { status: result.error.code === "42501" ? 403 : 404 });
 return NextResponse.json(result.data, { headers });
}
export async function POST(request: NextRequest) {
 const { supabase, user } = await requireUser();
 if (!user) return NextResponse.json({ error: "Sign in to review verification." }, { status: 401 });
 const body = await request.json().catch(() => null) as Record<string, unknown> | null;
 if (!body || typeof body.requestId !== "string" || !UUID.test(body.requestId)) return NextResponse.json({ error: "Valid request ID required." }, { status: 400 });
 if (body.action === "note") {
  if (typeof body.note !== "string" || !body.note.trim() || body.note.length > 4000) return NextResponse.json({ error: "A private note of 1–4000 characters is required." }, { status: 400 });
  const saved = await supabase.rpc("add_brand_review_note", { requested_id: body.requestId, requested_note: body.note.trim() });
  if (saved.error) return NextResponse.json({ error: "Private note could not be saved." }, { status: saved.error.code === "42501" ? 403 : 400 });
  return NextResponse.json({ saved: true }, { headers });
 }
 if (typeof body.actionId !== "string" || !UUID.test(body.actionId) || !["under_review", "needs_information", "approved", "rejected"].includes(String(body.outcome)) || typeof body.extraMessage !== "string" || body.extraMessage.length > 2000 || typeof body.privateNote !== "string" || body.privateNote.length > 4000) return NextResponse.json({ error: "Valid outcome, action ID and bounded messages are required." }, { status: 400 });
 if (body.outcome === "rejected" && !body.extraMessage.trim()) return NextResponse.json({ error: "Explain the specific verified reason for declining." }, { status: 400 });
 let publicMessage: string;
 try { publicMessage = buildReviewMessage(body.outcome as ReviewOutcome, String(body.reasonCode ?? ""), body.extraMessage); }
 catch { return NextResponse.json({ error: "Select a valid review reason." }, { status: 400 }); }
 const result = await supabase.rpc("complete_brand_review", {
  requested_id: body.requestId, requested_outcome: body.outcome, requested_reason: String(body.reasonCode ?? ""), requested_message: publicMessage,
  requested_private_note: body.privateNote, requested_action_id: body.actionId, requested_documents_reviewed: body.documentsReviewed === true,
  requested_campaign_scope: body.campaignScope === true, requested_compliance_scope: body.complianceScope === true,
 });
 if (result.error) return NextResponse.json({ error: result.error.code === "42501" ? "Reviewer authority required; self-review is not permitted." : "Review could not be saved. Check the registration, safeguarding, document and scope requirements." }, { status: result.error.code === "42501" ? 403 : 422 });
 const saved = result.data as { communicationId: string };
 let delivery: { status: string; message: string };
 try { delivery = await dispatchReviewEmail(supabase, saved.communicationId); }
 catch { delivery = { status: "queued", message: "Review saved. Email is queued; use the communication log to retry." }; }
 return NextResponse.json({ saved: true, communicationId: saved.communicationId, delivery }, { headers });
}
