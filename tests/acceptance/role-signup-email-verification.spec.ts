import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { PLAYBOOK_ROLES, type PlaybookRole } from "@/lib/roles/registry";
import { buildSignupMetadata } from "@/lib/auth/signup";

const roles = Object.keys(PLAYBOOK_ROLES) as PlaybookRole[];

test("all 15 pathways: sign up, receive local confirmation email, verify, and enter correct onboarding", async ({ page }) => {
  test.setTimeout(8 * 60 * 1000);
  const need = (key: string) => { const value = process.env[key]; if (!value) throw Error(`Missing ${key}`); return value; };
  const appUrl = new URL(need("PLAYWRIGHT_BASE_URL"));
  const supabaseUrl = new URL(need("NEXT_PUBLIC_SUPABASE_URL"));
  if (need("PBOS_ALLOW_SYNTHETIC_AUTH_WRITE") !== "YES" ||
    !["127.0.0.1", "localhost"].includes(appUrl.hostname) ||
    !["127.0.0.1", "localhost"].includes(supabaseUrl.hostname)) {
    throw Error("Only disposable local signup environments are supported");
  }
  const admin = createClient(supabaseUrl.toString(), need("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anon = createClient(supabaseUrl.toString(), need("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const mailBase = new URL("http://127.0.0.1:54324");
  const ids: string[] = [];
  try {
    for (const role of roles) {
      console.log(`[role-confirmation] Beginning ${role}`);
      const email = `pbos-verify-${role}-${randomUUID()}@example.com`;
      const password = `${randomBytes(24).toString("base64url")}Aa1!`;
      const signup = await anon.auth.signUp({
        email, password,
        options: {
          data: buildSignupMetadata(role),
          emailRedirectTo: new URL("/auth/callback", appUrl).toString(),
        },
      });
      if (signup.error || !signup.data.user) throw signup.error ?? Error(`Signup failed for ${role}`);
      ids.push(signup.data.user.id);
      expect(signup.data.user.email_confirmed_at).toBeFalsy();
      let confirmationUrl: string | null = null;
      await expect.poll(async () => {
        // Supabase CLI now serves Mailpit; its API differs from legacy Inbucket.
        const listing = await fetch(new URL("/api/v1/messages", mailBase));
        if (!listing.ok) return false;
        const inbox = await listing.json() as {
          messages?: Array<{ ID?: string; id?: string; To?: Array<{ Address?: string }> }>;
        };
        const entry = (inbox.messages || []).find(item =>
          item.To?.some(recipient => recipient.Address?.toLowerCase() === email.toLowerCase())
        );
        if (!entry) return false;
        const id = entry.ID || entry.id;
        if (!id) return false;
        const detail = await fetch(new URL(`/api/v1/message/${encodeURIComponent(id)}`, mailBase));
        if (!detail.ok) return false;
        const message = await detail.json() as { HTML?: string; Text?: string };
        const body = [message.Text, message.HTML].filter(Boolean).join(" ");
        const urls = body.match(/https?:[^\s"'<>]+/g) || [];
        const candidate = urls.map(raw => raw.replace(/&amp;/g, "&").replace(/[),.]+$/, ""))
          .find(raw => raw.includes("/auth/v1/verify") || raw.includes("/auth/callback"));
        if (candidate) {
          // Reject truncated, HTML-corrupted, or cross-project verification links before navigation.
          let parsed: URL;
          try { parsed = new URL(candidate); } catch { return false; }
          if (parsed.origin !== supabaseUrl.origin ||
              parsed.pathname !== "/auth/v1/verify" ||
              parsed.searchParams.get("type") !== "signup" ||
              !parsed.searchParams.get("token")) return false;
          confirmationUrl = parsed.toString();
        }
        return Boolean(confirmationUrl);
      }, { timeout: 20000, intervals: [250, 500, 1000] }).toBe(true);
      if (!confirmationUrl) throw Error(`Confirmation email did not include verification URL for ${role}`);
      await page.goto(confirmationUrl, { waitUntil: "domcontentloaded" });
      try {
        await page.waitForURL(url => url.pathname.startsWith("/start"), {
          waitUntil: "domcontentloaded", timeout: 20000
        });
      } catch {
        const current = new URL(page.url());
        // Do not log callback tokens, email addresses, cookies or sensitive URL query data.
        const status = await admin.auth.admin.getUserById(signup.data.user.id);
        const persisted = await admin.from("profiles")
          .select("role,profile_mode,onboarding_completed")
          .eq("id", signup.data.user.id).maybeSingle();
        const visibleText = (await page.locator("main").first().innerText().catch(() => "")).slice(0, 240);
        throw new Error(`Verification redirect for ${role} did not reach /start: route=${current.pathname}; verified=${Boolean(status.data.user?.email_confirmed_at)}; profile=${persisted.error ? "lookup_error" : persisted.data ? "present" : "missing"}; visible=${visibleText}`);
      }
      expect(page.url()).toContain(`role=${encodeURIComponent(role)}`);
      const user = await admin.auth.admin.getUserById(signup.data.user.id);
      expect(user.error).toBeNull();
      expect(user.data.user?.email_confirmed_at).toBeTruthy();
      const profile = await admin.from("profiles").select("role,profile_mode").eq("id", signup.data.user.id).single();
      expect(profile.error).toBeNull();
      expect(profile.data).toMatchObject({ role, profile_mode: role });
      // Leave the role's active page before clearing session cookies.
      // Clearing cookies mid-navigation can race an auth redirect and abort /login.
      await page.evaluate(() => localStorage.clear());
      await page.goto("about:blank", { waitUntil: "domcontentloaded" });
      await page.context().clearCookies();
      console.log(`[role-confirmation] Verified ${role}`);
    }
  } finally {
    for (const id of ids) {
      const result = await admin.auth.admin.deleteUser(id);
      if (result.error) throw Error("Isolated signup test account cleanup failed");
    }
  }
});
