import { cpSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { BuildMilestone } from "../manifests";
import { evaluateProductMission, formatProductMission } from "./product-mission";
import { runMissionControl } from "./orchestrator";

function milestone(): BuildMilestone {
  return {
    id: "EXPERIENCE-001", name: "Experience", type: "MILESTONE",
    description: "Define experience.", domain: "operating-systems", priority: 100,
    status: "READY", dependencies: [], blocking_dependencies: [],
    required_artifacts: [], required_capabilities: [], validation_requirements: ["integrity"],
    risk_level: "YELLOW", approval_level: "HUMAN", completion_definition: ["Defined."],
    evidence_requirements: ["Evidence"], owner: "Experience", version: "1.0.0",
    outputs: ["docs/product-package.md"],
    mission_control: {
      objective: "Build Playbook Scholar Experience V1",
      phase: "Product Definition",
      completed: [{ label: "Product Strategy", evidence: ["docs/strategy.md"] }],
      generating: [{ label: "Product Requirement Package", output: "docs/product-package.md" }],
      next_human_decision: "Approve Scholar Experience Build",
    },
  };
}

describe("product mission presentation", () => {
  it("reports READY only when canonical completion evidence exists", () => {
    const root = mkdtempSync(join(tmpdir(), "pbos-product-mission-"));
    mkdirSync(join(root, "docs"));
    writeFileSync(join(root, "docs", "strategy.md"), "strategy");
    const view = evaluateProductMission(milestone(), root);
    expect(view?.ready).toBe(true);
    expect(formatProductMission(view!)).toContain("Status:\nREADY FOR BUILD PACKAGE REVIEW");
  });

  it("fails closed when canonical completion evidence is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "pbos-product-mission-"));
    const view = evaluateProductMission(milestone(), root);
    expect(view?.ready).toBe(false);
    expect(view?.findings).toContain("Product Strategy evidence is missing: docs/strategy.md");
  });

  it("generates selected Scholar packages and continues into authority reuse", async () => {
    const root = mkdtempSync(join(tmpdir(), "pbos-product-mission-"));
    mkdirSync(join(root, "pbos", "manifests"), { recursive: true });
    mkdirSync(join(root, "docs", "EXPERIENCE"), { recursive: true });
    cpSync(
      join(process.cwd(), "pbos", "manifests", "playbook-master-manifest.yaml"),
      join(root, "pbos", "manifests", "playbook-master-manifest.yaml")
    );
    for (const source of [
      "PBOS_SCHOLAR_OS_PRODUCT_ARCHITECTURE.md",
      "PBOS_SCHOLAR_OS_SCREEN_SPECIFICATIONS.md",
      "PBOS_SCHOLAR_OS_USER_JOURNEY_ARCHITECTURE.md",
      "PBOS_SCHOLAR_OS_APPLICATION_ARCHITECTURE.md",
      "PBOS_SCHOLAR_OS_APPLICATION_COMPOSITION_ARCHITECTURE.md",
    ]) {
      cpSync(join(process.cwd(), "docs", "EXPERIENCE", source), join(root, "docs", "EXPERIENCE", source));
    }
    const dispatched: string[] = [];
    const mission = await runMissionControl(async (command) => {
      dispatched.push(command);
      return command === "status"
        ? { command, successful: true, output: "Context Trust: VERIFIED" }
        : command === "next"
          ? {
              command,
              successful: true,
              output: "Next Eligible Milestone: SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001",
            }
          : {
              command,
              successful: true,
              output: "PBOS EXISTING AUTHORITY FOUND\nPBOS EXECUTION READY\nPackage: PACKAGE-001",
            };
    }, root);
    expect(dispatched).toEqual(["status", "next", "run"]);
    expect(mission.output).toContain("Current Phase:\nProduct Package Generation");
    expect(mission.output).toContain("Status:\nREADY FOR BUILD PACKAGE REVIEW");
    expect(mission.output).toContain("PBOS EXISTING AUTHORITY FOUND");
    expect(mission.outcome.authority_reused).toBe(true);
  });
});
