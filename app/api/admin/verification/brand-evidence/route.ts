import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { UUID, presentBrandDocument, type BrandDocumentRow, BRAND_REVIEW_TARGET_HOURS } from "@/lib/brand-verification/documents";
import { playbookEmails } from "@/lib/email/emailConfig";

export async function GET(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to review documents." }, { status: 401 });
  const requestId = request.nextUrl.searchParams.get("requestId");
  const page = Number(request.nextUrl.searchParams.get("page") ?? 0);
  if ((requestId !== null && !UUID.test(requestId)) || !Number.isSafeInteger(page) || page < 0 || page > 10000) {
    return NextResponse.json({ error: "Valid request ID and document page required." }, { status: 400 });
  }
  const result = await supabase.rpc("get_brand_verification_documents", {
    requested_request_id: requestId, requested_archived: request.nextUrl.searchParams.get("archived") === "true", requested_offset: page * 100,
  });
  if (result.error) return NextResponse.json({ error: "Private document folder is unavailable or reviewer access is missing." }, { status: result.error.code === "42501" ? 403 : 503 });
  const rows = (result.data ?? []) as BrandDocumentRow[];
  return NextResponse.json({ documents: rows.map(presentBrandDocument), hasMore: rows.length === 100,
    reviewInbox: playbookEmails.onboarding, reviewTargetHours: BRAND_REVIEW_TARGET_HOURS }, { headers: { "Cache-Control": "no-store, private" } });
}
