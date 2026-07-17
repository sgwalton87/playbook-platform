export const ASSESSMENT_SCORE_FIELDS = [
  {
    key: "ela_score",
    label: "Latest ELA assessment score",
    optional: true,
  },
  {
    key: "math_score",
    label: "Latest Math assessment score",
    optional: true,
  },
] as const;

export function normalizeAssessmentScore(
  value: unknown
): string | null {
  if (value === null || value === undefined) return null;

  const clean = String(value).trim();

  return clean || null;
}
