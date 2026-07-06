import { NextRequest, NextResponse } from "next/server";
import {
  buildSharedActionRecord,
  canAccessScholarNetwork,
} from "@/lib/support-network-live/server";
import { createClient } from "@supabase/supabase-js";


function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  const scholarId = req.nextUrl.searchParams.get("scholarId");

  if (!scholarId) {
    return NextResponse.json({ error: "Missing scholarId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("shared_actions")
    .select("*")
    .eq("scholar_id", scholarId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ actions: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  const body = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scholarId = body.scholarId;

  const { data: relationships } = await supabase
    .from("support_relationships")
    .select("*")
    .eq("scholar_id", scholarId);

  const allowed = canAccessScholarNetwork({
    relationships: relationships || [],
    scholarId,
    userId: user.id,
    userEmail: user.email,
  });

  if (!allowed) {
    return NextResponse.json({ error: "No relationship access." }, { status: 403 });
  }

  const record = buildSharedActionRecord({
    scholarId,
    assignedRole: body.assignedRole,
    title: body.title,
    detail: body.detail,
    dueDate: body.dueDate,
  });

  const { data, error } = await supabase
    .from("shared_actions")
    .insert(record)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("playbook_events").insert({
    type: "action.assigned",
    scholar_id: scholarId,
    actor_id: user.id,
    actor_role: body.assignedRole,
    payload: {
      title: body.title,
      detail: body.detail || "A shared action was assigned.",
    },
  });

  return NextResponse.json({ action: data });
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  const body = await req.json();

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("shared_actions")
    .update({ status: body.status })
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (body.status === "complete") {
    await supabase.from("playbook_events").insert({
      type: "action.completed",
      scholar_id: data.scholar_id,
      payload: {
        title: data.title,
        detail: "A shared action was completed.",
      },
    });
  }

  return NextResponse.json({ action: data });
}
