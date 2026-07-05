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

  if (!body.blockedUserId || body.blockedUserId === user.id) {
    return NextResponse.json(
      { error: "Invalid user." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("user_blocks")
    .upsert(
      {
        blocker_id: user.id,
        blocked_user_id: body.blockedUserId,
      },
      {
        onConflict: "blocker_id,blocked_user_id",
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


export async function DELETE(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_user_id", body.blockedUserId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
