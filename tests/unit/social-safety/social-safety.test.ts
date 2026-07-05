import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("Social Safety + Trust Sprint", () => {
  it("has trust schema migration", () => {
    expect(
      fs.existsSync(
        "supabase/migrations/20260705_social_safety_trust.sql"
      )
    ).toBe(true);
  });

  it("has report block and mute APIs", () => {
    expect(
      fs.existsSync("app/api/trust/report/route.ts")
    ).toBe(true);

    expect(
      fs.existsSync("app/api/trust/block/route.ts")
    ).toBe(true);

    expect(
      fs.existsSync("app/api/trust/mute/route.ts")
    ).toBe(true);
  });

  it("has moderation queue", () => {
    expect(
      fs.existsSync("app/admin/moderation/page.tsx")
    ).toBe(true);

    expect(
      fs.existsSync("app/api/admin/moderation/route.ts")
    ).toBe(true);
  });

  it("has reusable safety controls", () => {
    expect(
      fs.existsSync(
        "components/trust/ContentSafetyMenu.tsx"
      )
    ).toBe(true);
  });

  it("social reaction route does not trust client userId", () => {
    const route = fs.readFileSync(
      "app/api/social/reactions/route.ts",
      "utf8"
    );

    expect(route).toContain("requireUser");
    expect(route).not.toContain("scholar_id: body.userId");
  });

  it("RSVP route uses reward guard", () => {
    const route = fs.readFileSync(
      "app/api/community-events/rsvp/route.ts",
      "utf8"
    );

    expect(route).toContain("hasExistingReward");
  });
});
