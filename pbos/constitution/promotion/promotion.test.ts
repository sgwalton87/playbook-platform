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
import { Artifacts, Runtime } from "../../kernel";
import { discoverConstitutionalVolume } from "../discovery";
import type {
  CertificationRuleResult,
  ConstitutionalVolumeLifecycle,
  VolumeCertificationArtifact,
  VolumeCertificationRun,
} from "../types";
import { certificationRuleIds } from "../types";
import { promoteConstitutionalVolume } from "./promote";
import type {
  VolumePromotionArtifact,
  VolumePromotionRecord,
} from "./types";

const roots: string[] = [];

function write(root: string, relativePath: string, content: string): void {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function arrange(
  lifecycle: ConstitutionalVolumeLifecycle = "draft"
): string {
  const root = mkdtempSync(path.join(tmpdir(), "pbos-volume-promote-"));
  roots.push(root);
  const directory =
    "docs/CONSTITUTION/VOLUME_34_INTERFACE_SYSTEM_ARCHITECTURE";
  write(
    root,
    `${directory}/README.md`,
    `---
id: VOLUME-34
title: Interface System Architecture
status: ${lifecycle}
---

# Purpose

This is substantive constitutional volume documentation with explicit
authority, evidence, governance, lifecycle, and implementation boundaries.
`
  );
  write(
    root,
    `${directory}/PPS-3400_INTERFACE_SYSTEM_CONSTITUTIONAL_FRAMEWORK.md`,
    `---
id: PPS-3400
title: Interface System Constitutional Framework
status: ${lifecycle}
parent:
  - PPS-3300
---

# Authority

This authority contains substantive constitutional requirements, explicit
dependencies, promotion evidence, accessibility, quality, and governance.
`
  );
  return root;
}

function certificationRules(
  canonicalReady = false
): CertificationRuleResult[] {
  return certificationRuleIds.map((id) => ({
    id,
    name: id,
    passed: id !== "INT-010" || canonicalReady,
    evidence: ["fixture"],
    blockingConditions:
      id !== "INT-010" || canonicalReady ? [] : ["Not certified."],
  }));
}

function saveCertification(
  root: string,
  lifecycle: ConstitutionalVolumeLifecycle,
  options: {
    digest?: string;
    score?: number;
    canonicalReady?: boolean;
  } = {}
): VolumeCertificationRun {
  const volume = discoverConstitutionalVolume(34, root);
  const rules = certificationRules(options.canonicalReady);
  const run: VolumeCertificationRun = {
    runId: `certification-${lifecycle}`,
    volume: 34,
    volumeId: "VOLUME-34",
    volumePath: volume.directory,
    authorityId: "PPS-3400",
    lifecycle,
    lifecycleSource: lifecycle,
    contentDigest: options.digest ?? volume.contentDigest,
    evaluatedAt: "2026-07-28T00:00:00.000Z",
    status: options.canonicalReady ? "PASS" : "FAIL",
    certificationScore:
      options.score ?? (options.canonicalReady ? 100 : 90),
    rules,
    passedRules: rules.filter(({ passed }) => passed).map(({ id }) => id),
    failedRules: rules.filter(({ passed }) => !passed).map(({ id }) => id),
    blockingConditions: rules.flatMap(
      ({ blockingConditions }) => blockingConditions
    ),
    promotionRecommendation: {
      eligible: true,
      action: "REVIEW_TRANSITION",
      targetLifecycle:
        lifecycle === "certified" ? "canonical" : "architecture_complete",
      reason: "Fixture recommendation.",
    },
  };
  const artifact: VolumeCertificationArtifact = {
    schemaVersion: 1,
    owner: "volume-certification",
    latest: run,
    history: [run],
  };
  Runtime.save(
    path.join(root, Artifacts.volumeCertification),
    artifact,
    "volume-certification"
  );
  return run;
}

function promotionRecord(
  from: ConstitutionalVolumeLifecycle,
  to: ConstitutionalVolumeLifecycle,
  index: number
): VolumePromotionRecord {
  return {
    promotionId: `promotion-${index}`,
    volume: 34,
    volumeId: "VOLUME-34",
    from,
    to,
    approved: true,
    evidence: ["pbos/runtime/volume-certification.json"],
    certificationRunId: `certification-${from}`,
    contentDigestBefore: `before-${index}`,
    contentDigestAfter: `after-${index}`,
    timestamp: `2026-07-28T00:0${index}:00.000Z`,
    blockingConditions: [],
    reason: "Fixture promotion.",
  };
}

function savePromotionHistory(
  root: string,
  records: VolumePromotionRecord[]
): void {
  const artifact: VolumePromotionArtifact = {
    schemaVersion: 1,
    owner: "volume-promotion",
    latest: records[records.length - 1],
    history: records,
  };
  Runtime.save(
    path.join(root, Artifacts.volumePromotion),
    artifact,
    "volume-promotion"
  );
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("constitutional volume promotion", () => {
  it("promotes draft to architecture_complete from current evidence", () => {
    const root = arrange();
    saveCertification(root, "draft");

    const result = promoteConstitutionalVolume(
      34,
      "architecture_complete",
      root,
      "2026-07-28T01:00:00.000Z"
    );

    expect(result.approved).toBe(true);
    expect(
      discoverConstitutionalVolume(34, root).lifecycle
    ).toBe("architecture_complete");
    const artifact = Runtime.load<VolumePromotionArtifact>(
      path.join(root, Artifacts.volumePromotion)
    );
    expect(artifact.history).toHaveLength(1);
    expect(artifact.latest.contentDigestAfter).not.toBeNull();
  });

  it("rejects a skipped transition without mutating documents", () => {
    const root = arrange();
    saveCertification(root, "draft");

    const result = promoteConstitutionalVolume(
      34,
      "certified",
      root
    );

    expect(result.approved).toBe(false);
    expect(result.blockingConditions[0]).toContain(
      "Skipped or invalid"
    );
    expect(discoverConstitutionalVolume(34, root).lifecycle).toBe(
      "draft"
    );
  });

  it("rejects stale certification identity", () => {
    const root = arrange();
    saveCertification(root, "draft", { digest: "stale-digest" });

    const result = promoteConstitutionalVolume(
      34,
      "architecture_complete",
      root
    );

    expect(result.approved).toBe(false);
    expect(result.blockingConditions).toContain(
      "Certification content digest is stale."
    );
  });

  it("detects lifecycle state with no governed promotion history", () => {
    const root = arrange("architecture_complete");
    saveCertification(root, "architecture_complete");

    const result = promoteConstitutionalVolume(
      34,
      "implementation_ready",
      root
    );

    expect(result.approved).toBe(false);
    expect(result.blockingConditions).toContain(
      "Lifecycle architecture_complete has no governed promotion history."
    );
  });

  it("requires a content-bound implementation plan", () => {
    const root = arrange("architecture_complete");
    savePromotionHistory(root, [
      promotionRecord("draft", "architecture_complete", 1),
    ]);
    const certification = saveCertification(
      root,
      "architecture_complete"
    );

    const denied = promoteConstitutionalVolume(
      34,
      "implementation_ready",
      root
    );
    expect(denied.approved).toBe(false);
    write(
      root,
      "docs/release-evidence/volume-34-implementation-readiness.md",
      `# VOLUME-34 Implementation Readiness

Content identity: ${certification.contentDigest}

## Implementation Dependencies

All implementation dependencies are explicit.

## Implementation Strategy

The governed plan defines validation, ownership, sequencing, and evidence.

## Engineering Readiness

Engineering boundaries, testing, accessibility, and performance are defined.

## PBOS Lifecycle Evidence

Only architecture_complete to implementation_ready is authorized.
`
    );

    const approved = promoteConstitutionalVolume(
      34,
      "implementation_ready",
      root
    );
    expect(approved.approved).toBe(true);
  });

  it("requires explicit canonical approval bound to certified content", () => {
    const root = arrange("certified");
    savePromotionHistory(root, [
      promotionRecord("draft", "architecture_complete", 1),
      promotionRecord(
        "architecture_complete",
        "implementation_ready",
        2
      ),
      promotionRecord("implementation_ready", "certified", 3),
    ]);
    const certification = saveCertification(root, "certified", {
      canonicalReady: true,
    });
    write(
      root,
      "docs/release-evidence/volume-34-canonical-approval.json",
      JSON.stringify({
        volume: 34,
        contentDigest: certification.contentDigest,
        approved: true,
      })
    );

    const result = promoteConstitutionalVolume(
      34,
      "canonical",
      root
    );

    expect(result.approved).toBe(true);
    expect(discoverConstitutionalVolume(34, root).lifecycle).toBe(
      "canonical"
    );
  });

  it("preserves denied and approved promotion attempts", () => {
    const root = arrange();
    saveCertification(root, "draft", { score: 80 });
    const denied = promoteConstitutionalVolume(
      34,
      "architecture_complete",
      root
    );
    expect(denied.approved).toBe(false);
    saveCertification(root, "draft");

    const approved = promoteConstitutionalVolume(
      34,
      "architecture_complete",
      root
    );
    expect(approved.approved).toBe(true);
    const artifact = JSON.parse(
      readFileSync(
        path.join(root, Artifacts.volumePromotion),
        "utf8"
      )
    ) as VolumePromotionArtifact;
    expect(artifact.history.map(({ approved: value }) => value)).toEqual([
      false,
      true,
    ]);
  });
});
