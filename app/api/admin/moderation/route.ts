import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

async function requireModerator() {
  const auth = await requireUser();

  if (!auth.user) return { ...auth, allowed: false };

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  const allowed = ["founder", "admin"].includes(profile?.role || "");

  return {
    ...auth,
    allowed,
  };
}


export async function GET() {
  const { supabase, allowed } = await requireModerator();

  if (!allowed) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("trust_reports")
    .select("*")
    .in("status", ["open", "reviewing"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    reports: data || [],
  });
}


export async function PATCH(req: NextRequest) {
  const { supabase, user, allowed } = await requireModerator();

  if (!allowed || !user) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await req.json();

  const validStatuses = new Set([
    "reviewing",
    "resolved",
    "dismissed",
  ]);

  if (!body.reportId || !validStatuses.has(body.status)) {
    return NextResponse.json(
      { error: "Invalid moderation update." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("trust_reports")
    .update({
      status: body.status,
      resolution_note: body.note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", body.reportId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  await supabase
    .from("moderation_actions")
    .insert({
      report_id: data.id,
      moderator_id: user.id,
      action_type:
        body.status === "dismissed"
          ? "dismiss"
          : "resolve",
      target_type: data.target_type,
      target_id: data.target_id,
      note: body.note || null,
    });

  return NextResponse.json({
    ok: true,
    report: data,
  });
}
