import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user?.email) return NextResponse.json({ error: "Sign into the email address that was invited." }, { status: 401 });
    const email = user.email.trim().toLowerCase();
    const { data, error } = await supabase.from("support_invitations")
      .select("id,token,scholar_name,relationship,invitee_email,status,created_at")
      .eq("status","pending").ilike("invitee_email",email)
      .order("created_at",{ascending:false}).limit(30);
    if (error) throw error;
    // Only surface each private acceptance token to its exact authenticated email.
    return NextResponse.json({ invitations:(data||[]).filter(i=>i.invitee_email.trim().toLowerCase()===email).map(i=>({
      id:i.id,token:i.token,scholarName:i.scholar_name,relationship:i.relationship,createdAt:i.created_at
    })) });
  } catch { return NextResponse.json({ error: "Could not load invitations for this signed-in account." }, { status: 400 }); }
}
