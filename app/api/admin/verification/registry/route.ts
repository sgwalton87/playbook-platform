import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { UUID } from "@/lib/brand-verification/documents";
import { lookupBusiness } from "@/lib/verification/registry";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
 const { supabase, user } = await requireUser();
 if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
 const body = await request.json().catch(() => null) as Record<string, unknown> | null;
 if (!body || typeof body.requestId !== "string" || !UUID.test(body.requestId)) return NextResponse.json({ error: "Valid request ID required." }, { status: 400 });
 const context = await supabase.rpc("get_brand_review_context", { requested_id: body.requestId });
 if (context.error) return NextResponse.json({ error: "Reviewer authority or request unavailable." }, { status: context.error.code === "42501" ? 403 : 404 });
 const details = context.data as { organizationName: string; registration?: { formation_state: string; entity_number: string } };
 if (body.action === "lookup") {
  if (!details.registration) return NextResponse.json({ error: "The applicant must provide registration details first." }, { status: 422 });
  const result = await lookupBusiness({ organizationName: details.organizationName, formationState: details.registration.formation_state, entityNumber: details.registration.entity_number });
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store, private" } });
 }
 if (!["needs_review", "matched_active", "alternative_verified", "confirmed_issue"].includes(String(body.humanOutcome)) || typeof body.sourceUrl !== "string" || typeof body.note !== "string" || !body.note.trim() || body.note.length > 4000) return NextResponse.json({ error: "Human outcome, official source and review note required." }, { status: 400 });
 try { const url = new URL(body.sourceUrl); if (url.protocol !== "https:" || url.username || url.password || body.sourceUrl.length > 2000) throw new Error(); } catch { return NextResponse.json({ error: "A valid HTTPS official record or alternative evidence URL is required." }, { status: 400 }); }
 const saved = await supabase.rpc("record_brand_registry_review", { requested_id: body.requestId, requested_result: { human_outcome: body.humanOutcome, source_url: body.sourceUrl, review_note: body.note.trim(), safety_reviewed: body.safetyReviewed === true, checked_at: new Date().toISOString() } });
 if (saved.error) return NextResponse.json({ error: "Human registry review could not be saved." }, { status: 422 });
 return NextResponse.json({ saved: true }, { headers: { "Cache-Control": "no-store, private" } });
}
