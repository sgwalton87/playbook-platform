import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { requirePlaybookRole } from "@/lib/roles/registry";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode").eq("id", user.id).maybeSingle();
    if (profile.error) throw profile.error;
    let role: string;
    try { role = requirePlaybookRole(profile.data?.profile_mode ?? profile.data?.role); }
    catch { return NextResponse.json({ authorized: false, error: "Your Playbook account type must be completed before inviting supporters." }, { status: 403 }); }
    if (!["scholar","scholar-athlete","transition-youth"].includes(role)) return NextResponse.json({ authorized: false, error: "Only Scholar, Scholar-Athlete, and Transition Youth accounts can invite supporters." }, { status: 403 });
    const { data, error } = await supabase.from("support_invitations")
      .select("id,invitee_name,invitee_email,relationship,status,invite_code,created_at")
      .eq("scholar_id", user.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ authorized: true, invitations: data || [] });
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
