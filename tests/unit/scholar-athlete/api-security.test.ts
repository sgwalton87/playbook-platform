import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import {
  requireIdempotencyKey,
  requireSameOrigin,
} from "@/lib/scholar-athlete/api";

describe("Athlete mutation security", () => {
  it("accepts same-origin commands with bounded idempotency keys", () => {
    const request = new NextRequest("https://playbook.test/api/athlete/nil", {
      headers: {
        origin: "https://playbook.test",
        "idempotency-key": "018f47f0-55d2-7d9d-b4f8-123456789abc",
      },
    });
    expect(requireSameOrigin(request)).toEqual({ ok: true });
    expect(requireIdempotencyKey(request)).toEqual({
      ok: true,
      value: "018f47f0-55d2-7d9d-b4f8-123456789abc",
    });
  });

  it("rejects cross-origin commands and missing replay protection", () => {
    const request = new NextRequest("https://playbook.test/api/athlete/nil", {
      headers: { origin: "https://attacker.example" },
    });
    expect(requireSameOrigin(request).ok).toBe(false);
    expect(requireIdempotencyKey(request).ok).toBe(false);
  });
});
