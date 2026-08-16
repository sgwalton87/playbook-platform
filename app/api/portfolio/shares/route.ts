import { NextRequest, NextResponse } from "next/server";
import { requireLearnerAuthority } from "@/lib/auth/learner-authority";
import {
  buildPortfolioShare,
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

    const profile = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "A durable learner profile is required." }, { status: 409 });

    const body = await req.json() as Record<string, unknown>;
    if (body.scholarId != null && String(body.scholarId) !== user.id) {
      return NextResponse.json({ error: "Portfolio shares may only be created for the authenticated learner." }, { status: 403 });
    }

    const targetUse = String(body.targetUse ?? "");
    if (!isPortfolioShareTargetUse(targetUse)) {
      return NextResponse.json({ error: "Portfolio share target use is invalid." }, { status: 400 });
    }

    const share = buildPortfolioShare({
      scholarId: user.id,
      scholarName: profile.data.full_name || "Playbook Scholar",
      targetUse,
      packet: (body.packet ?? {}) as never,
      expiresAt: body.expiresAt ? String(body.expiresAt) : undefined,
    });

    const { data, error } = await supabase
      .from("portfolio_shares")
      .insert({
        share_id: share.id,
        scholar_id: user.id,
        scholar_name: share.scholarName,
        target_use: share.targetUse,
        packet: share.packet,
        status: share.status,
        expires_at: share.expiresAt,
      })
      .select("id,share_id,scholar_id,scholar_name,target_use,packet,status,expires_at,view_count,created_at")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, share: data, shareUrl: `/portfolio/${data.share_id}` }, { status: 201 });
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
