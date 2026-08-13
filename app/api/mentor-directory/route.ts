import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

type MentorDirectoryProfile = {
  display_name?: string | null;
  role?: string | null;
  organization?: string | null;
  expertise?: string[] | null;
};

type MentorDirectoryPostBody = {
  userId?: string;
  role?: string;
  displayName?: string;
  organization?: string;
  expertise?: string[];
  searchable?: boolean;
};

function isSupportedText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";
  const role = req.nextUrl.searchParams.get("role") || "";

  let query = supabase
    .from("support_directory_profiles")
    .select("*")
    .eq("searchable", true)
    .order("display_name");

  if (role) query = query.eq("role", role);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const filtered = ((data || []) as MentorDirectoryProfile[]).filter((person) => {
    if (!q) return true;

    return [
      person.display_name,
      person.role,
      person.organization,
      ...(person.expertise || []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  return NextResponse.json({ mentors: filtered });
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as MentorDirectoryPostBody;
  const role = body.role || "";

  if (!isSupportedText(role) || !isSupportedText(body.displayName)) {
    return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("support_directory_profiles")
    .upsert(
      {
        user_id: user.id,
        role,
        display_name: body.displayName,
        organization: body.organization || null,
        expertise: body.expertise || [],
        searchable: body.searchable ?? true,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, profile: data });
}
