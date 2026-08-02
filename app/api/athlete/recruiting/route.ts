import { NextRequest, NextResponse } from "next/server";
import { athleteApiFailure, governedCommandFailure, requireIdempotencyKey, requireSameOrigin, requireScholarAthleteApi } from "@/lib/scholar-athlete/api";
import { parseRecruitingTargetCommand } from "@/lib/scholar-athlete/contracts";
import { incrementMetric } from "@/lib/observability";

export async function POST(request: NextRequest) {
  const origin = requireSameOrigin(request);
  if (!origin.ok) return origin.response;
  const boundary = await requireScholarAthleteApi();
  if (!boundary.ok) return boundary.response;
  const idempotency = requireIdempotencyKey(request);
  if (!idempotency.ok) return idempotency.response;
  const parsed = parseRecruitingTargetCommand(await request.json().catch(() => null));
  if (!parsed.ok) return athleteApiFailure(parsed.error, 422);
  const value = parsed.value;
  const { data, error } = await boundary.supabase.rpc("create_athlete_recruiting_target", {
    p_school_name: value.schoolName,
    p_athletic_program: value.athleticProgram,
    p_division: value.division,
    p_coach_name: value.coachName,
    p_coach_email: value.coachEmail,
    p_stage: value.stage,
    p_next_action: value.nextAction,
    p_next_action_due_at: value.nextActionDueAt,
    p_notes: value.notes,
    p_idempotency_key: idempotency.value,
  });
  if (error) return governedCommandFailure(error);
  incrementMetric("recruiting_interaction_total");
  return NextResponse.json(data, { status: 201 });
}
