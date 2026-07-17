export function createGraduationYears(
  currentYear = new Date().getFullYear()
): string[] {
  return Array.from(
    { length: 12 },
    (_, index) => String(currentYear + index)
  );
}

export const GRADUATION_YEARS = createGraduationYears();

export const GRADE_OPTIONS = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "College",
  "Transition-age youth",
  "Other",
] as const;
