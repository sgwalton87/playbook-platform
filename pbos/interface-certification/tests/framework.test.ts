import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  digestContent,
  discoverConstitutionalVolume,
} from "../../constitution";
import { Artifacts, Runtime } from "../../kernel";
import {
  certifyInterfaceImplementation,
  computeInterfaceImplementationDigest,
  evaluateInterfaceCertification,
  type InterfaceCertificationArtifact,
  type InterfaceCertificationDomainId,
} from "..";

const roots: string[] = [];

const controls: Record<
  InterfaceCertificationDomainId,
  string[]
> = {
  "IC-001": [
    "approved_design_system_usage",
    "visual_consistency",
    "component_reuse",
    "prohibited_duplication_absent",
  ],
  "IC-002": [
    "component_ownership",
    "component_versioning",
    "composition_rules",
    "lifecycle_management",
  ],
  "IC-003": [
    "spacing_tokens",
    "typography_tokens",
    "color_tokens",
    "theme_tokens",
    "responsive_tokens",
    "token_reuse",
  ],
  "IC-004": [
    "wcag_alignment",
    "keyboard_navigation",
    "screen_reader_support",
    "cognitive_accessibility",
    "inclusive_interaction",
  ],
  "IC-005": [
    "mobile",
    "tablet",
    "desktop",
    "future_device_compatibility",
    "adaptive_layouts",
  ],
  "IC-006": [
    "approved_interaction_patterns",
    "navigation_consistency",
    "feedback_behavior",
    "user_decision_support",
  ],
  "IC-007": [
    "loading",
    "empty",
    "success",
    "failure",
    "recovery",
    "permission",
    "offline",
  ],
  "IC-008": [
    "performance_expectations",
    "analytics_requirements",
    "error_monitoring",
    "user_behavior_understanding",
    "system_health_visibility",
  ],
};

function write(root: string, relativePath: string, content: string): void {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function arrange(): string {
  const root = mkdtempSync(
    path.join(tmpdir(), "pbos-interface-certification-")
  );
  roots.push(root);
  const directory =
    "docs/CONSTITUTION/VOLUME_34_INTERFACE_SYSTEM_ARCHITECTURE";
  write(
    root,
    `${directory}/README.md`,
    `---
id: VOLUME-34
title: Interface System Architecture
status: implementation_ready
---

# Purpose

Substantive constitutional interface system documentation.
`
  );
  write(
    root,
    `${directory}/PPS-3400_INTERFACE_SYSTEM_CONSTITUTIONAL_FRAMEWORK.md`,
    `---
id: PPS-3400
title: Interface System Constitutional Framework
status: implementation_ready
parent:
  - PPS-3300
---

# Authority

Substantive interface authority and implementation requirements.
`
  );
  write(
    root,
    "components/interface.tsx",
    "export function Interface() { return null; }\n"
  );
  write(
    root,
    "docs/release-evidence/interface-proof.md",
    "# Interface Proof\n\nAll governed controls were validated."
  );
  return root;
}

function evidencePackage(root: string) {
  const volume = discoverConstitutionalVolume(34, root);
  const evidencePath =
    "docs/release-evidence/interface-proof.md";
  const evidenceDigest = digestContent(
    "# Interface Proof\n\nAll governed controls were validated."
  );
  return {
    schemaVersion: 1,
    volume: "VOLUME-34",
    volumeDigest: volume.contentDigest,
    implementation: "test-interface",
    implementationDigest:
      computeInterfaceImplementationDigest(root),
    certificationTimestamp: "2026-07-29T04:00:00.000Z",
    validator: {
      id: "PBOS-INTERFACE-CERTIFICATION",
      version: "1.0.0",
    },
    validationComplete: true,
    domains: Object.fromEntries(
      Object.entries(controls).map(([id, requiredControls]) => [
        id,
        {
          controls: Object.fromEntries(
            requiredControls.map((control) => [control, true])
          ),
          evidence: [
            {
              path: evidencePath,
              digest: evidenceDigest,
              capturedAt: "2026-07-29T04:00:00.000Z",
            },
          ],
          findings: [],
        },
      ])
    ),
  };
}

function saveEvidence(root: string, value: unknown): void {
  write(
    root,
    "docs/release-evidence/volume-34-interface-evidence.json",
    JSON.stringify(value)
  );
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("PBOS interface certification framework", () => {
  it("fails closed with a pending artifact when evidence is absent", () => {
    const root = arrange();

    const run = certifyInterfaceImplementation(
      34,
      root,
      "2026-07-29T05:00:00.000Z"
    );

    expect(run.status).toBe("pending");
    expect(run.validationComplete).toBe(false);
    expect(run.score).toBe(0);
    expect(
      Object.values(run.domains).every(({ passed }) => !passed)
    ).toBe(true);
  });

  it("passes only complete identity-bound domain evidence", () => {
    const root = arrange();
    saveEvidence(root, evidencePackage(root));

    const first = certifyInterfaceImplementation(
      34,
      root,
      "2026-07-29T05:00:00.000Z"
    );
    const second = certifyInterfaceImplementation(
      34,
      root,
      "2026-07-29T05:01:00.000Z"
    );

    expect(first.status).toBe("passed");
    expect(first.score).toBe(100);
    expect(first.measurement?.measurementComplete).toBe(true);
    expect(first.measurement?.certificationEligible).toBe(false);
    const artifact = Runtime.load<InterfaceCertificationArtifact>(
      path.join(root, Artifacts.interfaceCertification)
    );
    expect(artifact.history).toHaveLength(2);
    expect(artifact.runId).toBe(second.runId);
  });

  it("rejects a false completion claim", () => {
    const root = arrange();
    const value = evidencePackage(root);
    value.domains["IC-001"].controls.visual_consistency = false;
    saveEvidence(root, value);

    const run = evaluateInterfaceCertification(
      discoverConstitutionalVolume(34, root),
      root,
      "2026-07-29T05:00:00.000Z"
    );

    expect(run.status).toBe("failed");
    expect(run.blockingConditions).toContain(
      "False completion claim: validationComplete is true while required interface domains are not PASS."
    );
  });

  it("rejects stale referenced evidence", () => {
    const root = arrange();
    const value = evidencePackage(root);
    value.domains["IC-004"].evidence[0].capturedAt =
      "2026-01-01T00:00:00.000Z";
    saveEvidence(root, value);

    const run = evaluateInterfaceCertification(
      discoverConstitutionalVolume(34, root),
      root,
      "2026-07-29T05:00:00.000Z"
    );

    expect(
      run.domains["IC-004"].blockingConditions.some((blocker) =>
        blocker.includes("stale")
      )
    ).toBe(true);
  });

  it("rejects an implementation digest mismatch", () => {
    const root = arrange();
    const value = evidencePackage(root);
    value.implementationDigest = "stale";
    saveEvidence(root, value);

    const run = evaluateInterfaceCertification(
      discoverConstitutionalVolume(34, root),
      root,
      "2026-07-29T05:00:00.000Z"
    );

    expect(run.blockingConditions).toContain(
      "Interface implementation digest does not match."
    );
  });
});
