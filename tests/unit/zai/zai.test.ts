import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("Z.ai integration", () => {
  it("has server-side Z.ai client", () => {
    expect(fs.existsSync("lib/zai/zaiClient.ts")).toBe(true);
  });

  it("has Z.ai API route", () => {
    expect(fs.existsSync("app/api/ai/zai/route.ts")).toBe(true);
  });

  it("does not expose key as NEXT_PUBLIC", () => {
    const client = fs.readFileSync("lib/zai/zaiClient.ts", "utf8");
    expect(client).toContain("process.env.ZAI_API_KEY");
    expect(client).not.toContain("NEXT_PUBLIC_ZAI");
  });
});
