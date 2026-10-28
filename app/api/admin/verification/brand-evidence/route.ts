import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const BUCKET = "brand-verification-evidence";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to review documents." }, { status: 401 });
  const requestId = request.nextUrl.searchParams.get("requestId") ?? "";
  if (!UUID.test(requestId)) return NextResponse.json({ error: "Valid verification request ID required." }, { status: 400 });

  // A guarded review queue, not an untrusted subject ID or client role,
  // establishes precisely which active requests this reviewer may inspect.
  const review = await supabase.rpc("get_verification_review_queue");
  if (review.error) return NextResponse.json({ error: "Verification reviewer access required." }, { status: 403 });
  const rows = (review.data ?? []) as Array<{ request_type: string; request_id: string; subject_user_id: string }>;
  const target = rows.find(row => row.request_type === "brand-partner" && row.request_id === requestId);
  if (!target || !UUID.test(target.subject_user_id)) {
    return NextResponse.json({ error: "No accessible Brand Partner review found." }, { status: 404 });
  }

  const files = await supabase.storage.from(BUCKET).list(target.subject_user_id, { limit: 100 });
  if (files.error) return NextResponse.json({ error: "Private evidence could not be loaded." }, { status: 503 });
  const names = (files.data ?? []).map(file => file.name)
    .filter(name => /^(letterhead|business-card)-[0-9a-f-]+\.(pdf|png|jpg|webp)$/i.test(name));

  const documents: Array<{ name: string; type: string; url: string }> = [];
  for (const name of names) {
    const signed = await supabase.storage.from(BUCKET).createSignedUrl(`${target.subject_user_id}/${name}`, 120);
    if (signed.error || !signed.data?.signedUrl) {
      return NextResponse.json({ error: "Unable to securely open verification evidence." }, { status: 503 });
    }
    documents.push({
      name, type: name.startsWith("letterhead-") ? "Company letterhead" : "Business card",
      url: signed.data.signedUrl,
    });
  }
  return NextResponse.json({ documents }, { headers: { "Cache-Control": "no-store, private" } });
}
