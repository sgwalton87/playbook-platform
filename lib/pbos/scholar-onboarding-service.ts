import type { PlaybookIdentityMapping } from "../../pbos/connector/contracts";
import { authorizePlaybookFoundation } from "./foundation";

export interface ScholarJourneyRepository {
  persistOnboarding(input: { scholarId: string; displayName: string; goalTitle: string; approvalId: string; idempotencyKey: string; provenance: readonly string[] }): Promise<{ scholarRecordId: string; goalId: string }>;
  persistDashboard(input: { scholarId: string; scholarRecordId: string; goalId: string; exchangeApprovalId: string; idempotencyKey: string; provenance: readonly string[] }): Promise<void>;
}

export interface ScholarPbosRuntime {
  registerIdentity(userId: string): Promise<PlaybookIdentityMapping>;
  publishOnboarding(identity: PlaybookIdentityMapping, scholarRecordId: string, correlationId: string): Promise<readonly string[]>;
  projectDashboard(identity: PlaybookIdentityMapping, scholarRecordId: string, sectionIds: readonly string[], exchangeApprovalId: string, correlationId: string): Promise<readonly string[]>;
}

export interface CompleteScholarOnboarding {
  actorId: string;
  ownerId: string;
  displayName: string;
  goalTitle: string;
  identityApprovalId: string;
  exchangeApprovalId: string;
  idempotencyKey: string;
}

export class ScholarOnboardingService {
  constructor(private readonly repository: ScholarJourneyRepository, private readonly runtime: ScholarPbosRuntime) {}

  async complete(input: CompleteScholarOnboarding) {
    if (!input.exchangeApprovalId) throw new Error("PBOS dashboard exchange approval required.");
    if (!input.idempotencyKey) throw new Error("Scholar journey idempotency key required.");
    const authority = authorizePlaybookFoundation({ userId: input.actorId, ownerId: input.ownerId, role: "SCHOLAR", approvalId: input.identityApprovalId });
    const identity = await this.runtime.registerIdentity(input.actorId);
    const baseProvenance = [...authority.provenance, identity.pbosIdentity.provenance];
    const record = await this.repository.persistOnboarding({ scholarId: input.ownerId, displayName: input.displayName,
      goalTitle: input.goalTitle, approvalId: input.identityApprovalId, idempotencyKey: input.idempotencyKey, provenance: baseProvenance });
    const onboardingProvenance = await this.runtime.publishOnboarding(identity, record.scholarRecordId, input.idempotencyKey + "-onboarding");
    const sectionIds = ["identity", "goals"] as const;
    const dashboardProvenance = await this.runtime.projectDashboard(identity, record.scholarRecordId, sectionIds,
      input.exchangeApprovalId, input.idempotencyKey + "-dashboard");
    const provenance = [...baseProvenance, ...onboardingProvenance, ...dashboardProvenance, input.exchangeApprovalId];
    await this.repository.persistDashboard({ scholarId: input.ownerId, scholarRecordId: record.scholarRecordId,
      goalId: record.goalId, exchangeApprovalId: input.exchangeApprovalId, idempotencyKey: input.idempotencyKey, provenance });
    return { scholarRecordId: record.scholarRecordId, goalId: record.goalId, sectionIds, provenance };
  }
}
