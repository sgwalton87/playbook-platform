import { describe, expect, it } from "vitest";
import {
  buildCourseGraphNode,
  analyzeTranscriptKnowledgeGraph,
  buildAcademicDNA,
} from "@/lib/academic-intelligence";

describe("Transcript Intelligence Knowledge Graph", () => {
  it("maps a course into ontology relationships", () => {
    const node = buildCourseGraphNode("Algebra II");

    expect(node.subject).toBe("math");
    expect(node.agCategory).toBe("C");
    expect(node.skills).toContain("quantitative reasoning");
    expect(node.careers).toContain("Engineer");
  });

  it("analyzes transcript relationships", () => {
    const report = analyzeTranscriptKnowledgeGraph([
      { name: "English 9", subject: "english", credits: 10, completed: true },
      { name: "Algebra II", subject: "math", credits: 10, completed: true },
      { name: "Biology", subject: "science", credits: 10, completed: true },
    ]);

    expect(report.skills.length).toBeGreaterThan(0);
    expect(report.majors.length).toBeGreaterThan(0);
    expect(report.opportunities.length).toBeGreaterThan(0);
  });

  it("builds Academic DNA from coursework", () => {
    const dna = buildAcademicDNA([
      { name: "English 9", subject: "english", credits: 10, completed: true },
      { name: "Biology", subject: "science", credits: 10, completed: true },
    ]);

    expect(dna.strengths.length).toBeGreaterThan(0);
    expect(dna.confidence).toBeGreaterThan(0);
  });
});
