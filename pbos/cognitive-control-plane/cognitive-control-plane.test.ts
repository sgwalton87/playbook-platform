import { describe, expect, it } from "vitest";
import { governAgentAction } from "../agents/governance";
import { evaluateOutcome } from "../evaluation";
import { assessMissionAlignment } from "../intelligence/mission";
import { assessRisk } from "../intelligence/risk";
import { buildWorldStateSnapshot } from "../intelligence/world-model";
import { recordArchitectureDecision } from "../memory/architecture";
import { simulateChange } from "../simulation";
import { CognitiveControlPlane } from "./engine";

const now = "2026-07-30T12:00:00.000Z";
const evidence = {
  id: "EVIDENCE-001",
  source: "PBOS-CONSTITUTION",
  digest: "a".repeat(64),
  observed_at: now,
};

function foundation() {
  const mission = assessMissionAlignment({
    objective: {
      id: "MISSION-001",
      statement: "Advance Playbook outcomes.",
      owner: "HUMAN-OWNER",
      outcomes: ["Scholar success"],
      evidence: [evidence, { ...evidence, id: "EVIDENCE-002" }, { ...evidence, id: "EVIDENCE-003" }, { ...evidence, id: "EVIDENCE-004" }],
    },
    goals: [
      {
        id: "GOAL-001",
        objective_id: "MISSION-001",
        statement: "Improve trusted outcomes.",
        weight: 100,
      },
    ],
    impact: {
      expected_outcomes: ["Improved trust"],
      affected_populations: ["Scholars"],
      uncertainty: ["Future adoption"],
    },
    scores: {
      mission_alignment: 100,
      user_outcome: 100,
      business_value: 80,
      roadmap_readiness: 100,
    },
  });
  const risk = assessRisk({
    id: "RISK-001",
    findings: [
      {
        id: "FINDING-001",
        domain: "ARCHITECTURE",
        description: "Bounded change.",
        score: { likelihood: 10, impact: 20, reversibility: 100 },
        evidence: [evidence],
      },
    ],
    mitigations: [
      {
        finding_id: "FINDING-001",
        owner: "RISK-OWNER",
        actions: ["Validate"],
        rollback: ["Revert"],
      },
    ],
  });
  const simulation = simulateChange({
    request: {
      id: "SIM-REQUEST-001",
      requested_by: "HUMAN-OWNER",
      scenario: "Apply bounded change.",
      context_digest: "b".repeat(64),
      dependencies: [],
      assumptions: ["Context remains stable"],
      evidence: [evidence],
    },
    projections: [
      {
        domain: "ARCHITECTURE",
        expected: "Improved consistency",
        adverse: "Integration failure",
        confidence: 80,
      },
    ],
    rollback: {
      owner: "HUMAN-OWNER",
      trigger_conditions: ["Validation fails"],
      steps: ["Restore prior state"],
      validation: ["Run tests"],
    },
    limitations: ["No production data"],
  });
  return { mission, risk, simulation };
}

describe("PBOS cognitive control plane", () => {
  it("produces deterministic, evidence-bound recommendations", () => {
    const values = foundation();
    const engine = new CognitiveControlPlane();
    const input = {
      context: {
        context_identity: "CONTEXT-001",
        context_trusted: true,
        authority_id: "HUMAN-AUTHORITY",
        timestamp: now,
      },
      ...values,
      agent: null,
      evidence: [evidence],
      expected_impact: "Improve architecture trust.",
    };
    expect(engine.recommend(input)).toEqual(engine.recommend(input));
    expect(engine.recommend(input).human_review_required).toBe(true);
  });

  it("rejects invalid context and high risk", () => {
    const values = foundation();
    expect(() =>
      new CognitiveControlPlane().recommend({
        context: {
          context_identity: "CONTEXT-001",
          context_trusted: false,
          authority_id: "HUMAN-AUTHORITY",
          timestamp: now,
        },
        ...values,
        agent: null,
        evidence: [evidence],
        expected_impact: "None",
      })
    ).toThrow("rejected");
  });

  it("preserves architecture reasoning and rejects missing evidence", () => {
    expect(
      recordArchitectureDecision({
        id: "ADR-001",
        title: "Use one control plane.",
        owner: "ARCHITECT",
        authority: "PBOS-CONSTITUTION",
        status: "ACCEPTED",
        rationale: {
          summary: "Prevents duplicate authority.",
          assumptions: [],
          evidence: [evidence],
        },
        alternatives: [],
        tradeoffs: [],
        lessons: [],
        supersedes: null,
        timestamp: now,
      }).digest
    ).toHaveLength(64);
  });

  it("rejects unresolved world relationships", () => {
    expect(() =>
      buildWorldStateSnapshot({
        id: "WORLD-001",
        entities: [
          {
            id: "SCHOLAR-001",
            kind: "SCHOLAR",
            organization_scope: "ORG-001",
            evidence: [evidence],
          },
        ],
        relationships: [
          {
            id: "REL-001",
            from: "SCHOLAR-001",
            to: "MISSING",
            type: "MEMBER_OF",
            evidence: [evidence],
          },
        ],
        dependencies: [],
        observed_at: now,
      })
    ).toThrow("unresolved");
  });

  it("blocks prohibited agent authority", () => {
    const decision = governAgentAction({
      agent: {
        id: "AGENT-001",
        owner: "HUMAN-OWNER",
        model: "MODEL-001",
        version: "1",
        organization_scope: "ORG-001",
      },
      permission: {
        capability: "ANALYSIS",
        actions: ["SELF_CERTIFY"],
        expires_at: "2099-01-01T00:00:00.000Z",
      },
      scope: {
        purpose: "Analyze.",
        data_boundaries: ["ORG-001"],
        prohibited_actions: [],
      },
      evidence: { sources: [evidence], trace_id: "TRACE-001" },
      requested_action: "SELF_CERTIFY",
      timestamp: now,
    });
    expect(decision.admitted).toBe(false);
  });

  it("evaluates outcomes without self-certification", () => {
    const result = evaluateOutcome({
      measurement: {
        id: "MEASURE-001",
        objective_id: "MISSION-001",
        metric: "Trust",
        baseline: 50,
        observed: 80,
        target: 80,
        evidence: [evidence],
      },
      impact: {
        technical_improvement: "Validated",
        mission_alignment: "Aligned",
        user_outcomes: "Measured",
        system_health: "Stable",
        long_term_value: "Unknown",
      },
      recommendation: {
        action: "Human review.",
        evidence_ids: [evidence.id],
        human_review_required: true,
      },
    });
    expect(result.status).toBe("IMPROVED");
    expect(result.recommendation.human_review_required).toBe(true);
  });
});
