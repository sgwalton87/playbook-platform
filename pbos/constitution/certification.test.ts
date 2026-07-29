import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Artifacts } from "../kernel";
import {
  computeInterfaceImplementationDigest,
  interfaceCertificationDomainIds,
} from "../interface-certification";
import {
  assertConstitutionalLifecycleTransition,
  certifyConstitutionalVolume,
  digestContent,
  discoverConstitutionalVolume,
  isConstitutionalLifecycleTransitionAllowed,
} from ".";
import { implementationValidationDomains } from "./implementation-validation";
import type { VolumeCertificationArtifact } from "./types";

const roots: string[] = [];

function write(root: string, relativePath: string, content: string): void {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function frontMatter(
  id: string,
  title: string,
  status: string,
  extra = ""
): string {
  return `---
id: ${id}
title: ${title}
version: 1.0.0
status: ${status}
classification: Constitutional
owners:
  - PBOS
${extra}---
`;
}

function substantive(text: string): string {
  return `${text}

This constitutional evidence is explicit, reviewable, identity-bound, and
substantive. It governs implementation without inventing missing authority.
The requirements are mandatory, testable, preserved in history, and subject
to fail-closed PBOS validation before any lifecycle recommendation is made.
`;
}

function arrangeVolume(
  status: string,
  options: { missingDependency?: boolean } = {}
): string {
  const root = mkdtempSync(
    path.join(tmpdir(), "pbos-volume-certification-")
  );
  roots.push(root);
  const volumePath =
    "docs/CONSTITUTION/VOLUME_34_INTERFACE_SYSTEM_ARCHITECTURE";
  write(
    root,
    `${volumePath}/README.md`,
    frontMatter("VOLUME-34", "Interface System Architecture", status) +
      substantive("# Purpose\nVolume 34 governs interface systems.")
  );
  write(
    root,
    `${volumePath}/PPS-3400_INTERFACE_SYSTEM_CONSTITUTIONAL_FRAMEWORK.md`,
    frontMatter(
      "PPS-3400",
      "Interface System Constitutional Framework",
      status,
      `parent:
  - PPS-3300
depends_on:
  - PPS-3300
  - PPS-003
related:
${Array.from(
  { length: 9 },
  (_, index) => `  - PPS-340${index + 1}`
).join("\n")}
`
    ) +
      substantive(
        "# Authority\nPPS-3400 is the sole constitutional authority."
      )
  );

  const documents = [
    [
      "PPS-3401_DESIGN_SYSTEM_ARCHITECTURE.md",
      "PPS-3401",
      "Design System Architecture",
      "# Security\nSecurity requirements are mandatory.",
    ],
    [
      "PPS-3402_COMPONENT_ARCHITECTURE.md",
      "PPS-3402",
      "Component Architecture",
      "# Performance\nPerformance budgets are validated.",
    ],
    [
      "PPS-3403_INTERACTION_PATTERN_LIBRARY.md",
      "PPS-3403",
      "Interaction Pattern Library",
      "# Multi Operating System Compatibility\nEvery Role Operating System inherits equivalent behavior.",
    ],
    [
      "PPS-3404_RESPONSIVE_AND_DEVICE_ARCHITECTURE.md",
      "PPS-3404",
      "Responsive and Device Architecture",
      "# Analytics\nAdoption and interaction events are registered.",
    ],
    [
      "PPS-3405_ACCESSIBILITY_INTERFACE_STANDARD.md",
      "PPS-3405",
      "Accessibility Interface Standard",
      "# Accessibility Testing\nKeyboard, screen reader and assistive technology testing validate contrast.",
    ],
    [
      "PPS-3406_UI_STATE_ARCHITECTURE.md",
      "PPS-3406",
      "UI State Architecture",
      "# Experience States\nLoading, empty, success, error, recovery, permission, and offline states are required.",
    ],
    [
      "PPS-3407_DESIGN_TOKEN_ARCHITECTURE.md",
      "PPS-3407",
      "Design Token Architecture",
      "# Observability\nToken adoption and drift are observable.",
    ],
    [
      "PPS-3408_COMPONENT_GOVERNANCE_AND_VERSIONING.md",
      "PPS-3408",
      "Component Governance and Versioning",
      "# Governance\nChanges require versioned evidence.",
    ],
    [
      "PPS-3409_INTERFACE_CERTIFICATION_FRAMEWORK.md",
      "PPS-3409",
      "Interface Certification Framework",
      "# PBOS Validation\nPBOS validation requires evidence and must fail closed.",
    ],
  ] as const;

  for (const [filename, id, title, body] of documents) {
    write(
      root,
      `${volumePath}/${filename}`,
      frontMatter(
        id,
        title,
        status,
        `parent:
  - PPS-3400
depends_on:
  - PPS-3300
`
      ) + substantive(body)
    );
  }

  write(
    root,
    "docs/PPS/33_USER_EXPERIENCE/PPS-3300.md",
    frontMatter(
      "PPS-3300",
      "User Experience Constitutional Framework",
      "Canonical"
    ) + substantive("# Authority\nHuman experience authority.")
  );
  if (!options.missingDependency) {
    write(
      root,
      "docs/PPS/00_CONSTITUTION/PPS-003.md",
      frontMatter("PPS-003", "Experience Principles", "Canonical") +
        substantive("# Principles\nFoundational experience principles.")
    );
  }
  return root;
}

function writePassingInterfaceEvidence(root: string): void {
  write(
    root,
    "components/interface-reference.tsx",
    `export function InterfaceReference() {
  return <main aria-label="Interface reference">Validated interface</main>;
}
`
  );
  const volume = discoverConstitutionalVolume(34, root);
  const evidencePath =
    "docs/release-evidence/interface-certification-proof.md";
  const evidenceContent =
    "# Interface Certification Proof\n\nAll required controls passed.";
  write(root, evidencePath, evidenceContent);
  const controls = [
    "approved_design_system_usage",
    "visual_consistency",
    "component_reuse",
    "prohibited_duplication_absent",
    "component_ownership",
    "component_versioning",
    "composition_rules",
    "lifecycle_management",
    "spacing_tokens",
    "typography_tokens",
    "color_tokens",
    "theme_tokens",
    "responsive_tokens",
    "token_reuse",
    "wcag_alignment",
    "keyboard_navigation",
    "screen_reader_support",
    "cognitive_accessibility",
    "inclusive_interaction",
    "mobile",
    "tablet",
    "desktop",
    "future_device_compatibility",
    "adaptive_layouts",
    "approved_interaction_patterns",
    "navigation_consistency",
    "feedback_behavior",
    "user_decision_support",
    "loading",
    "empty",
    "success",
    "failure",
    "recovery",
    "permission",
    "offline",
    "performance_expectations",
    "analytics_requirements",
    "error_monitoring",
    "user_behavior_understanding",
    "system_health_visibility",
  ];
  write(
    root,
    "docs/release-evidence/volume-34-interface-evidence.json",
    JSON.stringify({
      schemaVersion: 1,
      volume: "VOLUME-34",
      volumeDigest: volume.contentDigest,
      implementation: "test-interface",
      implementationDigest:
        computeInterfaceImplementationDigest(root),
      certificationTimestamp: "2026-07-28T11:00:00.000Z",
      validator: {
        id: "PBOS-INTERFACE-CERTIFICATION",
        version: "1.0.0",
      },
      validationComplete: true,
      domains: Object.fromEntries(
        interfaceCertificationDomainIds.map((id) => [
          id,
          {
            controls: Object.fromEntries(
              controls.map((control) => [control, true])
            ),
            evidence: [
              {
                path: evidencePath,
                digest: digestContent(evidenceContent),
                capturedAt: "2026-07-28T11:00:00.000Z",
              },
            ],
            findings: [],
          },
        ])
      ),
    })
  );
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("constitutional volume certification", () => {
  it("discovers explicit authority and lifecycle metadata", () => {
    const root = arrangeVolume("Draft Constitutional");

    const volume = discoverConstitutionalVolume(34, root);

    expect(volume.authorityId).toBe("PPS-3400");
    expect(volume.authority?.metadata.id).toBe("PPS-3400");
    expect(volume.lifecycle).toBe("draft");
    expect(volume.documents).toHaveLength(11);
  });

  it("certifies explicit evidence and preserves durable history", () => {
    const root = arrangeVolume("certified");
    writePassingInterfaceEvidence(root);

    const first = certifyConstitutionalVolume(
      34,
      root,
      "2026-07-28T12:00:00.000Z"
    );
    const second = certifyConstitutionalVolume(
      34,
      root,
      "2026-07-28T12:01:00.000Z"
    );

    expect(first.status).toBe("PASS");
    expect(first.certificationScore).toBe(100);
    expect(first.promotionRecommendation).toMatchObject({
      eligible: true,
      targetLifecycle: "canonical",
    });
    const artifact = JSON.parse(
      readFileSync(path.join(root, Artifacts.volumeCertification), "utf8")
    ) as VolumeCertificationArtifact;
    expect(artifact.history).toHaveLength(2);
    expect(artifact.latest.runId).toBe(second.runId);
    expect(
      readFileSync(
        path.join(
          root,
          "docs/release-evidence/volume-34-certification.md"
        ),
        "utf8"
      )
    ).toContain("No lifecycle transition was applied.");
  });

  it("does not skip lifecycle stages for a draft volume", () => {
    const root = arrangeVolume("draft");

    const report = certifyConstitutionalVolume(34, root);

    expect(report.failedRules).toEqual(["INT-010"]);
    expect(report.promotionRecommendation).toMatchObject({
      eligible: true,
      targetLifecycle: "architecture_complete",
    });
  });

  it("does not recommend certification with incomplete implementation validation", () => {
    const root = arrangeVolume("implementation_ready");
    const volume = discoverConstitutionalVolume(34, root);
    write(
      root,
      "docs/release-evidence/volume-34-implementation-validation.json",
      JSON.stringify({
        schemaVersion: 1,
        volume: "VOLUME-34",
        lifecycle: "implementation_ready",
        contentDigest: volume.contentDigest,
        validationTimestamp: "2026-07-29T04:00:00.000Z",
        validator: {
          id: "PBOS-VOLUME-IMPLEMENTATION-VALIDATOR",
          version: "1.0.0",
        },
        validationComplete: false,
        results: implementationValidationDomains.map((domain) => ({
          domain,
          status: "INCOMPLETE",
          evidence: [],
          findings: ["Validation evidence is incomplete."],
        })),
        blockingConditions: ["Implementation remains incomplete."],
      })
    );

    const report = certifyConstitutionalVolume(34, root);

    expect(report.failedRules).toEqual(["INT-010"]);
    expect(report.promotionRecommendation).toMatchObject({
      eligible: false,
      action: "BLOCKED",
    });
  });

  it("fails closed when a declared dependency is missing", () => {
    const root = arrangeVolume("certified", {
      missingDependency: true,
    });

    const report = certifyConstitutionalVolume(34, root);
    const dependencyRule = report.rules.find(
      ({ id }) => id === "INT-004"
    );

    expect(dependencyRule?.passed).toBe(false);
    expect(dependencyRule?.blockingConditions).toContain(
      "Dependency PPS-003 does not resolve."
    );
    expect(report.promotionRecommendation.eligible).toBe(false);
  });

  it("blocks undocumented lifecycle states", () => {
    const root = arrangeVolume("ready");

    const report = certifyConstitutionalVolume(34, root);

    expect(report.lifecycle).toBe("blocked");
    expect(report.rules[0].blockingConditions).toContain(
      "Undocumented constitutional lifecycle state: ready."
    );
  });
});

describe("constitutional volume lifecycle", () => {
  it("allows only documented adjacent promotion transitions", () => {
    expect(
      isConstitutionalLifecycleTransitionAllowed(
        "draft",
        "architecture_complete"
      )
    ).toBe(true);
    expect(
      isConstitutionalLifecycleTransitionAllowed("draft", "canonical")
    ).toBe(false);
    expect(() =>
      assertConstitutionalLifecycleTransition("draft", "canonical")
    ).toThrow("transition denied");
  });
});
