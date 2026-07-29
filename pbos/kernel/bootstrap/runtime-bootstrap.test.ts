/**
 * =============================================================================
 * PBOS Runtime Bootstrap Tests
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *
 * =============================================================================
 */

import { describe, expect, it } from "vitest";

import { bootstrapRuntime } from "./runtime-bootstrap";

describe("bootstrapRuntime", () => {
  it("creates a Kernel runtime", () => {
    const runtime = bootstrapRuntime(
      {} as never,
      {} as never,
    );

    expect(runtime).toBeDefined();
  });
});
