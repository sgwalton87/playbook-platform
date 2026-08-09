import { describe, expect, it } from "vitest";
import {
  createRememberMeCookieMethods,
  getRememberMePreference,
  setRememberMePreference,
} from "@/lib/auth/rememberMe";

function storage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("Remember Me session persistence", () => {
  it("defaults to a browser-session cookie and removes legacy saved identity", () => {
    const preferences = storage({ playbook_saved_email: "scholar@example.com" });
    const writes: string[] = [];
    const cookies = createRememberMeCookieMethods(() => "", (value) => writes.push(value), preferences);

    setRememberMePreference(false, preferences);
    cookies.setAll?.([{
      name: "sb-auth-token",
      value: "token",
      options: { path: "/", maxAge: 31_536_000, sameSite: "lax", secure: true },
    }], {});

    expect(getRememberMePreference(preferences)).toBe(false);
    expect(preferences.getItem("playbook_saved_email")).toBeNull();
    expect(writes[0]).not.toMatch(/Max-Age|Expires/);
  });

  it("retains the provider expiry only when Remember Me is selected", () => {
    const preferences = storage();
    const writes: string[] = [];
    const cookies = createRememberMeCookieMethods(() => "", (value) => writes.push(value), preferences);

    setRememberMePreference(true, preferences);
    cookies.setAll?.([{
      name: "sb-auth-token",
      value: "token",
      options: { path: "/", maxAge: 31_536_000, sameSite: "lax", secure: true },
    }], {});

    expect(getRememberMePreference(preferences)).toBe(true);
    expect(writes[0]).toContain("Max-Age=31536000");
  });

  it("keeps the one-time PKCE verifier scoped to the current browser session", () => {
    const preferences = storage({ playbook_remember_session: "true" });
    const writes: string[] = [];
    const cookies = createRememberMeCookieMethods(() => "", (value) => writes.push(value), preferences);

    cookies.setAll?.([{
      name: "sb-project-auth-token-code-verifier",
      value: "one-time-secret",
      options: {
        path: "/",
        maxAge: 31_536_000,
        expires: new Date("2030-01-01T00:00:00.000Z"),
        sameSite: "lax",
        secure: true,
      },
    }], {});

    expect(writes[0]).not.toMatch(/Max-Age|Expires/);
    expect(writes[0]).toContain("SameSite=Lax");
    expect(writes[0]).toContain("Secure");
  });

  it("always preserves Supabase token-deletion cookies", () => {
    const writes: string[] = [];
    const cookies = createRememberMeCookieMethods(
      () => "sb-auth-token=token",
      (value) => writes.push(value),
      storage()
    );

    cookies.setAll?.([{
      name: "sb-auth-token",
      value: "",
      options: { path: "/", maxAge: 0, sameSite: "lax" },
    }], {});

    expect(writes[0]).toContain("Max-Age=0");
  });

  it("reads all browser cookies for Supabase SSR token chunking", async () => {
    const cookies = createRememberMeCookieMethods(
      () => "sb-auth-token.0=first; sb-auth-token.1=second",
      () => undefined,
      storage()
    );

    expect(await cookies.getAll?.()).toEqual([
      { name: "sb-auth-token.0", value: "first" },
      { name: "sb-auth-token.1", value: "second" },
    ]);
  });
});
