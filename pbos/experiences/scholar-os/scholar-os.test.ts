import { describe, expect, it } from "vitest";
import {
  experienceCapabilityDigest,
  scholarDecisionBoundaryDigest,
  scholarExperienceFactDigest,
  scholarJourneyEventDigest,
  scholarOSNavigationItemDigest,
} from "./identity";
import {
  ExperienceCapabilityFramework,
  enforceScholarDecisionBoundary,
  validateScholarExperienceFact,
} from "./governance";
import { createScholarHomeExperience, createScholarJourneyExperience } from "./models";
import { resolveScholarNavigation } from "./navigation";
import type {
  ExperienceCapability,
  ExperienceContext,
  ScholarDecisionBoundary,
  ScholarExperienceFact,
  ScholarJourneyEvent,
  ScholarOSNavigationItem,
} from "./types";

const now = "2026-07-30T12:00:00.000Z";

function context(
  overrides: Partial<ExperienceContext> = {}
): ExperienceContext {
  return {
    actor_identity: "SCHOLAR-001",
    scholar_identity: "SCHOLAR-001",
    role: "SCHOLAR",
    permissions: ["scholar.record.read", "scholar.sensitive.read"],
    consents: ["CONSENT-SCHOLAR-RECORD"],
    ...overrides,
  };
}

function capability(
  overrides: Partial<ExperienceCapability> = {}
): ExperienceCapability {
  const body: ExperienceCapability = {
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    domain: "IDENTITY",
    required_permission: "scholar.record.read",
    required_consent: "CONSENT-SCHOLAR-RECORD",
    kernel_decision_reference: "KERNEL-DECISION-001",
    kernel_state: "AVAILABLE",
    sensitive: true,
    allowed_roles: ["SCHOLAR"],
    digest: "",
    ...overrides,
  };
  return { ...body, digest: experienceCapabilityDigest(body) };
}

function fact(overrides: Partial<ScholarExperienceFact> = {}): ScholarExperienceFact {
  const body: ScholarExperienceFact = {
    fact_id: "FACT-001",
    scholar_identity: "SCHOLAR-001",
    owner_identity: "SCHOLAR-001",
    domain: "STORY",
    label: "Achievement",
    value: "Completed a verified program.",
    source: "VERIFIED_SYSTEM",
    source_reference: "SOURCE-001",
    evidence_references: ["EVIDENCE-001"],
    human_confirmed: true,
    recorded_at: now,
    revision: 1,
    previous_digest: null,
    sensitive: false,
    digest: "",
    ...overrides,
  };
  return { ...body, digest: scholarExperienceFactDigest(body) };
}

describe("Scholar OS experience foundation", () => {
  it("exposes only Kernel-available, permitted, consented capabilities", () => {
    const framework = new ExperienceCapabilityFramework();
    const available = framework.evaluate(capability(), context());
    expect(available.state).toBe("AVAILABLE");
    expect(
      framework.evaluate(
        capability(),
        context({ permissions: [] })
      ).state
    ).toBe("REQUIRES_PERMISSION");
    expect(
      framework.evaluate(
        capability({ kernel_state: "LOCKED" }),
        context()
      ).state
    ).toBe("LOCKED");
    expect(
      framework.evaluate(
        capability({ kernel_decision_reference: null }),
        context()
      ).state
    ).toBe("UNAVAILABLE");
  });

  it("preserves Scholar ownership, provenance, and sensitive authorization", () => {
    expect(validateScholarExperienceFact(fact(), context())).toEqual([]);
    expect(
      validateScholarExperienceFact(
        fact({ owner_identity: "OTHER" }),
        context()
      )
    ).toContain("Scholar ownership is invalid.");
    expect(
      validateScholarExperienceFact(
        fact({ evidence_references: [] }),
        context()
      )
    ).toContain("Scholar fact requires provenance and human confirmation.");
    expect(
      validateScholarExperienceFact(
        fact({ sensitive: true }),
        context({ permissions: ["scholar.record.read"] })
      )
    ).toContain("Sensitive Scholar information requires authorization.");
  });

  it("rejects autonomous decisions and unsupported facts", () => {
    const body: ScholarDecisionBoundary = {
      action: "RECOMMEND",
      actor_identity: "COMPASS-ENGINE",
      scholar_identity: "SCHOLAR-001",
      explanation: "Evidence-linked recommendation.",
      evidence_references: ["EVIDENCE-001"],
      human_confirmation_required: true,
      digest: "",
    };
    const allowed = { ...body, digest: scholarDecisionBoundaryDigest(body) };
    expect(enforceScholarDecisionBoundary(allowed)).toEqual(allowed);
    const prohibitedBody = { ...body, action: "CREATE_FACT" as const, digest: "" };
    const prohibited = {
      ...prohibitedBody,
      digest: scholarDecisionBoundaryDigest(prohibitedBody),
    };
    expect(() => enforceScholarDecisionBoundary(prohibited)).toThrow(
      "rejected"
    );
  });

  it("builds deterministic governed home, journey, and navigation models", () => {
    const decision = new ExperienceCapabilityFramework().evaluate(
      capability(),
      context()
    );
    expect(
      createScholarHomeExperience(
        "SCHOLAR-001",
        ["FACT-IDENTITY-001"],
        ["FACT-STORY-001"],
        ["FACT-GOAL-001"],
        ["ACTION-001"],
        [decision]
      ).capability_decisions
    ).toHaveLength(1);
    const eventBody: ScholarJourneyEvent = {
      event_id: "EVENT-001",
      scholar_identity: "SCHOLAR-001",
      journey: "ACADEMIC",
      milestone: "Completed a semester.",
      evidence_references: ["EVIDENCE-001"],
      occurred_at: now,
      digest: "",
    };
    const event = { ...eventBody, digest: scholarJourneyEventDigest(eventBody) };
    expect(
      createScholarJourneyExperience("SCHOLAR-001", [event]).events
    ).toEqual([event]);
    const navBody: ScholarOSNavigationItem = {
      navigation_id: "NAV-IDENTITY",
      label: "Identity",
      domain: "IDENTITY",
      capability_id: capability().capability_id,
      required_permission: "scholar.record.read",
      allowed_roles: ["SCHOLAR"],
      order: 1,
      digest: "",
    };
    const nav = { ...navBody, digest: scholarOSNavigationItemDigest(navBody) };
    expect(resolveScholarNavigation([nav], [decision], context())).toEqual([
      nav,
    ]);
    expect(
      resolveScholarNavigation(
        [nav],
        [decision],
        context({ role: "PARENT" })
      )
    ).toEqual([]);
  });
});
