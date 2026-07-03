export function generateDemoLearner(input: {
  name?: string;
  gradeLevel?: number;
  pathway?: string;
  trustScore?: number;
} = {}) {
  const pathway = input.pathway || "Health Science + Community Leadership";

  return {
    name: input.name || "Maya Johnson",
    gradeLevel: input.gradeLevel || 10,
    pathway,
    trustScore: input.trustScore || 78,
    courses: [
      { name: "Biology", subject: "science", credits: 10, grade: "A", completed: true },
      { name: "Algebra II", subject: "math", credits: 10, grade: "B", completed: true },
      { name: "English 9", subject: "english", credits: 10, grade: "A", completed: true },
    ],
    achievements: [
      "Biology Lab Reflection",
      "Community Health Volunteer Day",
      "Financial Literacy Badge",
    ],
  };
}
