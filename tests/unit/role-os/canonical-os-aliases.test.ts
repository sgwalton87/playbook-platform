import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getRoleDestination } from "@/lib/roles/registry";

const universityAlias = fs.readFileSync(
  path.join(process.cwd(), "app/university-os/page.tsx"),
  "utf8"
);

describe("canonical role OS aliases", () => {
  it("keeps College Admissions on one canonical OS destination", () => {
    expect(getRoleDestination("college-admissions")).toBe("/admissions-os");
    expect(universityAlias).toContain('redirect("/admissions-os")');
    expect(universityAlias).not.toContain("RoleDashboardExperience");
  });
});
