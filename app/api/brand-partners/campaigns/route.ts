import { NextRequest, NextResponse } from "next/server";
import { requirePlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

const MAX_TITLE = 160;
const MAX_DESCRIPTION = 4000;
const MAX_DELIVERABLES = 20;

async function requireBrandCampaignAuthority(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string
) {
  const profile = await supabase
    .from("profiles")
    .select("role,profile_mode,onboarding_completed")
    .eq("id", userId)
    .maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  if (!profile.data) throw new Error("A durable Brand Partner profile is required.");

  const role = requirePlaybookRole(profile.data.profile_mode ?? profile.data.role);
  if (role !== "brand-partner") throw new Error("Brand campaigns are restricted to Brand Partner accounts.");
  if (!profile.data.onboarding_completed) throw new Error("Complete Brand Partner onboarding before managing campaigns.");

  const verification = await supabase
    .from("brand_partner_verification_requests")
    .select("id,organization_name,brand_category,status,campaign_scope_approved,compliance_scope_approved")
    .eq("brand_user_id", userId)
    .maybeSingle();
  if (verification.error) throw new Error(verification.error.message);
  if (!verification.data) throw new Error("Brand Partner verification is required before managing campaigns.");
  if (
    verification.data.status !== "approved" ||
    !verification.data.campaign_scope_approved ||
    !verification.data.compliance_scope_approved
  ) {
    throw new Error("Brand campaign authority requires approved identity, campaign scope, and compliance scope.");
  }

  const partner = await supabase
    .from("brand_partners")
    .upsert({
      brand_user_id: userId,
      verification_request_id: verification.data.id,
      partner_key: `brand-user-${userId}`,
      name: verification.data.organization_name,
      category: verification.data.brand_category || "brand",
      active: true,
    }, { onConflict: "brand_user_id" })
    .select("id,brand_user_id,verification_request_id,name,category")
    .single();
  if (partner.error || !partner.data) throw new Error(partner.error?.message ?? "Brand organization identity could not be established.");

  return { verification: verification.data, partner: partner.data };
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const authority = await requireBrandCampaignAuthority(supabase, user.id);

    const campaigns = await supabase
      .from("brand_campaign_drafts")
      .select("id,title,description,campaign_type,deliverables,status,created_at,updated_at")
      .eq("brand_user_id", user.id)
      .eq("partner_id", authority.partner.id)
      .order("updated_at", { ascending: false });
    if (campaigns.error) throw new Error(campaigns.error.message);

    return NextResponse.json({
      organization: {
        id: authority.partner.id,
        name: authority.partner.name,
        category: authority.partner.category,
      },
      campaigns: campaigns.data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load Brand campaigns." },
      { status: 403 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const authority = await requireBrandCampaignAuthority(supabase, user.id);
    const body = await req.json() as Record<string, unknown>;

    for (const forbidden of ["partnerId", "scholarId", "athleteProfileId", "nilDealId", "productId"]) {
      if (body[forbidden] != null) {
        return NextResponse.json(
          { error: `${forbidden} cannot be supplied by a Brand campaign draft.` },
          { status: 400 }
        );
      }
    }

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const campaignType = String(body.campaignType ?? "").trim();
    const deliverables = Array.isArray(body.deliverables)
      ? body.deliverables.slice(0, MAX_DELIVERABLES).map(value => String(value).trim()).filter(Boolean)
      : [];

    if (!title || title.length > MAX_TITLE) {
      return NextResponse.json({ error: `Campaign title is required and must be ${MAX_TITLE} characters or fewer.` }, { status: 400 });
    }
    if (!campaignType || campaignType.length > 80) {
      return NextResponse.json({ error: "Campaign type is required and must be 80 characters or fewer." }, { status: 400 });
    }
    if (description.length > MAX_DESCRIPTION) {
      return NextResponse.json({ error: `Campaign description must be ${MAX_DESCRIPTION} characters or fewer.` }, { status: 400 });
    }

    const campaign = await supabase
      .from("brand_campaign_drafts")
      .insert({
        partner_id: authority.partner.id,
        brand_user_id: user.id,
        verification_request_id: authority.verification.id,
        title,
        description: description || null,
        campaign_type: campaignType,
        deliverables,
        status: "draft",
      })
      .select("id,title,description,campaign_type,deliverables,status,created_at,updated_at")
      .single();
    if (campaign.error || !campaign.data) throw new Error(campaign.error?.message ?? "Brand campaign draft could not be created.");

    return NextResponse.json({ ok: true, campaign: campaign.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create Brand campaign draft." },
      { status: 403 }
    );
  }
}
