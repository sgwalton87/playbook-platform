import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadMasterBuildManifest } from "./loader";

function writeManifest(value: unknown): string {
  const root = mkdtempSync(join(tmpdir(), "pbos-build-manifest-"));
  mkdirSync(join(root, "pbos", "manifests"), { recursive: true });
  writeFileSync(
    join(root, "pbos", "manifests", "playbook-master-manifest.yaml"),
    JSON.stringify(value)
  );
  return root;
}

function validManifest() {
  return {
    manifest_id: "PLAYBOOK-MASTER-MANIFEST",
    version: "1.0.0",
    authority: "PBOS-KERNEL",
    program: "Playbook Platform",
    domains: [
      "platform", "operating-systems", "applications", "engines", "features",
      "infrastructure", "integrations", "security", "launch",
    ],
    milestones: [
      {
        id: "FOUNDATION-001",
        name: "Foundation",
        description: "Establish the foundation.",
        type: "MILESTONE",
        domain: "platform",
        priority: 100,
        status: "READY",
        dependencies: [] as string[],
        blocking_dependencies: [] as string[],
        required_artifacts: ["docs/foundation.md"],
        required_capabilities: ["foundation"],
        validation_requirements: ["foundation-test"],
        risk_level: "YELLOW",
        approval_level: "HUMAN",
        completion_definition: ["Foundation validates."],
        evidence_requirements: ["Validation evidence"],
        owner: "Platform Engineering",
        version: "1.0.0",
        outputs: ["docs/foundation.md"],
      },
    ],
  };
}

describe("master build manifest", () => {
  it("loads deterministically with a content identity", () => {
    const root = writeManifest(validManifest());
    expect(loadMasterBuildManifest(root)).toEqual(loadMasterBuildManifest(root));
    expect(loadMasterBuildManifest(root).digest).toMatch(/^[a-f0-9]{64}$/);
  });

  it("fails closed for unknown dependencies", () => {
    const value = validManifest();
    value.milestones[0].dependencies = ["UNKNOWN-001"];
    expect(() => loadMasterBuildManifest(writeManifest(value))).toThrow(
      "references unknown dependency"
    );
  });

  it("fails closed for incomplete governance metadata", () => {
    const value = validManifest();
    value.milestones[0].owner = "";
    expect(() => loadMasterBuildManifest(writeManifest(value))).toThrow(
      "identity and ownership"
    );
  });

  it("fails closed when Mission Control outputs are not declared", () => {
    const value = validManifest();
    Object.assign(value.milestones[0], {
      mission_control: {
        objective: "Build Experience V1",
        phase: "Product Definition",
        completed: [{ label: "Strategy", evidence: ["docs/strategy.md"] }],
        generating: [{ label: "Product Package", output: "docs/product.md" }],
        next_human_decision: "Approve Build",
      },
    });
    expect(() => loadMasterBuildManifest(writeManifest(value))).toThrow(
      "Mission Control output is undeclared"
    );
  });

  it("registers Scholar Experience product definition before Scholar OS", () => {
    const manifest = loadMasterBuildManifest(process.cwd()).manifest;
    const product = manifest.milestones.find(
      ({ id }) => id === "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001"
    );
    const scholar = manifest.milestones.find(({ id }) => id === "SCHOLAR-OS-001");
    expect(product?.status).toBe("READY");
    expect(product?.dependencies).toEqual(["PBOS-PRODUCT-FACTORY-BUILD-PACKAGE-VALIDATION-001"]);
    expect(scholar?.blocking_dependencies).toEqual([product?.id]);
  });
});
