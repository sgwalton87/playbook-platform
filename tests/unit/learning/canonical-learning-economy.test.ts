import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("canonical learning and economy convergence", () => {
  it("loads Courses from durable learning APIs instead of hard-coded catalog constants", () => {
    const library = read("app/courses/page.tsx");
    const detail = read("app/courses/[slug]/page.tsx");
    expect(library).toContain('/api/learning/courses');
    expect(library).not.toContain("const FLAGSHIP");
    expect(detail).toContain('/api/learning/courses/');
    expect(detail).not.toContain("const COURSES");
    expect(detail).not.toContain("addReward(");
  });

  it("records completion through the governed learning RPC", () => {
    const route = read("app/api/learning/courses/[slug]/route.ts");
    const migration = read("supabase/migrations/202608160035_canonical_learning_authority.sql");
    expect(route).toContain('rpc("complete_learning_module"');
    expect(migration).toContain("private.record_learning_reward");
    expect(migration).toContain("module.completed");
    expect(migration).toContain("course.completed");
    expect(migration).toContain("learning_credentials");
    expect(migration).toContain("achievement_badges");
  });

  it("replaces editable profile badge arrays with governed achievement evidence", () => {
    const badges = read("app/badges/page.tsx");
    expect(badges).toContain('.from("achievement_badges")');
    expect(badges).not.toContain('.select("badges")');
  });

  it("projects canonical learning credentials into the transcript", () => {
    const transcript = read("app/transcript/page.tsx");
    expect(transcript).toContain('.from("learning_credentials")');
    expect(transcript).not.toContain('.from("certificates")');
  });

  it("keeps the Store on the existing canonical atomic redemption authority", () => {
    const api = read("app/api/rewards/store/route.ts");
    const schema = read("supabase/migrations/202608160033_canonical_learning_schema.sql");
    expect(api).toContain('.from("store_products")');
    expect(api).toContain('.from("store_redemptions")');
    expect(api).toContain('rpc("redeem_store_product"');
    expect(schema).not.toContain("reward_store_items");
    expect(schema).not.toContain("reward_store_redemptions");
  });
});
