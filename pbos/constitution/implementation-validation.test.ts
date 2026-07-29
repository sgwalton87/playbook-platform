import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { discoverConstitutionalVolume } from "./discovery";
import {
  evaluateImplementationValidation,
  implementationValidationDomains,
} from "./implementation-validation";
import { digestContent } from "./metadata";

const roots: string[] = [];

function write(root: string, relativePath: string, content: string): void {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function arrange(): {
  root: string;
  digest: string;
  evidencePath: string;
  evidenceDigest: string;
} {
  const root = mkdtempSync(
    path.join(tmpdir(), "pbos-implementation-validation-")
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

Substantive implementation-ready constitutional volume documentation.
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

Substantive interface system authority and implementation requirements.
`
  );
  const evidencePath = "docs/release-evidence/domain-validation.md";
  const evidenceContent =
    "# Domain Validation\n\nIdentity-bound passing implementation evidence.";
  write(root, evidencePath, evidenceContent);
  return {
    root,
    digest: discoverConstitutionalVolume(34, root).contentDigest,
    evidencePath,
    evidenceDigest: digestContent(evidenceContent),
  };
}

function artifact(
  digest: string,
  evidencePath: string,
  evidenceDigest: string
) {
  return {
    schemaVersion: 1,
    volume: "VOLUME-34",
    lifecycle: "implementation_ready",
    contentDigest: digest,
    validationTimestamp: "2026-07-29T04:00:00.000Z",
    validator: {
      id: "PBOS-VOLUME-IMPLEMENTATION-VALIDATOR",
      version: "1.0.0",
    },
    validationComplete: true,
    results: implementationValidationDomains.map((domain) => ({
      domain,
      status: "PASS",
      evidence: [
        {
          path: evidencePath,
          digest: evidenceDigest,
        },
      ],
      findings: [],
    })),
    blockingConditions: [],
  };
}

function writeArtifact(root: string, value: unknown): void {
  write(
    root,
    "docs/release-evidence/volume-34-implementation-validation.json",
    JSON.stringify(value)
  );
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("volume implementation validation evidence", () => {
  it("accepts complete identity-bound domain evidence", () => {
    const fixture = arrange();
    writeArtifact(
      fixture.root,
      artifact(
        fixture.digest,
        fixture.evidencePath,
        fixture.evidenceDigest
      )
    );

    const result = evaluateImplementationValidation(
      fixture.root,
      discoverConstitutionalVolume(34, fixture.root)
    );

    expect(result.passed).toBe(true);
    expect(result.blockingConditions).toEqual([]);
  });

  it("rejects a missing required domain result", () => {
    const fixture = arrange();
    const value = artifact(
      fixture.digest,
      fixture.evidencePath,
      fixture.evidenceDigest
    );
    value.results.pop();
    writeArtifact(fixture.root, value);

    const result = evaluateImplementationValidation(
      fixture.root,
      discoverConstitutionalVolume(34, fixture.root)
    );

    expect(result.passed).toBe(false);
    expect(result.blockingConditions.some((blocker) =>
      blocker.includes("Performance and Observability")
    )).toBe(true);
  });

  it("rejects incomplete validation and false completion claims", () => {
    const fixture = arrange();
    const value = artifact(
      fixture.digest,
      fixture.evidencePath,
      fixture.evidenceDigest
    );
    value.results[0].status = "INCOMPLETE";
    writeArtifact(fixture.root, value);

    const result = evaluateImplementationValidation(
      fixture.root,
      discoverConstitutionalVolume(34, fixture.root)
    );

    expect(result.blockingConditions).toContain(
      "False completion claim: validationComplete is true while required results are not PASS."
    );
    expect(result.passed).toBe(false);
  });

  it("rejects a mismatched volume digest", () => {
    const fixture = arrange();
    writeArtifact(
      fixture.root,
      artifact(
        "stale-digest",
        fixture.evidencePath,
        fixture.evidenceDigest
      )
    );

    const result = evaluateImplementationValidation(
      fixture.root,
      discoverConstitutionalVolume(34, fixture.root)
    );

    expect(result.blockingConditions).toContain(
      "Implementation validation content digest does not match."
    );
  });

  it("rejects a PASS result with missing evidence", () => {
    const fixture = arrange();
    const value = artifact(
      fixture.digest,
      fixture.evidencePath,
      fixture.evidenceDigest
    );
    value.results[0].evidence = [];
    writeArtifact(fixture.root, value);

    const result = evaluateImplementationValidation(
      fixture.root,
      discoverConstitutionalVolume(34, fixture.root)
    );

    expect(result.blockingConditions).toContain(
      "Design System Adoption claims PASS without evidence."
    );
  });
});
