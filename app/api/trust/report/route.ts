import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const TARGET_TYPES = new Set([
  "post",
  "comment",
  "profile",
  "event",
  "album",
]);

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  if (
    !TARGET_TYPES.has(body.targetType) ||
    !body.targetId ||
    !body.reason?.trim()
  ) {
    return NextResponse.json(
      { error: "Invalid report." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("moderation_reports")
    .insert({
      reporter_id: user.id,
      target_type: body.targetType,
      target_id: String(body.targetId),
      reason: body.reason.trim(),
      detail: body.detail?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    report: data,
  });
}
