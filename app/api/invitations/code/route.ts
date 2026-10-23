import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

// An invitation code is a locator, never an authorization substitute.
// RLS + exact email + current pending status gate access to the claim token.
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user?.email) return NextResponse.json({error:"Sign in with the invited email first."},{status:401});
    const {code} = await request.json();
    if (typeof code !== "string" || !/^[A-Z0-9_-]{12}$/.test(code.trim().toUpperCase()))
      return NextResponse.json({error:"Enter your 12-character invitation code."},{status:400});
    const {data,error} = await supabase.from("support_invitations")
      .select("token,invitee_email,status")
      .eq("invite_code",code.trim().toUpperCase())
      .eq("status","pending")
      .maybeSingle();
    if (error) return NextResponse.json({error:"Unable to verify invitation code."},{status:400});
    if (!data || data.invitee_email.trim().toLowerCase() !== user.email.trim().toLowerCase())
      return NextResponse.json({error:"No pending invitation matches this code and signed-in email."},{status:404});
    return NextResponse.json({url:`/invite/${encodeURIComponent(data.token)}`});
  } catch {
    return NextResponse.json({error:"Unable to verify the invitation code."},{status:400});
  }
}
