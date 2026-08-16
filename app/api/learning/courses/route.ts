import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const [courses, modules, progress, credentials] = await Promise.all([
      supabase.from("learning_courses").select("slug,title,description,pillar,image_url,status,xp_per_module,coins_per_module,course_xp_bonus,course_coin_bonus,certificate_name,sort_order").in("status", ["published", "coming_soon"]).order("sort_order"),
      supabase.from("learning_modules").select("course_slug,module_key,required").order("position"),
      supabase.from("learning_module_progress").select("course_slug,module_key,completed_at").eq("user_id", user.id),
      supabase.from("learning_credentials").select("id,course_slug,credential_name,issued_at").eq("user_id", user.id),
    ]);

    const error = courses.error || modules.error || progress.error || credentials.error;
    if (error) throw new Error(error.message);

    const progressByCourse = new Map<string, Set<string>>();
    for (const item of progress.data || []) {
      const set = progressByCourse.get(item.course_slug) || new Set<string>();
      set.add(item.module_key);
      progressByCourse.set(item.course_slug, set);
    }
    const credentialByCourse = new Map((credentials.data || []).map((credential) => [credential.course_slug, credential]));

    const catalog = (courses.data || []).map((course) => {
      const required = (modules.data || []).filter((module) => module.course_slug === course.slug && module.required);
      const completed = progressByCourse.get(course.slug)?.size || 0;
      return {
        ...course,
        moduleCount: required.length,
        completedModules: completed,
        completed: required.length > 0 && completed >= required.length,
        credential: credentialByCourse.get(course.slug) || null,
      };
    });

    return NextResponse.json({ ok: true, courses: catalog });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Learning catalog could not be loaded." }, { status: 400 });
  }
}
