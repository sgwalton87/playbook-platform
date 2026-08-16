import { NextRequest, NextResponse } from "next/server";
import { getTourProgress, type GuidedRole } from "@/lib/guided-experience";
import { requirePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

const GUIDED_ROLE_BY_PLAYBOOK_ROLE: Partial<Record<PlaybookRole, GuidedRole>> = {
  scholar: "scholar",
  "scholar-athlete": "scholar_athlete",
  family: "family",
  educator: "educator",
  mentor: "mentor",
  district: "district",
  "college-admissions": "university",
  employer: "employer",
};

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const profile = await supabase
      .from("profiles")
      .select("role,profile_mode")
      .eq("id", user.id)
      .maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "A durable Playbook profile is required." }, { status: 409 });

    const durableRole = requirePlaybookRole(profile.data.profile_mode ?? profile.data.role);
    const guidedRole = GUIDED_ROLE_BY_PLAYBOOK_ROLE[durableRole];
    if (!guidedRole) {
      return NextResponse.json(
        { error: `Guided experience is not yet registered for ${durableRole}.` },
        { status: 409 }
      );
    }

    const body = await req.json() as Record<string, unknown>;
    if (body.userId != null && String(body.userId) !== user.id) {
      return NextResponse.json({ error: "Tour progress cannot be assigned to another user." }, { status: 403 });
    }
    const completedStepIds = Array.isArray(body.completedStepIds)
      ? body.completedStepIds.slice(0, 50).map(value => String(value)).filter(Boolean)
      : [];

    const progress = getTourProgress({ role: guidedRole, completedStepIds });
    const { data, error } = await supabase
      .from("guided_tour_progress")
      .upsert({
        user_id: user.id,
        role: guidedRole,
        completed_step_ids: completedStepIds,
        skipped: Boolean(body.skipped),
      }, { onConflict: "user_id" })
      .select("id,user_id,role,completed_step_ids,skipped,updated_at")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, progress, record: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save guided-tour progress." }, { status: 400 });
  }
}
