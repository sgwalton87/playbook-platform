import { describe, expect, it } from "vitest";
import {
  isPkceVerifierCookie,
  PKCE_CALLBACK_ERROR_MESSAGE,
  PLAYBOOK_PKCE_AUTH_OPTIONS,
} from "@/lib/auth/pkce";

describe("PKCE authentication contract", () => {
  it("uses one explicit authorization-code exchange", () => {
    expect(PLAYBOOK_PKCE_AUTH_OPTIONS).toMatchObject({
      flowType: "pkce",
      detectSessionInUrl: false,
      persistSession: true,
    });
  });

  it("recognizes only Supabase verifier cookies", () => {
    expect(isPkceVerifierCookie("sb-project-auth-token-code-verifier")).toBe(true);
    expect(isPkceVerifierCookie("sb-project-auth-token")).toBe(false);
  });

  it("uses a non-enumerating callback failure message", () => {
    expect(PKCE_CALLBACK_ERROR_MESSAGE).not.toMatch(/verifier|supabase|user|account exists/i);
  });
});
