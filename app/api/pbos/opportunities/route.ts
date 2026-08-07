import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { OpportunityJourneyService } from "@/lib/pbos/opportunity-journey-service";
import type { DurableOpportunityMatch, OpportunityDecision, OpportunitySignals } from "@/lib/pbos/opportunity-journey-service";
import { PlaybookConnector } from "@/pbos/connector/playbook-connector";
import type { PlaybookIdentityMapping } from "@/pbos/connector/contracts";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error("Missing protected server configuration: " + name);
  return value;
}

function runtime() {
  const client = new PlaybookPbosRuntimeClient(new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
    organizationId: required("PBOS_ORGANIZATION_ID"), connectorId: required("PBOS_CONNECTOR_ID"),
    keyId: required("PBOS_CONNECTOR_KEY_ID"), secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64")
  }));
  const connector = new PlaybookConnector(client);
  return {
    registerIdentity: (userId: string) => connector.registerIdentity(userId, "SCHOLAR"),
    async publish(identity: PlaybookIdentityMapping, payload: Readonly<Record<string, unknown>>, correlationId: string) {
      const response = await client.send("PUBLISH_LIFECYCLE_EVENT", { connectorId: "PLAYBOOK-CONNECTOR-001",
        domainRegistrationId: "PLAYBOOK-SCHOLAR-REGISTRATION-001", identityMappingId: identity.mappingId,
        correlationId, purpose: "Publish an approved owner-scoped opportunity journey event.", payload }, correlationId, correlationId);
      if (!response.success) throw new Error(response.error.message);
      return response.provenance;
    }
  };
}

function serialize(row: Record<string, unknown>): DurableOpportunityMatch {
  const status = String(row.status);
  const deliveryState = String(row.delivery_state);
  if (!(status === "RECOMMENDED" || status === "SAVED" || status === "DISMISSED")) throw new Error("Stored opportunity status is invalid.");
  if (!(deliveryState === "PENDING" || deliveryState === "DELIVERED")) throw new Error("Stored opportunity delivery state is invalid.");
  return { id: String(row.id), opportunityId: String(row.opportunity_key), title: String(row.title), type: String(row.opportunity_type),
    description: String(row.description ?? ""), score: Number(row.score),
    reasons: Array.isArray(row.reasons) ? row.reasons.map(String) : [],
    nextSteps: Array.isArray(row.next_steps) ? row.next_steps.map(String) : [], status,
    deliveryState, provenance: Array.isArray(row.provenance) ? row.provenance.map(String) : [] };
}

function repository(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"]) {
  return {
    async persistMatches(input: { ownerId: string; matches: readonly { opportunityId: string; title: string; type: string;
      description: string; score: number; reasons: readonly string[]; nextSteps: readonly string[] }[];
      signalFingerprint: string; idempotencyKey: string; provenance: readonly string[] }) {
      if (input.matches.length === 0) return [];
      const result = await supabase.from("pbos_opportunity_recommendations").upsert(input.matches.map(match => ({ owner_id: input.ownerId,
        opportunity_key: match.opportunityId, title: match.title, opportunity_type: match.type, description: match.description,
        score: match.score, reasons: match.reasons, next_steps: match.nextSteps, signal_fingerprint: input.signalFingerprint,
        discovery_idempotency_key: input.idempotencyKey, delivery_state: "PENDING", provenance: input.provenance })),
        { onConflict: "owner_id,opportunity_key" }).select("*");
      if (result.error) throw new Error(result.error.message);
      return (result.data ?? []).map(row => serialize(row as Record<string, unknown>));
    },
    async completeMatchDelivery(input: { ownerId: string; matchIds: readonly string[]; provenance: readonly string[] }) {
      if (input.matchIds.length === 0) return;
      const result = await supabase.from("pbos_opportunity_recommendations").update({ delivery_state: "DELIVERED",
        provenance: input.provenance }).eq("owner_id", input.ownerId).in("id", [...input.matchIds]);
      if (result.error) throw new Error(result.error.message);
    },
    async stageDecision(input: { ownerId: string; matchId: string; decision: OpportunityDecision; idempotencyKey: string;
      provenance: readonly string[] }) {
      const result = await supabase.from("pbos_opportunity_recommendations").update({ pending_action: input.decision,
        decision_idempotency_key: input.idempotencyKey, delivery_state: "PENDING", provenance: input.provenance })
        .eq("id", input.matchId).eq("owner_id", input.ownerId).select("*").single();
      if (result.error || !result.data) throw new Error(result.error?.message ?? "Owner-scoped opportunity was not found.");
      return serialize(result.data as Record<string, unknown>);
    },
    async completeDecision(input: { ownerId: string; matchId: string; decision: OpportunityDecision; provenance: readonly string[] }) {
      const result = await supabase.from("pbos_opportunity_recommendations").update({ status: input.decision,
        pending_action: null, delivery_state: "DELIVERED", provenance: input.provenance, decided_at: new Date().toISOString() })
        .eq("id", input.matchId).eq("owner_id", input.ownerId).select("*").single();
      if (result.error || !result.data) throw new Error(result.error?.message ?? "Opportunity decision could not be committed.");
      return serialize(result.data as Record<string, unknown>);
    }
  };
}

