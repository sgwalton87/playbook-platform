import { findCourseOntology } from "./CourseOntology";

export interface CourseGraphNode {
  name: string;
  subject: string;
  agCategory?: string;
  graduationArea: string;
  skills: string[];
  majors: string[];
  careers: string[];
  opportunities: string[];
  prerequisites: string[];
  unlocks: string[];
}

const PREREQUISITES: Record<string, string[]> = {
  "English 10": ["English 9"],
  "Algebra II": ["Algebra I", "Geometry"],
  "Chemistry": ["Biology"],
  "Physics": ["Algebra II"],
};

const UNLOCKS: Record<string, string[]> = {
  "English 9": ["English 10"],
  "Algebra II": ["Precalculus", "Statistics", "Physics"],
  "Biology": ["Chemistry", "AP Biology", "Health Science Pathways"],
};

export function buildCourseGraphNode(courseName: string): CourseGraphNode {
  const ontology = findCourseOntology(courseName);

  if (!ontology) {
    return {
      name: courseName,
      subject: "unknown",
      graduationArea: "Unclassified",
      skills: [],
      majors: [],
      careers: [],
      opportunities: [],
      prerequisites: PREREQUISITES[courseName] || [],
      unlocks: UNLOCKS[courseName] || [],
    };
  }

  return {
    name: ontology.canonicalName,
    subject: ontology.subject,
    agCategory: ontology.agCategory,
    graduationArea: ontology.graduationArea,
    skills: ontology.skills,
    majors: ontology.majors,
    careers: ontology.careers,
    opportunities: ontology.opportunities,
    prerequisites: PREREQUISITES[ontology.canonicalName] || [],
    unlocks: UNLOCKS[ontology.canonicalName] || [],
  };
}
