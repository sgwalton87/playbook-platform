/**
 * =============================================================================
 * PBOS Runtime Registry Tests
 * =============================================================================
 */

import { describe, expect, it } from "vitest";

import { RuntimeRegistry } from "./runtime-registry";

describe("RuntimeRegistry", () => {
  it("registers and resolves runtimes", () => {
    const registry = new RuntimeRegistry();

    const runtime = {} as never;

    registry.register(
      "default",
      runtime,
    );

    expect(
      registry.resolve("default"),
    ).toBe(runtime);

    expect(
      registry.has("default"),
    ).toBe(true);

    expect(
      registry.list(),
    ).toHaveLength(1);
  });
});
