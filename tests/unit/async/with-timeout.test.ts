import { describe, expect, it } from "vitest";
import { RequestTimeoutError, withTimeout } from "@/lib/async/withTimeout";

describe("withTimeout", () => {
  it("returns a completed request", async () => {
    await expect(withTimeout(Promise.resolve("ready"), 50)).resolves.toBe("ready");
  });

  it("rejects a stalled request with a recoverable error", async () => {
    const stalled = new Promise<never>(() => undefined);
    await expect(withTimeout(stalled, 5)).rejects.toBeInstanceOf(RequestTimeoutError);
  });
});
