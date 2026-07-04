import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getTourProgress, type GuidedRole } from "@/lib/guided-experience";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const progress = getTourProgress({
    role: body.role as GuidedRole,
    completedStepIds: body.completedStepIds || [],
  });

  const { data, error } = await supabase
    .from("guided_tour_progress")
    .upsert({
      user_id: body.userId,
      role: body.role,
      completed_step_ids: body.completedStepIds || [],
      skipped: body.skipped || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, progress, record: data });
}
