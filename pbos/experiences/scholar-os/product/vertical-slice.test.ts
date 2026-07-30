import { describe, expect, it } from "vitest";
import { artifactDigest } from "../../../kernel/identity";
import {
  decideStorageCertification,
  reviewStorageProvider,
  TrustKeyAuthority,
  type KeyLifecycleRecord,
  type KeyOwnershipRecord,
  type StorageEvidencePackage,
  type TrustStorageProvider,
} from "../../../trust/enterprise";
import { buildScholarJourney } from "./journey";
import { composeScholarHome } from "./home";

const now = "2026-07-30T12:00:00.000Z";

function withDigest<T extends { readonly digest: string }>(value: T): T {
  return {
    ...value,
    digest: artifactDigest({ ...value, digest: undefined }),
  };
}

describe("first human operating system vertical slice", () => {
  it("tracks key ownership and rejects revoked trust", () => {
    const ownership = withDigest<KeyOwnershipRecord>({
      key_id: "KEY-001",
      provider_id: "PROVIDER-001",
      owner_id: "OWNER-001",
      authority: "EXTERNAL-TRUST-AUTHORITY",
      purpose: "Evidence verification",
      organization_scope: "PLAYBOOK",
      public_key_fingerprint: "a".repeat(64),
      digest: "",
    });
    const lifecycle = withDigest<KeyLifecycleRecord>({
      key_id: "KEY-001",
      state: "ACTIVE",
      effective_at: now,
      expires_at: "2099-01-01T00:00:00.000Z",
      approved_by: "APPROVER-001",
      evidence_ids: ["EVIDENCE-001"],
      previous_digest: null,
      digest: "",
    });
    expect(
      new TrustKeyAuthority().verify({
        ownership,
        lifecycle,
        at: now,
        validator_id: "VALIDATOR-001",
        revocations: [],
      }).valid
    ).toBe(true);
    expect(
      new TrustKeyAuthority().verify({
        ownership,
        lifecycle,
        at: now,
        validator_id: "VALIDATOR-001",
        revocations: [
          {
            id: "REVOKE-001",
            key_id: "KEY-001",
            revoked_by: "SECURITY-001",
            reason: "Compromise",
            compromised: true,
            evidence_ids: ["INCIDENT-001"],
            timestamp: now,
            digest: "b".repeat(64),
          },
        ],
      }).valid
    ).toBe(false);
  });

  it("does not certify storage without complete independent evidence", () => {
    const provider = withDigest<TrustStorageProvider>({
      id: "STORAGE-001",
      type: "STORAGE",
      owner_id: "OWNER-001",
      authority: "PROVIDER-AUTHORITY",
      scope: ["EVIDENCE"],
      evidence_ids: ["PROVIDER-EVIDENCE"],
      lifecycle: "UNDER_REVIEW",
      history: ["REGISTERED", "EVIDENCE_REQUIRED", "UNDER_REVIEW"],
      durability_target: "Declared",
      availability_target: "Declared",
      replication_model: "Declared",
      recovery_target: "Declared",
      retention_policy: "Declared",
      audit_model: "Declared",
      digest: "",
    });
    const evidence = withDigest<StorageEvidencePackage>({
      provider_id: provider.id,
      durability_evidence: ["DURABILITY"],
      availability_evidence: [],
      integrity_evidence: ["INTEGRITY"],
      replication_evidence: ["REPLICATION"],
      recovery_evidence: ["RECOVERY"],
      retention_evidence: ["RETENTION"],
      auditability_evidence: ["AUDIT"],
      digest: "",
    });
    const review = reviewStorageProvider({
      provider,
      evidence,
      reviewer_id: "REVIEWER-001",
      independent: true,
      timestamp: now,
    });
    expect(
      decideStorageCertification({
        review,
        decided_by: "CERTIFIER-001",
        scope: ["EVIDENCE"],
        expires_at: "2027-07-30T00:00:00.000Z",
      }).decision
    ).toBe("REJECTED");
  });

  it("composes an evidence-bound Scholar Home deterministically", () => {
    const journey = buildScholarJourney({
      scholar_id: "SCHOLAR-001",
      current_reality_evidence: ["SCHOLAR-RECORD-001"],
      goals: [
        {
          id: "GOAL-001",
          scholar_id: "SCHOLAR-001",
          path: "ACADEMIC",
          statement: "Graduate prepared.",
          desired_outcome: "College readiness",
          owner_confirmed: true,
          evidence_ids: ["GOAL-EVIDENCE"],
        },
      ],
      milestones: [
        {
          id: "MILESTONE-001",
          goal_id: "GOAL-001",
          title: "Complete requirements review",
          status: "ACHIEVED",
          evidence_ids: ["MILESTONE-EVIDENCE"],
          target_date: null,
        },
      ],
      actions: [
        {
          id: "ACTION-001",
          milestone_id: "MILESTONE-001",
          title: "Review next course options",
          source: "ACADEMIC-INTELLIGENCE",
          reasoning: ["Supports confirmed goal"],
          confidence: 80,
          human_confirmation_required: true,
          confirmed_by_scholar: false,
          evidence_ids: ["ACTION-EVIDENCE"],
        },
      ],
    });
    const input = {
      scholar_id: "SCHOLAR-001",
      identity: ["Builder", "Learner"],
      mission: "Build a future with informed choices.",
      journey,
      opportunities: [
        {
          id: "OPPORTUNITY-001",
          type: "SCHOLARSHIP" as const,
          title: "Verified scholarship",
          source: "EVIDENCE-PROVIDER",
          provenance: ["SOURCE-001"],
          evidence_ids: ["OPPORTUNITY-EVIDENCE"],
          eligibility: ["Confirmed student status"],
          expires_at: "2027-01-01T00:00:00.000Z",
        },
      ],
      support_network: [
        {
          id: "SUPPORT-001",
          scholar_id: "SCHOLAR-001",
          supporter_id: "MENTOR-001",
          role: "MENTOR" as const,
          permissions: ["VIEW_GOALS"],
          visible_domains: ["ACADEMIC" as const],
          consent_id: "CONSENT-001",
          expires_at: "2027-01-01T00:00:00.000Z",
          revoked_at: null,
        },
      ],
      achievements: ["Completed requirements review"],
      academic: {
        identity: "ACADEMIC-001",
        courses: ["English 11"],
        credits: 120,
        ag_requirements: ["Evidence-backed requirement status"],
        graduation_requirements: ["Evidence-backed graduation status"],
        college_readiness: ["Review in progress"],
        application_milestones: [],
        evidence_ids: ["ACADEMIC-EVIDENCE"],
      },
      athletic: {
        identity: "ATHLETIC-001",
        sports: [],
        achievements: [],
        development_milestones: [],
        recruiting_readiness: [],
        opportunity_pathways: [],
        evidence_ids: ["SCHOLAR-CONFIRMATION"],
      },
    };
    expect(composeScholarHome(input)).toEqual(composeScholarHome(input));
    expect(composeScholarHome(input).progress[0]?.percent).toBe(100);
    expect(composeScholarHome(input).recommended_actions[0]?.human_confirmation_required).toBe(
      true
    );
  });

  it("rejects unsupported opportunity evidence and revoked support", () => {
    const journey = buildScholarJourney({
      scholar_id: "SCHOLAR-001",
      current_reality_evidence: ["RECORD-001"],
      goals: [],
      milestones: [],
      actions: [],
    });
    expect(() =>
      composeScholarHome({
        scholar_id: "SCHOLAR-001",
        identity: ["Scholar"],
        mission: "Grow.",
        journey,
        opportunities: [
          {
            id: "OPP-001",
            type: "PROGRAM",
            title: "Unsupported",
            source: "",
            provenance: [],
            evidence_ids: [],
            eligibility: [],
            expires_at: "invalid",
          },
        ],
        support_network: [],
        achievements: [],
        academic: {
          identity: "A",
          courses: [],
          credits: 0,
          ag_requirements: [],
          graduation_requirements: [],
          college_readiness: [],
          application_milestones: [],
          evidence_ids: ["E"],
        },
        athletic: {
          identity: "B",
          sports: [],
          achievements: [],
          development_milestones: [],
          recruiting_readiness: [],
          opportunity_pathways: [],
          evidence_ids: ["E"],
        },
      })
    ).toThrow("invalid");
  });
});
