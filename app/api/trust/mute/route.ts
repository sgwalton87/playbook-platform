import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  if (!body.mutedUserId || body.mutedUserId === user.id) {
    return NextResponse.json(
      { error: "Invalid user." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("user_mutes")
    .upsert(
      {
        user_id: user.id,
        muted_user_id: body.mutedUserId,
      },
      {
        onConflict: "user_id,muted_user_id",
      }
    );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
