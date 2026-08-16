import { NextRequest, NextResponse } from "next/server";
import { requirePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

type MentorDirectoryProfile = {
  display_name?: string | null;
  role?: string | null;
  organization?: string | null;
  expertise?: string[] | null;
};

const DIRECTORY_ROLES = new Set<PlaybookRole>([
  "mentor",
  "educator",
  "high-school-counselor",
  "coach",
  "college-coach",
  "college-admissions",
  "brand-partner",
  "employer",
  "district",
  "other",
]);

export async function GET(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const q = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";
    const role = req.nextUrl.searchParams.get("role") || "";
    let query = supabase
      .from("support_directory_profiles")
      .select("id,user_id,role,display_name,organization,expertise,searchable,created_at")
      .eq("searchable", true)
      .order("display_name");
    if (role) query = query.eq("role", role);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const filtered = ((data || []) as MentorDirectoryProfile[]).filter((person) => {
      if (!q) return true;
      return [person.display_name, person.role, person.organization, ...(person.expertise || [])]
        .join(" ").toLowerCase().includes(q);
    });

    return NextResponse.json({ mentors: filtered });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load support directory." }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const profile = await supabase
      .from("profiles")
      .select("role,profile_mode,onboarding_completed,full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "A durable Playbook profile is required." }, { status: 409 });

    const durableRole = requirePlaybookRole(profile.data.profile_mode ?? profile.data.role);
    if (!DIRECTORY_ROLES.has(durableRole)) {
      return NextResponse.json({ error: "This role is not eligible for the support directory." }, { status: 403 });
    }
    if (!profile.data.onboarding_completed) {
      return NextResponse.json({ error: "Complete role-specific onboarding before saving directory evidence." }, { status: 409 });
    }

    const body = await req.json() as Record<string, unknown>;
    if (body.userId != null && String(body.userId) !== user.id) {
      return NextResponse.json({ error: "Directory ownership cannot be assigned to another user." }, { status: 403 });
    }
    if (body.role != null && requirePlaybookRole(String(body.role)) !== durableRole) {
      return NextResponse.json({ error: "Directory role must match the durable Playbook role." }, { status: 403 });
    }

    const expertise = Array.isArray(body.expertise)
      ? body.expertise.slice(0, 20).map(value => String(value).trim()).filter(Boolean)
      : [];

    const { data, error } = await supabase
      .from("support_directory_profiles")
      .upsert({
        user_id: user.id,
        role: durableRole,
        display_name: String(body.displayName ?? profile.data.full_name ?? "Playbook Supporter").trim(),
        organization: body.organization ? String(body.organization).trim() : null,
        expertise,
        // Search publication is an authority-bearing action. Saving evidence does
        // not make the profile discoverable until a governed publication path exists.
        searchable: false,
      }, { onConflict: "user_id" })
      .select("id,user_id,role,display_name,organization,expertise,searchable,created_at")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({
      ok: true,
      profile: data,
      publicationState: "governed_publication_required",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save support directory evidence." }, { status: 400 });
  }
}
