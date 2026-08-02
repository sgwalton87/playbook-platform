import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const [{ data: relationships, error }, { data: active }] = await Promise.all([
    supabase.from("support_relationships").select("id,scholar_id,relationship,permissions").eq("supporter_id", auth.user.id).eq("status", "active").order("created_at"),
    supabase.from("active_scholar_contexts").select("scholar_id").eq("user_id", auth.user.id).maybeSingle(),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const scholarIds = (relationships || []).map((relationship) => relationship.scholar_id);
  const { data: scholars } = scholarIds.length
    ? await supabase.from("profiles").select("id,full_name,username,avatar_url").in("id", scholarIds)
    : { data: [] };
  const scholarById = new Map((scholars || []).map((scholar) => [scholar.id, scholar]));
  return NextResponse.json({
    activeScholarId: scholarIds.includes(active?.scholar_id || "") ? active?.scholar_id : null,
    contexts: (relationships || []).map((relationship) => ({
      relationshipId: relationship.id,
      scholarId: relationship.scholar_id,
      relationship: relationship.relationship,
      permissions: relationship.permissions,
      scholar: scholarById.get(relationship.scholar_id) || { id: relationship.scholar_id, full_name: "Scholar" },
    })),
  });
}

export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json()) as { scholarId?: string };
  if (!body.scholarId) return NextResponse.json({ error: "Scholar selection is required." }, { status: 422 });
  const { data: relationship } = await supabase.from("support_relationships").select("id,scholar_id").eq("supporter_id", auth.user.id).eq("scholar_id", body.scholarId).eq("status", "active").maybeSingle();
  if (!relationship) return NextResponse.json({ error: "Active Scholar relationship required." }, { status: 403 });
  const { error } = await supabase.from("active_scholar_contexts").upsert({ user_id: auth.user.id, scholar_id: relationship.scholar_id, relationship_id: relationship.id, selected_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, activeScholarId: relationship.scholar_id });
}
