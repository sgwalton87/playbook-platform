import { describe, expect, it } from "vitest";
import fs from "node:fs";
import {
  getDesignSchemaRoutes,
  getLegacyDesignRoutes,
  summarizeDesignSchema,
} from "@/lib/design-schema";

describe("Design Schema Audit", () => {
  it("classifies major pages", () => {
    expect(getDesignSchemaRoutes().length).toBeGreaterThan(8);
  });

  it("tracks legacy pages", () => {
    expect(getLegacyDesignRoutes()).toEqual([]);
  });

  it("classifies redesigned course detail as current schema", () => {
    const courseDetail = getDesignSchemaRoutes().find(
      (route) => route.route === "/courses/[slug]"
    );

    expect(courseDetail?.status).toBe("Current Schema");
  });

  it("summarizes schema statuses", () => {
    expect(summarizeDesignSchema()["Current Schema"]).toBeGreaterThan(0);
  });

  it("has studio audit page", () => {
    expect(fs.existsSync("app/studio/design-schema-audit/page.tsx")).toBe(true);
  });

  it("has audit script", () => {
    expect(fs.existsSync("scripts/audits/design-schema-audit.ts")).toBe(true);
  });
});
