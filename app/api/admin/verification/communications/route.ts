import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { UUID } from "@/lib/brand-verification/documents";
import { dispatchReviewEmail } from "@/lib/verification/delivery";
export async function GET() {
 const { supabase, user } = await requireUser();
 if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
 const result = await supabase.rpc("list_brand_review_communications");
 if (result.error) return NextResponse.json({ error: "Reviewer authority required." }, { status: result.error.code === "42501" ? 403 : 503 });
 return NextResponse.json({ communications: result.data ?? [] }, { headers: { "Cache-Control": "no-store, private" } });
}
export async function POST(request: NextRequest) {
 const { supabase, user } = await requireUser();
 if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
 const body = await request.json().catch(() => null) as { communicationId?: unknown } | null;
 if (typeof body?.communicationId !== "string" || !UUID.test(body.communicationId)) return NextResponse.json({ error: "Valid communication ID required." }, { status: 400 });
 try { return NextResponse.json(await dispatchReviewEmail(supabase, body.communicationId), { headers: { "Cache-Control": "no-store, private" } }); }
 catch { return NextResponse.json({ error: "Communication could not be sent; check reviewer authority and log status." }, { status: 403 }); }
}
