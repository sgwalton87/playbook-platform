import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const [course, modules, progress, credential] = await Promise.all([
      supabase.from("learning_courses").select("slug,title,description,pillar,image_url,status,xp_per_module,coins_per_module,course_xp_bonus,course_coin_bonus,certificate_name").eq("slug", slug).maybeSingle(),
      supabase.from("learning_modules").select("module_key,position,title,duration_minutes,module_type,summary,content,completion_mode,required").eq("course_slug", slug).order("position"),
      supabase.from("learning_module_progress").select("module_key,reflection,completed_at").eq("user_id", user.id).eq("course_slug", slug),
      supabase.from("learning_credentials").select("id,credential_name,issued_at,evidence").eq("user_id", user.id).eq("course_slug", slug).maybeSingle(),
    ]);

    const error = course.error || modules.error || progress.error || credential.error;
    if (error) throw new Error(error.message);
    if (!course.data) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    const progressMap = new Map((progress.data || []).map((item) => [item.module_key, item]));
    return NextResponse.json({
      ok: true,
      course: course.data,
      modules: (modules.data || []).map((module) => ({ ...module, progress: progressMap.get(module.module_key) || null })),
      credential: credential.data || null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Course could not be loaded." }, { status: 400 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json() as { moduleKey?: unknown; reflection?: unknown };
    const moduleKey = String(body.moduleKey ?? "").trim();
    const reflection = body.reflection == null ? null : String(body.reflection).trim();
    if (!moduleKey) return NextResponse.json({ error: "Module is required." }, { status: 400 });

    const result = await supabase.rpc("complete_learning_module", {
      requested_course_slug: slug,
      requested_module_key: moduleKey,
      reflection_text: reflection,
    });
    if (result.error) throw new Error(result.error.message);

    const outcome = result.data?.[0] || null;
    return NextResponse.json({ ok: true, outcome });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Module could not be completed." }, { status: 400 });
  }
}
