import { createHash } from "crypto";
import type { PlaybookIdentityMapping } from "../../pbos/connector/contracts";
import { matchOpportunitiesFromSignals } from "../opportunity-graph/matching/OpportunityMatcher";
import { authorizePlaybookFoundation } from "./foundation";

export type OpportunityDecision = "SAVED" | "DISMISSED";
export type OpportunityStatus = "RECOMMENDED" | OpportunityDecision;

export interface OpportunitySignals {
  skills: readonly string[];
  majors: readonly string[];
  careers: readonly string[];
  opportunities: readonly string[];
}

export interface ExplainableOpportunityMatch {
  opportunityId: string;
  title: string;
  type: string;
  description: string;
  score: number;
  reasons: readonly string[];
  nextSteps: readonly string[];
}

export interface DurableOpportunityMatch extends ExplainableOpportunityMatch {
  id: string;
  status: OpportunityStatus;
  deliveryState: "PENDING" | "DELIVERED";
  provenance: readonly string[];
}

export interface OpportunityJourneyRepository {
  persistMatches(input: { ownerId: string; matches: readonly ExplainableOpportunityMatch[]; signalFingerprint: string;
    idempotencyKey: string; provenance: readonly string[] }): Promise<readonly DurableOpportunityMatch[]>;
  completeMatchDelivery(input: { ownerId: string; matchIds: readonly string[]; provenance: readonly string[] }): Promise<void>;
  stageDecision(input: { ownerId: string; matchId: string; decision: OpportunityDecision; idempotencyKey: string;
    provenance: readonly string[] }): Promise<DurableOpportunityMatch>;
  completeDecision(input: { ownerId: string; matchId: string; decision: OpportunityDecision;
    provenance: readonly string[] }): Promise<DurableOpportunityMatch>;
}

export interface OpportunityJourneyRuntime {
  registerIdentity(userId: string): Promise<PlaybookIdentityMapping>;
  publish(identity: PlaybookIdentityMapping, payload: Readonly<Record<string, unknown>>, correlationId: string): Promise<readonly string[]>;
}

function normalized(values: readonly string[]): string[] {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function fingerprintOpportunitySignals(signals: OpportunitySignals): string {
  return createHash("sha256").update(JSON.stringify({ skills: normalized(signals.skills), majors: normalized(signals.majors),
    careers: normalized(signals.careers), opportunities: normalized(signals.opportunities) })).digest("hex");
}

export function buildExplainableOpportunityMatches(signals: OpportunitySignals): readonly ExplainableOpportunityMatch[] {
  return matchOpportunitiesFromSignals({ skills: [...signals.skills], majors: [...signals.majors],
    careers: [...signals.careers], opportunities: [...signals.opportunities] }).matches
    .filter(match => match.reasons.length > 0)
    .map(match => ({ opportunityId: match.opportunity.id, title: match.opportunity.title, type: match.opportunity.type,
      description: match.opportunity.description, score: match.score, reasons: [...match.reasons], nextSteps: [...match.nextSteps] }));
}

export class OpportunityJourneyService {
  constructor(private readonly repository: OpportunityJourneyRepository, private readonly runtime: OpportunityJourneyRuntime) {}

  async discover(input: { actorId: string; ownerId: string; approvalId: string; signals: OpportunitySignals }) {
    const authority = authorizePlaybookFoundation({ userId: input.actorId, ownerId: input.ownerId,
      role: "SCHOLAR", approvalId: input.approvalId });
    const signalFingerprint = fingerprintOpportunitySignals(input.signals);
    const idempotencyKey = "opportunity-discovery-" + input.ownerId + "-" + signalFingerprint;
    const identity = await this.runtime.registerIdentity(input.actorId);
    const baseProvenance = [...authority.provenance, identity.pbosIdentity.provenance];
    const matches = buildExplainableOpportunityMatches(input.signals);
    const persisted = await this.repository.persistMatches({ ownerId: input.ownerId, matches, signalFingerprint,
      idempotencyKey, provenance: baseProvenance });
    const runtimeProvenance = await this.runtime.publish(identity, { eventType: "OPPORTUNITY_MATCHES_GENERATED",
      schemaVersion: "1.0.0", matchIds: persisted.map(match => match.id), signalFingerprint,
      explainableMatchCount: matches.length }, idempotencyKey);
    const provenance = [...baseProvenance, ...runtimeProvenance, input.approvalId];
    await this.repository.completeMatchDelivery({ ownerId: input.ownerId,
      matchIds: persisted.map(match => match.id), provenance });
    return { matches: persisted.map(match => ({ ...match, deliveryState: "DELIVERED" as const, provenance })),
      signalFingerprint, provenance };
  }

  async decide(input: { actorId: string; ownerId: string; approvalId: string; matchId: string;
    decision: OpportunityDecision; requestId: string }) {
    if (!input.matchId.trim() || !input.requestId.trim()) throw new Error("Opportunity decision requires match and request identifiers.");
    if (!(input.decision === "SAVED" || input.decision === "DISMISSED")) throw new Error("Opportunity decision is invalid.");
    const authority = authorizePlaybookFoundation({ userId: input.actorId, ownerId: input.ownerId,
      role: "SCHOLAR", approvalId: input.approvalId });
    const identity = await this.runtime.registerIdentity(input.actorId);
    const baseProvenance = [...authority.provenance, identity.pbosIdentity.provenance];
    await this.repository.stageDecision({ ownerId: input.ownerId, matchId: input.matchId,
      decision: input.decision, idempotencyKey: input.requestId, provenance: baseProvenance });
    const runtimeProvenance = await this.runtime.publish(identity, { eventType: "OPPORTUNITY_DECISION_RECORDED",
      schemaVersion: "1.0.0", matchId: input.matchId, decision: input.decision }, input.requestId);
    const provenance = [...baseProvenance, ...runtimeProvenance, input.approvalId];
    return await this.repository.completeDecision({ ownerId: input.ownerId, matchId: input.matchId,
      decision: input.decision, provenance });
  }
}
