import { expect, test } from "@playwright/test";
import { PLAYBOOK_ROLES, type PlaybookRole } from "@/lib/roles/registry";

/**
 * Unauthenticated functional API acceptance, not source-string inspection.
 * Does not create accounts, solve CAPTCHA, write canonical data, or mint authority.
 * Strictly requires loopback application and Supabase before sending requests.
 */
const roles = Object.keys(PLAYBOOK_ROLES) as PlaybookRole[];
for (const role of roles) {
  test(`anonymous ${role} onboarding completion is rejected at HTTP boundary`, async ({ request }) => {
    const appUrl = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "");
    const dbUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    for (const url of [appUrl, dbUrl]) {
      if (url.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(url.hostname)) {
        throw new Error("Extended role acceptance must target isolated loopback services only");
      }
    }
    const endpoint = role === "other" ? "community-partner" : role;
    const response = await request.post(`/api/pbos/onboarding/${endpoint}`, {
      data: { displayName: "Unauthorized fixture", goalTitle: "Must not persist" },
      failOnStatusCode: false,
    });
    expect(response.status(), `${role} must fail before mutation`).toBe(401);
    const body = await response.json() as { error?: string; ok?: boolean };
    expect(body.ok).not.toBe(true);
    expect(body.error).toBe("Authentication required.");
  });
}
