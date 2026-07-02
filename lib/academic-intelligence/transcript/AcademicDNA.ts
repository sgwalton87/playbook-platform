import type { AcademicCourse } from "../types";
import { analyzeTranscriptKnowledgeGraph } from "./TranscriptAnalyzer";

export interface AcademicDNA {
  strengths: string[];
  interests: string[];
  pathways: string[];
  careerSignals: string[];
  opportunitySignals: string[];
  confidence: number;
}

export function buildAcademicDNA(courses: AcademicCourse[]): AcademicDNA {
  const graph = analyzeTranscriptKnowledgeGraph(courses);

  const confidence = Math.min(
    100,
    Math.round(
      (graph.skills.length * 8) +
      (graph.majors.length * 6) +
      (graph.careers.length * 5) +
      (graph.opportunities.length * 4)
    )
  );

  return {
    strengths: graph.skills.slice(0, 8),
    interests: graph.majors.slice(0, 8),
    pathways: graph.unlocks.slice(0, 8),
    careerSignals: graph.careers.slice(0, 8),
    opportunitySignals: graph.opportunities.slice(0, 8),
    confidence,
  };
}
