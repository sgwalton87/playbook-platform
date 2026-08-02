import { NextRequest, NextResponse } from "next/server";
import { athleteApiFailure, governedCommandFailure, requireIdempotencyKey, requireSameOrigin, requireScholarAthleteApi } from "@/lib/scholar-athlete/api";
import { parseNILDealCommand, parseNILStage } from "@/lib/scholar-athlete/contracts";
import { incrementMetric } from "@/lib/observability";

type NILPatchBody = {
  action?: unknown;
  dealId?: unknown;
  nextStage?: unknown;
  reason?: unknown;
  agreementReference?: unknown;
  jurisdiction?: unknown;
  institutionName?: unknown;
};

function requiredText(value: unknown, label: string, maximum: number): string | null {
  return typeof value === "string" && value.trim().length >= 3 && value.trim().length <= maximum
    ? value.trim()
    : null;
}

export async function POST(request: NextRequest) {
  const origin = requireSameOrigin(request);
  if (!origin.ok) return origin.response;
  const boundary = await requireScholarAthleteApi();
  if (!boundary.ok) return boundary.response;
  const idempotency = requireIdempotencyKey(request);
  if (!idempotency.ok) return idempotency.response;
  const parsed = parseNILDealCommand(await request.json().catch(() => null));
  if (!parsed.ok) return athleteApiFailure(parsed.error, 422);
  const value = parsed.value;
  const { data, error } = await boundary.supabase.rpc("create_nil_opportunity", {
    p_brand_name: value.brandName,
    p_opportunity_title: value.opportunityTitle,
    p_opportunity_type: value.opportunityType,
    p_compensation_type: value.compensationType,
    p_compensation_amount: value.compensationAmount,
    p_source_name: value.sourceName,
    p_source_url: value.sourceUrl,
    p_jurisdiction: value.jurisdiction,
    p_institution_name: value.institutionName,
    p_idempotency_key: idempotency.value,
  });
  if (error) return governedCommandFailure(error);
  incrementMetric("nil_workflow_readiness_total");
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const origin = requireSameOrigin(request);
  if (!origin.ok) return origin.response;
  const boundary = await requireScholarAthleteApi();
  if (!boundary.ok) return boundary.response;
  const idempotency = requireIdempotencyKey(request);
  if (!idempotency.ok) return idempotency.response;
  const body = (await request.json().catch(() => null)) as NILPatchBody | null;
  const dealId = requiredText(body?.dealId, "Deal", 80);
  const reason = requiredText(body?.reason, "Reason", 2000);
  if (!dealId || !reason) return athleteApiFailure("Deal and reason are required.", 422);
  if (body?.action === "transition") {
    const stage = parseNILStage(body.nextStage);
    if (!stage.ok) return athleteApiFailure(stage.error, 422);
    const { data, error } = await boundary.supabase.rpc("transition_nil_deal", {
      p_deal_id: dealId,
      p_next_stage: stage.value,
      p_reason: reason,
      p_idempotency_key: idempotency.value,
    });
    if (error) return governedCommandFailure(error);
    incrementMetric("nil_workflow_readiness_total");
    return NextResponse.json(data);
  }
  if (body?.action === "submit_compliance") {
    const agreement = requiredText(body.agreementReference, "Agreement reference", 500);
    const jurisdiction = requiredText(body.jurisdiction, "Jurisdiction", 160);
    const institution = typeof body.institutionName === "string" ? body.institutionName.trim().slice(0, 200) : "";
    if (!agreement || !jurisdiction) return athleteApiFailure("Agreement reference and jurisdiction are required.", 422);
    const { data, error } = await boundary.supabase.rpc("submit_nil_compliance", {
      p_deal_id: dealId,
      p_agreement_reference: agreement,
      p_jurisdiction: jurisdiction,
      p_institution_name: institution,
      p_reason: reason,
      p_idempotency_key: idempotency.value,
    });
    if (error) return governedCommandFailure(error);
    incrementMetric("nil_workflow_readiness_total");
    return NextResponse.json(data);
  }
  return athleteApiFailure("Unsupported NIL action.", 422);
}
