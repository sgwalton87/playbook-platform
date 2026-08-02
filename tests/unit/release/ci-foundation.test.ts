import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const qualityWorkflow = readFileSync(
  ".github/workflows/quality.yml",
  "utf8",
);
const supplyChainWorkflow = readFileSync(
  ".github/workflows/supply-chain.yml",
  "utf8",
);

describe("public beta CI foundation", () => {
  it("enforces application, browser, and migration release gates", () => {
    expect(qualityWorkflow).toContain("npm ci --include=dev");
    expect(qualityWorkflow).toContain("npm run env:check");
    expect(qualityWorkflow).toContain("npm run db:validate:rls");
    expect(qualityWorkflow).toContain("npm run lint");
    expect(qualityWorkflow).toContain("npm run build");
    expect(qualityWorkflow).toContain("playwright test");
    expect(qualityWorkflow).toContain("supabase db reset --local");
    expect(qualityWorkflow).toContain("actions/upload-artifact@v4");
  });

  it("fails on high-severity production dependency findings", () => {
    expect(supplyChainWorkflow).toContain(
      "npm audit --omit=dev --audit-level=high",
    );
    expect(supplyChainWorkflow).toContain("npm audit signatures");
  });
});
