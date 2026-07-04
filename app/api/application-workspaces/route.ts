import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { buildApplicationWorkspace } from "@/lib/application-workspace";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const workspace = buildApplicationWorkspace({
      scholarId: body.scholarId,
      opportunityName: body.opportunityName,
      opportunityType: body.opportunityType,
      deadline: body.deadline,
      requirements: body.requirements || [],
      evidence: body.evidence || [],
    });

    const { data, error } = await supabase
      .from("application_workspaces")
      .insert({
        scholar_id: workspace.scholar_id,
        opportunity_name: workspace.opportunity_name,
        opportunity_type: workspace.opportunity_type,
        deadline: workspace.deadline,
        requirements: workspace.requirements,
        evidence: workspace.evidence,
        status: workspace.status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("playbook_events").insert({
      type: "compass.recommendation_ready",
      scholar_id: workspace.scholar_id,
      payload: {
        title: `Application workspace created: ${workspace.opportunity_name}`,
        detail: `Readiness is ${workspace.readiness}%.`,
      },
    });

    return NextResponse.json({
      ok: true,
      workspace: data,
      readiness: workspace.readiness,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create application workspace." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const scholarId = req.nextUrl.searchParams.get("scholarId");

  if (!scholarId) {
    return NextResponse.json({ error: "Missing scholarId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("application_workspaces")
    .select("*")
    .eq("scholar_id", scholarId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ workspaces: data || [] });
}
