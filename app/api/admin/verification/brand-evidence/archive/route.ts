import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { UUID } from "@/lib/brand-verification/documents";

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to archive documents." }, { status: 401 });
  const body = await request.json().catch(() => null) as { documentId?: unknown; reason?: unknown } | null;
  if (!body || typeof body.documentId !== "string" || !UUID.test(body.documentId) || typeof body.reason !== "string" || !body.reason.trim() || body.reason.trim().length > 2000) {
    return NextResponse.json({ error: "A valid document and archive reason are required." }, { status: 400 });
  }
  const result = await supabase.rpc("archive_brand_verification_document", { requested_document_id: body.documentId, requested_reason: body.reason.trim() });
  if (result.error) return NextResponse.json({ error: "Document could not be archived." }, { status: result.error.code === "42501" ? 403 : result.error.code === "P0002" ? 404 : 503 });
  return NextResponse.json({ archived: true, retained: true }, { headers: { "Cache-Control": "no-store, private" } });
}
