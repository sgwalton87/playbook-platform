import { describe, expect, it } from "vitest";
import { mapEvidenceRow } from "@/lib/scholar/models/evidence";

describe("evidence provenance", () => {
  it("maps ownership, source, verification, observation, and consent fields", () => {
    const evidence = mapEvidenceRow({ id: "e1", evidence_type: "document", title: "Transcript", owner_id: "s1", source: "School SIS", source_type: "institution", verification_state: "verified", verification_actor_id: "u1", verification_actor_role: "educator", verified_at: "2026-08-01T00:00:00Z", last_observed_at: "2026-08-01T00:00:00Z", visibility: "school", consent_scope: "relationship" });
    expect(evidence).toMatchObject({ ownerId: "s1", sourceType: "institution", verificationState: "verified", verified: true, consentScope: "relationship" });
  });
});
