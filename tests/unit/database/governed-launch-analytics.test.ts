import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("supabase/migrations/202608010004_governed_launch_analytics.sql", "utf8");
describe("governed launch analytics migration", () => {
  it("requires consent and enables RLS", () => { expect(migration).toContain("analytics_consent_required"); expect(migration).toContain("alter table public.launch_analytics_events enable row level security"); });
  it("defines retention and expiry lookup", () => { expect(migration).toContain("interval '13 months'"); expect(migration).toContain("launch_analytics_events_expiry_idx"); });
  it("prevents direct anonymous execution", () => expect(migration).toContain("revoke all on function public.record_launch_analytics_event(text,jsonb) from public,anon"));
});
