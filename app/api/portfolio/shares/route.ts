import { NextRequest, NextResponse } from "next/server";
import { requireLearnerAuthority } from "@/lib/auth/learner-authority";
import {
  PORTFOLIO_SHARE_TARGET_USES,
  type PortfolioShareTargetUse,
} from "@/lib/portfolio-sharing";
import { requireUser } from "@/lib/supabase/server";

function isPortfolioShareTargetUse(value: string): value is PortfolioShareTargetUse {
  return (PORTFOLIO_SHARE_TARGET_USES as readonly string[]).includes(value);
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await requireLearnerAuthority(supabase, user.id, { requireOnboarding: true });

    const body = await req.json() as Record<string, unknown>;
    if (body.scholarId != null && String(body.scholarId) !== user.id) {
      return NextResponse.json({ error: "Portfolio shares may only be created for the authenticated learner." }, { status: 403 });
    }

    const targetUse = String(body.targetUse ?? "");
    if (!isPortfolioShareTargetUse(targetUse)) {
      return NextResponse.json({ error: "Portfolio share target use is invalid." }, { status: 400 });
    }

    if (targetUse !== "nil") {
      return NextResponse.json({
        error: "This portfolio target use does not yet have a governed publication allowlist. Nothing was shared.",
      }, { status: 409 });
    }

    const packet = body.packet && typeof body.packet === "object" && !Array.isArray(body.packet)
      ? body.packet as Record<string, boolean>
      : {};
    const expiresAt = body.expiresAt ? String(body.expiresAt) : null;

    const { data, error } = await supabase.rpc("create_nil_media_kit_share", {
      requested_packet: packet,
      requested_expires_at: expiresAt,
    });
    if (error) throw new Error(error.message);

    const created = Array.isArray(data) ? data[0] as { share_id?: string; status?: string; expires_at?: string | null; created_at?: string } | undefined : undefined;
    if (!created?.share_id) throw new Error("Governed portfolio share was not created.");

    return NextResponse.json({
      ok: true,
      share: created,
      shareUrl: `/portfolio/${created.share_id}`,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create portfolio share." }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await requireLearnerAuthority(supabase, user.id, { requireOnboarding: true });

    const requestedScholarId = req.nextUrl.searchParams.get("scholarId");
    if (requestedScholarId && requestedScholarId !== user.id) {
      return NextResponse.json({ error: "Portfolio share history is private to the authenticated learner." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("portfolio_shares")
      .select("id,share_id,scholar_id,scholar_name,target_use,status,expires_at,view_count,created_at")
      .eq("scholar_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    return NextResponse.json({ shares: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load portfolio shares." }, { status: 400 });
  }
}
