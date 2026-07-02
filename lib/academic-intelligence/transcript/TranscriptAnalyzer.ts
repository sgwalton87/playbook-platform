import type { AcademicCourse } from "../types";
import { buildCourseGraphNode } from "./CourseGraph";

export function analyzeTranscriptKnowledgeGraph(courses: AcademicCourse[]) {
  const completed = courses.filter(course => course.completed);
  const graphNodes = completed.map(course => buildCourseGraphNode(course.name));

  const skills = Array.from(new Set(graphNodes.flatMap(node => node.skills)));
  const majors = Array.from(new Set(graphNodes.flatMap(node => node.majors)));
  const careers = Array.from(new Set(graphNodes.flatMap(node => node.careers)));
  const opportunities = Array.from(new Set(graphNodes.flatMap(node => node.opportunities)));
  const unlocks = Array.from(new Set(graphNodes.flatMap(node => node.unlocks)));

  const agCategories = Array.from(
    new Set(graphNodes.map(node => node.agCategory).filter(Boolean))
  );

  return {
    completedCourses: completed.length,
    graphNodes,
    skills,
    majors,
    careers,
    opportunities,
    unlocks,
    agCategories,
    transcriptSignals: [
      skills.length > 0 && `${skills.length} academic skill signals detected.`,
      majors.length > 0 && `${majors.length} possible major pathways detected.`,
      careers.length > 0 && `${careers.length} possible career pathways detected.`,
      opportunities.length > 0 && `${opportunities.length} opportunity signals detected.`,
    ].filter(Boolean) as string[],
  };
}
