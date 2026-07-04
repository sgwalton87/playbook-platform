import { describe, expect, it } from "vitest";
import { getStephishaFounderCaseStudy } from "@/lib/demo/case-studies";
import FounderCaseStudyDemo from "@/components/demo/FounderCaseStudyDemo";

describe("Founder Case Study Demo", () => {
  it("loads founder case study", () => {
    const study = getStephishaFounderCaseStudy();
    expect(study.scholar.name).toContain("Stephisha");
    expect(study.scholar.outcomes).toContain("70+ scholarship offers");
  });

  it("connects case study to Playbook mission", () => {
    expect(getStephishaFounderCaseStudy().mission).toContain("no student misses an opportunity");
  });

  it("component is defined", () => {
    expect(FounderCaseStudyDemo).toBeTruthy();
  });
});
