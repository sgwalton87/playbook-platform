const BASE_MAJOR_OPTIONS = [
  "Accounting",
  "Actuarial Science",
  "Aerospace Engineering",
  "African American Studies",
  "Agricultural Business",
  "Agricultural Science",
  "Anthropology",
  "Architecture",
  "Art",
  "Art History",
  "Artificial Intelligence",
  "Biochemistry",
  "Biology",
  "Biomedical Engineering",
  "Business Administration",
  "Chemical Engineering",
  "Chemistry",
  "Child Development",
  "Civil Engineering",
  "Communications",
  "Computer Engineering",
  "Computer Information Systems",
  "Computer Science",
  "Construction Management",
  "Criminal Justice",
  "Cybersecurity",
  "Data Science",
  "Early Childhood Education",
  "Economics",
  "Education",
  "Electrical Engineering",
  "English",
  "Environmental Engineering",
  "Environmental Science",
  "Exercise Science",
  "Fashion Design",
  "Film and Media Studies",
  "Finance",
  "Forensic Science",
  "Graphic Design",
  "Health Administration",
  "Health Sciences",
  "History",
  "Hospitality Management",
  "Human Development",
  "Human Resources",
  "Information Technology",
  "International Business",
  "International Relations",
  "Journalism",
  "Kinesiology",
  "Legal Studies",
  "Liberal Arts",
  "Marketing",
  "Mathematics",
  "Mechanical Engineering",
  "Music",
  "Neuroscience",
  "Nursing",
  "Nutrition and Dietetics",
  "Philosophy",
  "Physical Therapy",
  "Physics",
  "Political Science",
  "Pre-Dental",
  "Pre-Law",
  "Pre-Medicine",
  "Psychology",
  "Public Administration",
  "Public Health",
  "Public Policy",
  "Real Estate",
  "Social Work",
  "Sociology",
  "Software Engineering",
  "Sports Analytics",
  "Sports Management",
  "Statistics",
  "Supply Chain Management",
  "Theater Arts",
  "Urban Planning",
  "Veterinary Science",
  "Undecided",
  "Other",
] as const;

function normalizeMajor(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export const MAJOR_OPTIONS: string[] = Array.from(
  new Map(
    BASE_MAJOR_OPTIONS.map((major) => [
      major.toLowerCase(),
      normalizeMajor(major),
    ])
  ).values()
).sort((a, b) =>
  a.localeCompare(b, "en", {
    sensitivity: "base",
    numeric: true,
  })
);

export function getMajorOptions(
  customMajors: string[] = []
): string[] {
  return Array.from(
    new Map(
      [...MAJOR_OPTIONS, ...customMajors]
        .map(normalizeMajor)
        .filter(Boolean)
        .map((major) => [
          major.toLowerCase(),
          major,
        ])
    ).values()
  ).sort((a, b) =>
    a.localeCompare(b, "en", {
      sensitivity: "base",
      numeric: true,
    })
  );
}

export function searchMajors(
  query: string,
  customMajors: string[] = [],
  limit = 40
): string[] {
  const clean = query.trim().toLowerCase();
  const majors = getMajorOptions(customMajors);

  if (!clean) {
    return majors.slice(0, limit);
  }

  const exact: string[] = [];
  const startsWith: string[] = [];
  const contains: string[] = [];

  for (const major of majors) {
    const normalized = major.toLowerCase();

    if (normalized === clean) {
      exact.push(major);
    } else if (normalized.startsWith(clean)) {
      startsWith.push(major);
    } else if (normalized.includes(clean)) {
      contains.push(major);
    }
  }

  return [
    ...exact,
    ...startsWith,
    ...contains,
  ].slice(0, limit);
}
