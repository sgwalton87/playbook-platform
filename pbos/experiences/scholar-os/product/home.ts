import { artifactDigest } from "../../../kernel/identity";
import type {
  ScholarHome,
  ScholarJourney,
  ScholarOpportunity,
  ScholarSupportRelationship,
} from "./types";

export function composeScholarHome(input: {
  readonly scholar_id: string;
  readonly identity: readonly string[];
  readonly mission: string;
  readonly journey: ScholarJourney;
  readonly opportunities: readonly ScholarOpportunity[];
  readonly support_network: readonly ScholarSupportRelationship[];
  readonly achievements: readonly string[];
  readonly academic: ScholarHome["academic"];
  readonly athletic: ScholarHome["athletic"];
}): ScholarHome {
  if (
    !input.scholar_id ||
    input.journey.scholar_id !== input.scholar_id ||
    input.identity.length === 0 ||
    !input.mission ||
    input.academic.evidence_ids.length === 0 ||
    input.athletic.evidence_ids.length === 0 ||
    input.opportunities.some(
      ({ source, provenance, evidence_ids, eligibility, expires_at }) =>
        !source ||
        provenance.length === 0 ||
        evidence_ids.length === 0 ||
        eligibility.length === 0 ||
        !Number.isFinite(Date.parse(expires_at))
    ) ||
    input.support_network.some(
      ({ scholar_id, consent_id, permissions, revoked_at }) =>
        scholar_id !== input.scholar_id ||
        !consent_id ||
        permissions.length === 0 ||
        revoked_at !== null
    )
  ) {
    throw new Error("Scholar home evidence, permission, or identity is invalid.");
  }
  const body: ScholarHome = {
    scholar_id: input.scholar_id,
    identity: [...input.identity],
    mission: input.mission,
    goals: input.journey.goals,
    progress: input.journey.progress,
    milestones: input.journey.milestones,
    recommended_actions: input.journey.actions.filter(
      ({ confirmed_by_scholar }) => !confirmed_by_scholar
    ),
    opportunities: [...input.opportunities].sort((a, b) =>
      a.expires_at.localeCompare(b.expires_at)
    ),
    support_network: [...input.support_network].sort((a, b) =>
      a.id.localeCompare(b.id)
    ),
    achievements: [...input.achievements],
    academic: input.academic,
    athletic: input.athletic,
    states: ["LOADING", "EMPTY", "SUCCESS", "ERROR", "PERMISSION", "PRIVACY"],
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
