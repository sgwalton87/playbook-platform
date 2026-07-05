import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";
  const role = req.nextUrl.searchParams.get("role") || "";

  let query = admin()
    .from("support_directory_profiles")
    .select("*")
    .eq("searchable", true)
    .order("display_name");

  if (role) query = query.eq("role", role);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const filtered = (data || []).filter((person: any) => {
    if (!q) return true;
    return [
      person.display_name,
      person.role,
      person.organization,
      ...(person.expertise || []),
    ].join(" ").toLowerCase().includes(q);
  });

  return NextResponse.json({ mentors: filtered });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await admin()
    .from("support_directory_profiles")
    .upsert({
      user_id: body.userId,
      role: body.role,
      display_name: body.displayName,
      organization: body.organization || null,
      expertise: body.expertise || [],
      searchable: body.searchable ?? true,
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, profile: data });
}
