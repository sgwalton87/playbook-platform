import { expect, test } from "@playwright/test";

/**
 * Additional real HTTP authority checks for sensitive workflows.
 * No identity creation, no privileged credentials, and no canonical writes.
 * These probes must run only against an isolated loopback app and database.
 */
const protectedOperations = [
  { label: "mentor validation finalize", method: "POST", endpoint: "/api/mentor-validation/finalize", data: { validationRequestId: "11111111-1111-4111-8111-111111111111" } },
  { label: "read private brand verification", method: "GET", endpoint: "/api/brand-verification" },
  { label: "save private brand registration", method: "PATCH", endpoint: "/api/brand-verification", data: { registration: {} } },
  { label: "submit brand verification", method: "POST", endpoint: "/api/brand-verification", data: {} },
  { label: "open reviewer-only document", method: "GET", endpoint: "/api/admin/verification/brand-evidence/file?documentId=11111111-1111-4111-8111-111111111111" },
  { label: "archive reviewer-only document", method: "POST", endpoint: "/api/admin/verification/brand-evidence/archive", data: { documentId: "11111111-1111-4111-8111-111111111111", reason: "Unauthorized attempt" } },
] as const;

function assertIsolatedTargets() {
  for (const key of ["PLAYWRIGHT_BASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]) {
    const raw = process.env[key];
    if (!raw) throw new Error(`Missing isolated acceptance target: ${key}`);
    const url = new URL(raw);
    if (url.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(url.hostname) ||
      url.username || url.password) {
      throw new Error(`Refusing non-loopback or credential-bearing acceptance target: ${key}`);
    }
  }
}

for (const operation of protectedOperations) {
  test(`anonymous ${operation.label} is denied before authorization-sensitive work`, async ({ request }) => {
    assertIsolatedTargets();
    const response = await request.fetch(operation.endpoint, {
      method: operation.method,
      ...( "data" in operation ? { data: operation.data } : {} ),
      failOnStatusCode: false,
      maxRedirects: 0,
    });
    expect(response.status(), `${operation.label} must not reach the privileged handler`).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");
    const payload = await response.json() as { error?: string; ok?: boolean; archived?: boolean };
    expect(payload.error).toMatch(/sign in|authentication required/i);
    expect(payload.ok).not.toBe(true);
    expect(payload.archived).not.toBe(true);
  });
}
