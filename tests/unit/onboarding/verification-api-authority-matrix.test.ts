import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const contracts = [
  { file: "app/api/coach-verification/route.ts", role: "coach", pending: 'status: "pending"' },
  { file: "app/api/educator-verification/route.ts", role: "educator", pending: 'status: "pending"' },
  { file: "app/api/counselor-verification/route.ts", role: "high-school-counselor", pending: 'status: "pending"' },
  { file: "app/api/district-verification/route.ts", role: "district", pending: 'status: "pending"' },
  { file: "app/api/recruiting-verification/route.ts", role: "college-coach", pending: 'status: "pending"' },
  { file: "app/api/admissions-verification/route.ts", role: "college-admissions", pending: 'status: "pending"' },
  { file: "app/api/employer-verification/route.ts", role: "employer", pending: 'status: "pending"' },
  { file: "app/api/brand-verification/route.ts", role: "brand-partner", pending: 'status: "pending"' },
  { file: "app/api/community-partner-verification/route.ts", role: "other", pending: 'status: "pending"' },
  { file: "app/api/athlete-abroad-readiness/route.ts", role: "athlete-abroad", pending: 'review_status: "pending"' },
] as const;

describe("verification API authority matrix", () => {
  it.each(contracts)("keeps $file exact-role and onboarding gated", ({ file, role, pending }) => {
    const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");

    expect(source).toContain('requireUser()');
    expect(source).toContain('requirePlaybookRole(');
    expect(source).toContain(`!== "${role}"`);
    expect(source).toContain("onboarding_completed");
    expect(source).toMatch(/if \(!profile\.data\.onboarding_completed\)/);
    expect(source).toContain(pending);
    expect(source).toContain("reviewed_at: null");
    expect(source).toContain("review_notes: null");
  });

  it("does not grant authority merely because evidence was submitted", () => {
    for (const { file } of contracts) {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      expect(source).toContain("activationState");
      expect(source).not.toContain('activationState: "active"');
      expect(source).not.toContain('status: "approved"');
    }
  });
});
