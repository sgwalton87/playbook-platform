import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const route = (name: string) => readFileSync(`app/api/${name}/route.ts`, "utf8");

describe("high-risk API route hardening", () => {
  it("authenticates, bounds, quotas, and constrains AI guidance", () => {
    const source = route("ai/zai");
    for (const contract of ["requireAuthenticatedMutation", "ai_processing_consents", "readBoundedJson", "consumeApiQuota", "beginAIGuidanceRun", "finishAIGuidanceRun", "timeoutMs", "humanReviewRequired"]) {
      expect(source).toContain(contract);
    }
    expect(source).not.toContain("body.model");
    expect(source).not.toContain("getErrorMessage");
  });

  it("derives admin identity server-side and records idempotent delivery", () => {
    const source = route("notify-admin");
    for (const contract of ["requireAuthenticatedMutation", "requireIdempotencyKey", "beginDelivery", "finishDelivery", "PLAYBOOK_ADMIN_NOTIFICATION_EMAIL"]) {
      expect(source).toContain(contract);
    }
    expect(source).not.toContain("body.userEmail");
    expect(source).not.toContain("onboarding@resend.dev");
  });

  it("replaces the guardian success stub with active-relationship delivery", () => {
    const source = route("notify-guardian");
    for (const contract of ["support_relationships", "scholar_id", "status", "requireIdempotencyKey", "beginDelivery", "finishDelivery"]) {
      expect(source).toContain(contract);
    }
    expect(source).not.toContain("await req.json();");
  });
});
