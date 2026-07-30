import {
  scholarHomeExperienceDigest,
  scholarJourneyEventDigest,
  scholarJourneyExperienceDigest,
} from "./identity";
import type {
  ExperienceCapabilityDecision,
  ScholarHomeExperience,
  ScholarJourneyEvent,
  ScholarJourneyExperience,
} from "./types";

export function createScholarHomeExperience(
  scholarIdentity: string,
  identity: readonly string[],
  accomplishments: readonly string[],
  goals: readonly string[],
  nextActions: readonly string[],
  capabilityDecisions: readonly ExperienceCapabilityDecision[]
): ScholarHomeExperience {
  if (
    !scholarIdentity ||
    capabilityDecisions.some(
      (decision) =>
        decision.state === "AVAILABLE" && !decision.kernel_decision_reference
    )
  ) {
    throw new Error("Scholar home experience rejected.");
  }
  const body: ScholarHomeExperience = {
    scholar_identity: scholarIdentity,
    identity: [...identity],
    accomplishments: [...accomplishments],
    goals: [...goals],
    next_actions: [...nextActions],
    capability_decisions: [...capabilityDecisions],
    digest: "",
  };
  return Object.freeze({
    ...body,
    identity: Object.freeze([...body.identity]),
    accomplishments: Object.freeze([...body.accomplishments]),
    goals: Object.freeze([...body.goals]),
    next_actions: Object.freeze([...body.next_actions]),
    capability_decisions: Object.freeze([...body.capability_decisions]),
    digest: scholarHomeExperienceDigest(body),
  });
}

export function createScholarJourneyExperience(
  scholarIdentity: string,
  events: readonly ScholarJourneyEvent[]
): ScholarJourneyExperience {
  if (
    !scholarIdentity ||
    events.some(
      (event) =>
        event.scholar_identity !== scholarIdentity ||
        event.digest !== scholarJourneyEventDigest(event) ||
        event.evidence_references.length === 0
    )
  ) {
    throw new Error("Scholar journey experience rejected.");
  }
  const ordered = [...events].sort(
    (left, right) =>
      Date.parse(left.occurred_at) - Date.parse(right.occurred_at) ||
      left.event_id.localeCompare(right.event_id)
  );
  const body: ScholarJourneyExperience = {
    scholar_identity: scholarIdentity,
    events: ordered,
    digest: "",
  };
  return Object.freeze({
    ...body,
    events: Object.freeze(ordered),
    digest: scholarJourneyExperienceDigest(body),
  });
}
