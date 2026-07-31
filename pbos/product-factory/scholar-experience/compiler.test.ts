import { existsSync, mkdtempSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { BuildMilestone } from "../../manifests";
import {
  compileScholarExperiencePackageSet,
  persistScholarExperiencePackageSet,
  validateScholarExperiencePackageSet,
} from ".";

const sources = [
  "PBOS_SCHOLAR_OS_PRODUCT_ARCHITECTURE.md",
  "PBOS_SCHOLAR_OS_SCREEN_SPECIFICATIONS.md",
  "PBOS_SCHOLAR_OS_USER_JOURNEY_ARCHITECTURE.md",
  "PBOS_SCHOLAR_OS_APPLICATION_ARCHITECTURE.md",
  "PBOS_SCHOLAR_OS_APPLICATION_COMPOSITION_ARCHITECTURE.md",
];

function root(): string {
  const value = mkdtempSync(join(tmpdir(), "pbos-scholar-packages-"));
  const directory = join(value, "docs", "EXPERIENCE");
  mkdirSync(directory, { recursive: true });
  for (const source of sources) writeFileSync(join(directory, source), `# ${source}\nCanonical evidence.`);
  return value;
}

function milestone(outputs = [
  "docs/release-evidence/SCHOLAR_EXPERIENCE_V1_PRODUCT_REQUIREMENTS_001.md",
  "docs/release-evidence/SCHOLAR_EXPERIENCE_V1_EXPERIENCE_PACKAGE_001.md",
  "docs/release-evidence/SCHOLAR_EXPERIENCE_V1_ENGINEERING_PACKAGE_001.md",
]): BuildMilestone {
  return {
    id: "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001", name: "Scholar", type: "MILESTONE",
    description: "Compile packages.", domain: "operating-systems", priority: 99,
    status: "READY", dependencies: [], blocking_dependencies: [], required_artifacts: [],
    required_capabilities: [], validation_requirements: ["package-identity"], risk_level: "YELLOW",
    approval_level: "HUMAN", completion_definition: ["Packages generated."],
    evidence_requirements: ["Package digest"], owner: "Scholar OS Governance", version: "1.0.0",
    outputs,
  };
}

describe("Scholar Experience package compiler", () => {
  it("creates deterministic identities and declared outputs", () => {
    const directory = root();
    const first = compileScholarExperiencePackageSet(directory);
    const second = compileScholarExperiencePackageSet(directory);
    expect(first).toEqual(second);
    expect(first.packages.map(({ package_id }) => package_id)).toHaveLength(3);
    expect(new Set(first.packages.map(({ package_id }) => package_id)).size).toBe(3);
    expect(validateScholarExperiencePackageSet(milestone(), directory).valid).toBe(false);
    persistScholarExperiencePackageSet(directory);
    expect(validateScholarExperiencePackageSet(milestone(), directory).valid).toBe(true);
    expect(first.packages.every(({ path }) => existsSync(join(directory, path)))).toBe(true);
  });

  it("invalidates packages when architecture evidence changes", () => {
    const directory = root();
    persistScholarExperiencePackageSet(directory);
    writeFileSync(
      join(directory, "docs", "EXPERIENCE", sources[0]),
      "# Changed canonical evidence"
    );
    expect(validateScholarExperiencePackageSet(milestone(), directory).findings).toContain(
      "Package artifact identity is stale or invalid: docs/release-evidence/SCHOLAR_EXPERIENCE_V1_PRODUCT_REQUIREMENTS_001.md"
    );
  });

  it("rejects package outputs outside milestone authority", () => {
    const directory = root();
    persistScholarExperiencePackageSet(directory);
    const validation = validateScholarExperiencePackageSet(milestone([]), directory);
    expect(validation.valid).toBe(false);
    expect(validation.findings.some((finding) => finding.startsWith("Package output is not declared"))).toBe(true);
  });

  it("fails closed when architecture evidence is missing", () => {
    const directory = root();
    unlinkSync(join(directory, "docs", "EXPERIENCE", sources[0]));
    expect(() => compileScholarExperiencePackageSet(directory)).toThrow();
  });
});
