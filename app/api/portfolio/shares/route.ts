import { NextRequest, NextResponse } from "next/server";
import { buildPortfolioShare } from "@/lib/portfolio-sharing";
import { buildServerPortfolioPacket, normalizePacketSections } from "@/lib/portfolio/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { incrementMetric } from "@/lib/observability";

const TARGET_USES = ["college", "scholarship", "internship", "job", "recruiting", "nil"] as const;

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  if (!TARGET_USES.includes(body.targetUse)) return NextResponse.json({ error: "Invalid portfolio target use." }, { status: 422 });
  if (!body.expiresAt || new Date(body.expiresAt).getTime() <= Date.now() || new Date(body.expiresAt).getTime() > Date.now() + 90 * 86400000) return NextResponse.json({ error: "Portfolio shares require a future expiration within 90 days." }, { status: 422 });
  const sections = normalizePacketSections(body.sections);
  if (sections.length === 0) return NextResponse.json({ error: "At least one allowlisted section is required." }, { status: 422 });
  const built = await buildServerPortfolioPacket({ supabase, scholarId: auth.user.id, targetUse: body.targetUse, sections });
  if (!built.ok) return NextResponse.json({ error: built.error }, { status: 409 });
  const admin = createAdminSupabaseClient();
  const { data: snapshot, error: snapshotError } = await admin.from("portfolio_packet_snapshots").insert({ scholar_id: auth.user.id, target_use: body.targetUse, packet: built.packet, allowed_sections: sections }).select("id").single();
  if (snapshotError) return NextResponse.json({ error: snapshotError.message }, { status: 400 });
  const share = buildPortfolioShare({ scholarId: auth.user.id, scholarName: built.scholarName, targetUse: body.targetUse, packet: built.packet, expiresAt: body.expiresAt });
  const { data, error } = await admin.from("portfolio_shares").insert({ share_id: share.id, scholar_id: auth.user.id, scholar_name: built.scholarName, target_use: body.targetUse, packet: built.packet, packet_snapshot_id: snapshot.id, status: "active", expires_at: body.expiresAt }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (built.readiness.ready) await supabase.from("playbook_events").insert({ type: "milestone.portfolio_ready", scholar_id: auth.user.id, actor_id: auth.user.id, actor_role: "scholar", payload: { title: "Portfolio ready", detail: "A controlled portfolio packet is ready to share." } });
  incrementMetric("portfolio_creation_total");
  return NextResponse.json({ ok: true, shareUrl: `/portfolio/${data.share_id}`, share: data });
}

export async function GET() {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("portfolio_shares").select("share_id,status,expires_at,revoked_at,created_at").eq("scholar_id", auth.user.id).order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ shares: data || [] });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const shareId = request.nextUrl.searchParams.get("shareId");
  if (!shareId) return NextResponse.json({ error: "Missing shareId." }, { status: 400 });
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("portfolio_shares").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("share_id", shareId).eq("scholar_id", auth.user.id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
