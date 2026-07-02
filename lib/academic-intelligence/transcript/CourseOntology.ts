export type CourseDifficulty = "standard" | "cp" | "honors" | "ap" | "ib" | "dual_enrollment";

export interface CourseOntologyEntry {
  canonicalName: string;
  aliases: string[];
  subject: string;
  agCategory?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  graduationArea: string;
  ncaaEligible: boolean;
  collegePrep: boolean;
  difficulty: CourseDifficulty;
  skills: string[];
  majors: string[];
  careers: string[];
  opportunities: string[];
}

export const COURSE_ONTOLOGY: CourseOntologyEntry[] = [
  {
    canonicalName: "English 9",
    aliases: ["english 9", "freshman english", "english i"],
    subject: "english",
    agCategory: "B",
    graduationArea: "English",
    ncaaEligible: true,
    collegePrep: true,
    difficulty: "cp",
    skills: ["writing", "reading", "communication", "critical thinking"],
    majors: ["English", "Education", "Journalism", "Law"],
    careers: ["Teacher", "Attorney", "Writer", "Journalist"],
    opportunities: ["writing scholarships", "debate", "student journalism"],
  },
  {
    canonicalName: "Algebra II",
    aliases: ["algebra 2", "algebra ii", "advanced algebra"],
    subject: "math",
    agCategory: "C",
    graduationArea: "Mathematics",
    ncaaEligible: true,
    collegePrep: true,
    difficulty: "cp",
    skills: ["quantitative reasoning", "problem solving", "logic"],
    majors: ["Engineering", "Computer Science", "Business", "Finance"],
    careers: ["Engineer", "Data Analyst", "Financial Advisor", "Software Developer"],
    opportunities: ["stem scholarships", "math competitions", "engineering programs"],
  },
  {
    canonicalName: "Biology",
    aliases: ["biology", "life science", "bio"],
    subject: "science",
    agCategory: "D",
    graduationArea: "Science",
    ncaaEligible: true,
    collegePrep: true,
    difficulty: "cp",
    skills: ["scientific thinking", "research", "observation", "analysis"],
    majors: ["Biology", "Public Health", "Medicine", "Kinesiology"],
    careers: ["Doctor", "Researcher", "Physical Therapist", "Public Health Worker"],
    opportunities: ["healthcare internships", "science fairs", "stem scholarships"],
  },
];

export function findCourseOntology(courseName: string) {
  const normalized = courseName.toLowerCase().trim();

  return COURSE_ONTOLOGY.find(entry =>
    entry.canonicalName.toLowerCase() === normalized ||
    entry.aliases.includes(normalized)
  );
}
