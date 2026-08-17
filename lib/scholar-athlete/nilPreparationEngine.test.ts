import { describe, expect, it } from "vitest";
import {
  evaluateNILPreparation,
  summarizeNILPreparation,
  type NILPreparationFacts,
  type NILPreparationReview,
} from "./nilPreparationEngine";

const emptyFacts: NILPreparationFacts = {
  profile: {
    hasAvatar: false,
    hasCover: false,
    hasBio: false,
    linkedSocialCount: 0,
    brandInterestCount: 0,
  },
  athlete: {
    hasHighlightFilm: false,
  },
  media: {
    albumMediaCount: 0,
  },
  learning: {
    moneyInTheGameRequiredModules: 4,
    moneyInTheGameCompletedModules: 0,
    moneyInTheGameCredential: false,
    nilReadinessCourseStatus: "coming_soon",
  },
  deals: {
    total: 0,
    withContractRecord: 0,
    disclosureStarted: 0,
  },
};

const preparedFacts: NILPreparationFacts = {
  profile: {
    hasAvatar: true,
    hasCover: true,
    hasBio: true,
    linkedSocialCount: 3,
    brandInterestCount: 2,
  },
  athlete: {
    hasHighlightFilm: true,
  },
  media: {
    albumMediaCount: 5,
  },
  learning: {
    moneyInTheGameRequiredModules: 4,
    moneyInTheGameCompletedModules: 4,
    moneyInTheGameCredential: true,
    nilReadinessCourseStatus: "coming_soon",
  },
  deals: {
    total: 2,
    withContractRecord: 1,
    disclosureStarted: 1,
  },
};

describe("NIL preparation intelligence", () => {
  it("returns all seven preparation domains without manufacturing record signals", () => {
    const findings = evaluateNILPreparation(emptyFacts, []);

    expect(findings).toHaveLength(7);
    expect(findings.every((finding) => finding.signal === "no_record_signal")).toBe(true);
    expect(summarizeNILPreparation(findings)).toEqual({
      dimensions: 7,
      reviewed: 0,
      actionNeeded: 0,
      recordBacked: 0,
    });
  });

  it("keeps Scholar review separate from record-backed evidence", () => {
    const reviews: NILPreparationReview[] = [
      {
        dimension: "financial_literacy",
        reviewStatus: "reviewed",
        reflection: "I reviewed this area.",
      },
    ];

    const findings = evaluateNILPreparation(emptyFacts, reviews);
    const financial = findings.find((finding) => finding.dimension === "financial_literacy");

    expect(financial?.reviewStatus).toBe("reviewed");
    expect(financial?.signal).toBe("no_record_signal");
    expect(summarizeNILPreparation(findings).reviewed).toBe(1);
    expect(summarizeNILPreparation(findings).recordBacked).toBe(0);
  });

  it("uses canonical learning progress as a preparation signal without turning coursework into individualized advice", () => {
    const findings = evaluateNILPreparation(preparedFacts, []);
    const financial = findings.find((finding) => finding.dimension === "financial_literacy");

    expect(financial?.signal).toBe("record_backed");
    expect(financial?.authorityBoundary).toContain("not individualized tax");
    expect(financial?.evidence).toContain("Money in the Game credential earned");
  });

  it("never infers social professionalism from linked social accounts", () => {
    const findings = evaluateNILPreparation(preparedFacts, []);
    const social = findings.find((finding) => finding.dimension === "social_professionalism");

    expect(social?.signal).toBe("partial_record");
    expect(social?.authorityBoundary).toContain("does not infer professionalism");
  });

  it("treats contract and disclosure records as preparation activity, not clearance", () => {
    const findings = evaluateNILPreparation(preparedFacts, []);
    const contract = findings.find((finding) => finding.dimension === "contract_awareness");
    const compliance = findings.find((finding) => finding.dimension === "compliance_awareness");

    expect(contract?.signal).toBe("record_backed");
    expect(contract?.authorityBoundary).toContain("does not approve a contract");
    expect(compliance?.signal).toBe("record_backed");
    expect(compliance?.authorityBoundary).toContain("never compliance clearance");
  });

  it("does not treat a coming-soon NIL course as completed learning evidence", () => {
    const facts: NILPreparationFacts = {
      ...emptyFacts,
      learning: {
        ...emptyFacts.learning,
        moneyInTheGameRequiredModules: 0,
        moneyInTheGameCompletedModules: 0,
        nilReadinessCourseStatus: "coming_soon",
      },
    };

    const financial = evaluateNILPreparation(facts, [])
      .find((finding) => finding.dimension === "financial_literacy");

    expect(financial?.signal).toBe("no_record_signal");
  });
});
