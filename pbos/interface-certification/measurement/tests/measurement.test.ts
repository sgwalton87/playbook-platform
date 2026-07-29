import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Artifacts, Runtime } from "../../../kernel";
import {
  evaluateInterfaceMeasurement,
  measureInterfaceImplementation,
  type InterfaceMeasurementArtifact,
} from "..";

const roots: string[] = [];

function write(root: string, relativePath: string, content: string): void {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function arrange(): string {
  const root = mkdtempSync(
    path.join(tmpdir(), "pbos-interface-measurement-")
  );
  roots.push(root);
  const volume =
    "docs/CONSTITUTION/VOLUME_34_INTERFACE_SYSTEM_ARCHITECTURE";
  write(
    root,
    `${volume}/README.md`,
    `---
id: VOLUME-34
title: Interface System Architecture
status: implementation_ready
---

# Purpose

Governed interface architecture.
`
  );
  write(
    root,
    `${volume}/PPS-3400_INTERFACE_SYSTEM_CONSTITUTIONAL_FRAMEWORK.md`,
    `---
id: PPS-3400
title: Interface System Constitutional Framework
status: implementation_ready
---

# Authority

Interface authority.
`
  );
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("PBOS interface measurement", () => {
  it("fails closed when implementation signals are absent", () => {
    const run = evaluateInterfaceMeasurement(
      34,
      arrange(),
      "2026-07-29T05:00:00.000Z"
    );

    expect(run.filesScanned).toBe(0);
    expect(run.measurementComplete).toBe(false);
    expect(run.certificationEligible).toBe(false);
    expect(
      Object.values(run.domains).every(
        ({ status }) => status === "incomplete"
      )
    ).toBe(true);
  });

  it("records observations without converting them to compliance", () => {
    const root = arrange();
    write(
      root,
      "components/registry.tsx",
      `import Link from "next/link";
export function Status() {
  return <main aria-label="Status"><button onKeyDown={() => undefined}>Retry</button><Link href="/">Home</Link></main>;
}
`
    );
    write(
      root,
      "styles/tokens.css",
      `:root { --space: 1rem; }
@media (min-width: 40rem) { main { display: grid; } }
`
    );

    const run = evaluateInterfaceMeasurement(
      34,
      root,
      "2026-07-29T05:00:00.000Z"
    );

    expect(run.filesScanned).toBe(2);
    expect(run.measurementComplete).toBe(true);
    expect(run.certificationEligible).toBe(false);
    expect(run.domains["IC-004"].observedSignals).toBeGreaterThan(0);
    expect(run.findings).toContain(
      "IC-004: Observed repository signals do not independently prove constitutional compliance."
    );
  });

  it("preserves immutable measurement history", () => {
    const root = arrange();
    write(root, "components/button.tsx", "export const Button = 1;\n");

    const first = measureInterfaceImplementation(
      34,
      root,
      "2026-07-29T05:00:00.000Z"
    );
    const second = measureInterfaceImplementation(
      34,
      root,
      "2026-07-29T05:01:00.000Z"
    );
    const artifact = Runtime.load<InterfaceMeasurementArtifact>(
      path.join(root, Artifacts.interfaceMeasurement)
    );

    expect(artifact.history).toHaveLength(2);
    expect(artifact.history[0].runId).toBe(first.runId);
    expect(artifact.runId).toBe(second.runId);
  });
});
