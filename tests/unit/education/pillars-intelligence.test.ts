import {
  describe,
  expect,
  it,
} from "vitest";

import {
  MAX_SCHOLAR_PILLARS,
  PLAYBOOK_PILLARS,
  normalizePillars,
} from "@/lib/education";

describe("Pillars Intelligence", () => {
  it("provides unique pillar options", () => {
    expect(
      new Set(PLAYBOOK_PILLARS).size
    ).toBe(PLAYBOOK_PILLARS.length);

    expect(
      PLAYBOOK_PILLARS.length
    ).toBeGreaterThan(15);
  });

  it("preserves priority order", () => {
    expect(
      normalizePillars([
        "Financial Literacy",
        "Entrepreneurship",
        "Leadership",
      ])
    ).toEqual([
      "Financial Literacy",
      "Entrepreneurship",
      "Leadership",
    ]);
  });

  it("removes duplicates and invalid values", () => {
    expect(
      normalizePillars([
        "Leadership",
        "Unknown Pillar",
        "Leadership",
        "Technology",
      ])
    ).toEqual([
      "Leadership",
      "Technology",
    ]);
  });

  it("limits students to five pillars", () => {
    const selected =
      PLAYBOOK_PILLARS.slice(0, 8);

    expect(
      normalizePillars(selected)
    ).toHaveLength(
      MAX_SCHOLAR_PILLARS
    );
  });
});
