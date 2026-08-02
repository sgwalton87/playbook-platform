import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InvitationStatus = "accepted" | "declined";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const body = (await request.json()) as { token?: string; status?: InvitationStatus };
  const status = body.status || "accepted";
  if (!body.token) return NextResponse.json({ ok: false, error: "Missing invitation token." }, { status: 400 });
  if (status !== "accepted" && status !== "declined") {
    return NextResponse.json({ ok: false, error: "Invalid invitation status." }, { status: 422 });
  }

  const { data, error } = await supabase.rpc("accept_support_invitation", { p_token: body.token, p_status: status });
  if (error) {
    const forbidden = error.message.includes("email_mismatch");
    return NextResponse.json({ ok: false, error: forbidden ? "This invitation belongs to a different account." : "Invitation could not be resolved." }, { status: forbidden ? 403 : 409 });
  }
  return NextResponse.json({ ok: true, ...data });
}