async function signalsForOwner(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], ownerId: string): Promise<OpportunitySignals> {
  const [academic, goals] = await Promise.all([
    supabase.from("ag_progress").select("subject,subject_name,years_completed,current_course").eq("user_id", ownerId),
    supabase.from("scholar_goals").select("title").eq("scholar_id", ownerId).eq("status", "ACTIVE")
  ]);
  if (academic.error) throw new Error(academic.error.message);
  if (goals.error) throw new Error(goals.error.message);
  const subjectSignals: Record<string, readonly string[]> = { A: ["critical thinking"], B: ["writing", "communication"],
    C: ["quantitative reasoning", "problem solving"], D: ["scientific thinking", "research"],
    E: ["communication"], F: ["creative thinking"], G: ["critical thinking"] };
  const completed = (academic.data ?? []).filter(row => Number(row.years_completed ?? 0) > 0);
  return { skills: completed.flatMap(row => [...(subjectSignals[String(row.subject)] ?? []), String(row.subject_name ?? "")]),
    majors: (goals.data ?? []).map(row => String(row.title ?? "")), careers: (goals.data ?? []).map(row => String(row.title ?? "")),
    opportunities: completed.map(row => String(row.current_course ?? "")) };
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const result = await supabase.from("pbos_opportunity_recommendations").select("*").eq("owner_id", user.id)
      .order("score", { ascending: false });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ matches: (result.data ?? []).map(row => serialize(row as Record<string, unknown>)) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Opportunity loading failed." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const service = new OpportunityJourneyService(repository(supabase), runtime());
    const result = await service.discover({ actorId: user.id, ownerId: user.id,
      approvalId: required("PBOS_OPPORTUNITY_JOURNEY_APPROVAL_ID"), signals: await signalsForOwner(supabase, user.id) });
    return NextResponse.json({ matches: result.matches, signalFingerprint: result.signalFingerprint });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Opportunity discovery failed." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { matchId?: unknown; decision?: unknown; requestId?: unknown };
    const decision = String(body.decision ?? "").toUpperCase() as OpportunityDecision;
    if (!(decision === "SAVED" || decision === "DISMISSED")) {
      return NextResponse.json({ error: "Decision must be SAVED or DISMISSED." }, { status: 400 });
    }
    const service = new OpportunityJourneyService(repository(supabase), runtime());
    const match = await service.decide({ actorId: user.id, ownerId: user.id,
      approvalId: required("PBOS_OPPORTUNITY_JOURNEY_APPROVAL_ID"), matchId: String(body.matchId ?? ""),
      decision, requestId: String(body.requestId ?? randomUUID()) });
    return NextResponse.json({ match });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Opportunity decision failed." }, { status: 500 });
  }
}
