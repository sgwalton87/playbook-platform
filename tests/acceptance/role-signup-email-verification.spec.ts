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
        // Local Supabase uses Inbucket. Query the mailbox by its recipient local part.
        const mailbox = email.split("@")[0];
        const response = await fetch(new URL(`/api/v1/mailbox/${encodeURIComponent(mailbox)}`, mailBase));
        if (!response.ok) return false;
        const messages = await response.json() as Array<{ id: string }>;
        if (!messages.length) return false;
        const detail = await fetch(new URL(`/api/v1/mailbox/${encodeURIComponent(mailbox)}/${messages[0].id}`, mailBase));
        if (!detail.ok) return false;
        const message = await detail.json() as { body?: { html?: string; text?: string }; text?: string; html?: string };
        const body = [message.body?.html, message.body?.text, message.text, message.html].filter(Boolean).join(" ");
        const urls = body.match(/https?:[^\s"'<>]+/g) || [];
        const candidate = urls.map(raw => raw.replace(/&amp;/g, "&").replace(/[),.]+$/, ""))
          .find(raw => raw.includes("/auth/v1/verify") || raw.includes("/auth/callback"));
        if (candidate) confirmationUrl = candidate;
        return Boolean(confirmationUrl);
      }, { timeout: 20000, intervals: [250, 500, 1000] }).toBe(true);
      if (!confirmationUrl) throw Error(`Confirmation email did not include verification URL for ${role}`);
      await page.goto(confirmationUrl);
      await page.waitForURL(url => url.pathname.startsWith("/start"), { timeout: 20000 });
      expect(page.url()).toContain(`role=${encodeURIComponent(role)}`);
      const user = await admin.auth.admin.getUserById(signup.data.user.id);
      expect(user.error).toBeNull();
      expect(user.data.user?.email_confirmed_at).toBeTruthy();
      const profile = await admin.from("profiles").select("role,profile_mode").eq("id", signup.data.user.id).single();
      expect(profile.error).toBeNull();
      expect(profile.data).toMatchObject({ role, profile_mode: role });
      await page.context().clearCookies();
      await page.goto("/login");
      await page.evaluate(() => localStorage.clear());
      console.log(`[role-confirmation] Verified ${role}`);
    }
  } finally {
    for (const id of ids) {
      const result = await admin.auth.admin.deleteUser(id);
      if (result.error) throw Error("Isolated signup test account cleanup failed");
    }
  }
});
