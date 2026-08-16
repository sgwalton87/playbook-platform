import type { PlaybookIdentityMapping, PlaybookRole } from "../../pbos/connector/contracts";
import { authorizePlaybookFoundation } from "./foundation";

export type SupportedScholarRecordRole = Extract<PlaybookRole, "SCHOLAR" | "SCHOLAR_ATHLETE">;

export interface ScholarJourneyRepository {
  persistOnboarding(input: { scholarId: string; displayName: string; goalTitle: string; role: SupportedScholarRecordRole; approvalId: string; idempotencyKey: string; provenance: readonly string[] }): Promise<{ scholarRecordId: string; goalId: string }>;
  persistDashboard(input: { scholarId: string; scholarRecordId: string; goalId: string; role: SupportedScholarRecordRole; sectionIds: readonly string[]; exchangeApprovalId: string; idempotencyKey: string; provenance: readonly string[] }): Promise<void>;
}

export interface ScholarPbosRuntime {
  registerIdentity(userId: string): Promise<PlaybookIdentityMapping>;
  verifyReady(identity: PlaybookIdentityMapping, correlationId: string): Promise<readonly string[]>;
  publishOnboarding(identity: PlaybookIdentityMapping, scholarRecordId: string, correlationId: string): Promise<readonly string[]>;
  projectDashboard(identity: PlaybookIdentityMapping, scholarRecordId: string, sectionIds: readonly string[], exchangeApprovalId: string, correlationId: string): Promise<readonly string[]>;
}

export interface CompleteScholarOnboarding {
  actorId: string;
  ownerId: string;
  displayName: string;
  goalTitle: string;
  role?: SupportedScholarRecordRole;
  identityApprovalId: string;
  exchangeApprovalId: string;
  idempotencyKey: string;
}

export class ScholarOnboardingService {
  constructor(private readonly repository: ScholarJourneyRepository, private readonly runtime: ScholarPbosRuntime) {}

  async complete(input: CompleteScholarOnboarding) {
    if (!input.exchangeApprovalId) throw new Error("PBOS dashboard exchange approval required.");
    if (!input.idempotencyKey) throw new Error("Scholar journey idempotency key required.");
    const role = input.role ?? "SCHOLAR";
    const authority = authorizePlaybookFoundation({ userId: input.actorId, ownerId: input.ownerId, role, approvalId: input.identityApprovalId });
    const identity = await this.runtime.registerIdentity(input.actorId);
    if (identity.externalIdentity.role !== role || identity.pbosIdentity.role !== role) {
      throw new Error("PBOS identity role does not match the governed Scholar Record role.");
    }
    const readinessProvenance = await this.runtime.verifyReady(identity, input.idempotencyKey + "-health");
    const baseProvenance = [...authority.provenance, identity.pbosIdentity.provenance, ...readinessProvenance];
    const record = await this.repository.persistOnboarding({ scholarId: input.ownerId, displayName: input.displayName,
      goalTitle: input.goalTitle, role, approvalId: input.identityApprovalId, idempotencyKey: input.idempotencyKey, provenance: baseProvenance });
    const onboardingProvenance = await this.runtime.publishOnboarding(identity, record.scholarRecordId, input.idempotencyKey + "-onboarding");
    const sectionIds = role === "SCHOLAR_ATHLETE" ? (["identity", "goals", "athletics"] as const) : (["identity", "goals"] as const);
    const dashboardProvenance = await this.runtime.projectDashboard(identity, record.scholarRecordId, sectionIds,
      input.exchangeApprovalId, input.idempotencyKey + "-dashboard");
    const provenance = [...baseProvenance, ...onboardingProvenance, ...dashboardProvenance, input.exchangeApprovalId];
    await this.repository.persistDashboard({ scholarId: input.ownerId, scholarRecordId: record.scholarRecordId,
      goalId: record.goalId, role, sectionIds, exchangeApprovalId: input.exchangeApprovalId, idempotencyKey: input.idempotencyKey, provenance });
    return { scholarRecordId: record.scholarRecordId, goalId: record.goalId, role, sectionIds, provenance };
  }
}
