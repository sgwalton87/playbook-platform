import type { PlaybookIdentityMapping } from "../../pbos/connector/contracts";
import { authorizePlaybookFoundation } from "./foundation";

export const TRANSCRIPT_MEDIA_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
export const MAX_TRANSCRIPT_BASE64_LENGTH = 16 * 1024 * 1024;

export function validateTranscriptInput(base64: string, mediaType: string): void {
  if (!base64.trim()) throw new Error("Transcript file is required.");
  if (base64.length > MAX_TRANSCRIPT_BASE64_LENGTH) throw new Error("Transcript file exceeds the governed size limit.");
  if (!(TRANSCRIPT_MEDIA_TYPES as readonly string[]).includes(mediaType)) throw new Error("Transcript file type is not supported.");
}

export interface AcademicJourneyRepository {
  saveEvidence(input: { ownerId: string; readinessScore: number; agUpdates: number; idempotencyKey: string; provenance: readonly string[] }): Promise<{ evidenceId: string }>;
  completeEvidence(input: { ownerId: string; evidenceId: string; provenance: readonly string[] }): Promise<void>;
}

export interface AcademicJourneyRuntime {
  registerIdentity(userId: string): Promise<PlaybookIdentityMapping>;
  publish(identity: PlaybookIdentityMapping, evidenceId: string, readinessScore: number, correlationId: string): Promise<readonly string[]>;
}

export class AcademicTranscriptJourneyService {
  constructor(private readonly repository: AcademicJourneyRepository, private readonly runtime: AcademicJourneyRuntime) {}

  async complete(input: { actorId: string; ownerId: string; approvalId: string; readinessScore: number; agUpdates: number; idempotencyKey: string }) {
    if (!input.idempotencyKey.trim()) throw new Error("Academic journey idempotency key required.");
    if (!Number.isFinite(input.readinessScore) || input.readinessScore < 0 || input.readinessScore > 100) throw new Error("Academic readiness score is invalid.");
    const authority = authorizePlaybookFoundation({ userId: input.actorId, ownerId: input.ownerId, role: "SCHOLAR", approvalId: input.approvalId });
    const identity = await this.runtime.registerIdentity(input.actorId);
    const baseProvenance = [...authority.provenance, identity.pbosIdentity.provenance];
    const evidence = await this.repository.saveEvidence({ ownerId: input.ownerId, readinessScore: input.readinessScore,
      agUpdates: input.agUpdates, idempotencyKey: input.idempotencyKey, provenance: baseProvenance });
    const runtimeProvenance = await this.runtime.publish(identity, evidence.evidenceId, input.readinessScore, input.idempotencyKey);
    const provenance = [...baseProvenance, ...runtimeProvenance, input.approvalId];
    await this.repository.completeEvidence({ ownerId: input.ownerId, evidenceId: evidence.evidenceId, provenance });
    return { evidenceId: evidence.evidenceId, readinessScore: input.readinessScore, provenance };
  }
}
