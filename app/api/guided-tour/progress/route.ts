import { NextRequest, NextResponse } from "next/server";
import { getTourProgress, type GuidedRole } from "@/lib/guided-experience";
import { requireUser } from "@/lib/supabase/server";

const allowedRoles: ReadonlyArray<GuidedRole> = [
  "scholar",
  "scholar_athlete",
  "family",
  "educator",
  "mentor",
  "district",
  "university",
  "employer",
];

function isGuidedRole(value: unknown): value is GuidedRole {
  return typeof value === "string" && (allowedRoles as ReadonlyArray<string>).includes(value);
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const completedStepIds = Array.isArray(body.completedStepIds)
    ? body.completedStepIds.map(String)
    : [];

  if (!isGuidedRole(body.role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const role = body.role;

  const progress = getTourProgress({
    role,
    completedStepIds,
  });

  const { data, error } = await supabase
    .from("guided_tour_progress")
    .upsert({
      user_id: user.id,
      role,
      completed_step_ids: completedStepIds,
      skipped: Boolean(body.skipped),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, progress, record: data });
}
