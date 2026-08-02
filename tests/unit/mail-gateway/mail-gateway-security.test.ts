import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const route = readFileSync("app/api/mail-gateway/hostinger/route.ts", "utf8");
const migration = readFileSync("supabase/migrations/202608010006_inbound_mail_and_transcript_hardening.sql", "utf8");
describe("inbound mail security", () => {
  it("fails closed when its secret is absent", () => { expect(route).toContain("Mail gateway is not configured"); expect(route).toContain("status: 503"); });
  it("uses an atomic replay-safe persistence function", () => { expect(route).toContain('rpc("ingest_support_mail"'); expect(migration).toContain("provider_message_id text not null unique"); expect(migration).toContain("Provider message already processed"); });
  it("exposes persistence only to service role", () => { expect(migration).toContain("from public,anon,authenticated"); expect(migration).toContain("to service_role"); });
});
