import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { data, error } = await supabase.from("support_invitations")
      .select("id,invitee_name,invitee_email,relationship,status,created_at")
      .eq("scholar_id", user.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ invitations: data || [] });
  } catch {
    return NextResponse.json({ error: "Invitations unavailable." }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    if (body.action !== "withdraw" || typeof body.invitationId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(body.invitationId)) {
      return NextResponse.json({ error: "Invalid withdrawal request." }, { status: 400 });
    }
    const { data, error } = await supabase.rpc("withdraw_own_support_invitation", { p_invitation_id: body.invitationId });
    if (error) throw error;
    if (data !== true) return NextResponse.json({ error: "Only your pending invitation can be withdrawn." }, { status: 409 });
    return NextResponse.json({ ok: true, message: "Pending invitation withdrawn. Send a new request to change the proposed relationship." });
  } catch {
    return NextResponse.json({ error: "Unable to withdraw invitation." }, { status: 400 });
  }
}
