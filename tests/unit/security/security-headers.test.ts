import { describe, expect, it } from "vitest";
import { APPLICATION_SECURITY_HEADERS } from "@/lib/security/headers";

describe("application security headers", () => {
  it("sets the required browser isolation and transport controls", () => {
    const headers = new Map(
      APPLICATION_SECURITY_HEADERS.map(({ key, value }) => [key, value]),
    );

    expect(headers.get("Strict-Transport-Security")).toContain(
      "includeSubDomains",
    );
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
  });

  it("uses a restrictive content security policy with explicit integrations", () => {
    const csp = APPLICATION_SECURITY_HEADERS.find(
      ({ key }) => key === "Content-Security-Policy",
    )?.value;

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("https://*.supabase.co");
    expect(csp).toContain("https://*.hcaptcha.com");
    expect(csp).not.toContain("default-src *");
  });
});
