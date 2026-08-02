import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { readBoundedJson, requireIdempotencyKey, requireSameOrigin } from "@/lib/api-security/server";

function request(body: string, headers: Record<string, string> = {}) {
  return new NextRequest("https://playbook.test/api/command", {
    method: "POST",
    body,
    headers: { "content-type": "application/json", origin: "https://playbook.test", ...headers },
  });
}

describe("shared API request boundary", () => {
  it("accepts same-origin bounded JSON and rejects cross-origin commands", async () => {
    expect(requireSameOrigin(request("{}"))).toEqual({ ok: true });
    expect(requireSameOrigin(request("{}", { origin: "https://attacker.test" })).ok).toBe(false);
    await expect(readBoundedJson(request('{"ok":true}'), 100)).resolves.toEqual({
      ok: true,
      value: { ok: true },
    });
  });

  it("rejects oversized, malformed, and incorrectly typed bodies", async () => {
    expect((await readBoundedJson(request(`{"value":"${"x".repeat(100)}"}`), 20)).ok).toBe(false);
    expect((await readBoundedJson(request("{"), 20)).ok).toBe(false);
    expect((await readBoundedJson(request("{}", { "content-type": "text/plain" }), 20)).ok).toBe(false);
  });

  it("requires bounded replay-safe command keys", () => {
    expect(requireIdempotencyKey(request("{}", { "idempotency-key": "command.123456789" }))).toEqual({
      ok: true,
      value: "command.123456789",
    });
    expect(requireIdempotencyKey(request("{}", { "idempotency-key": "short" })).ok).toBe(false);
  });
});
