export const PLAYBOOK_PILLARS = [
  "Academic Success",
  "Arts & Creativity",
  "Athletics",
  "Business",
  "College Access",
  "Community Service",
  "Education",
  "Engineering",
  "Entrepreneurship",
  "Environmental Justice",
  "Faith & Purpose",
  "Financial Literacy",
  "Health & Wellness",
  "Leadership",
  "Law & Justice",
  "Medicine & Healthcare",
  "Mental Health",
  "Music",
  "Personal Development",
  "Public Speaking",
  "Social Justice",
  "STEM",
  "Technology",
] as const;

export type PlaybookPillar =
  (typeof PLAYBOOK_PILLARS)[number];

export const MAX_SCHOLAR_PILLARS = 5;

const LEGACY_PILLAR_ALIASES: Record<
  string,
  string
> = {
  academic: "Academic Success",
  academics: "Academic Success",
  financial: "Financial Literacy",
  finance: "Financial Literacy",
  athletic: "Athletics",
  sports: "Athletics",
  business: "Business",
  college: "College Access",
  community: "Community Service",
  service: "Community Service",
  education: "Education",
  engineering: "Engineering",
  entrepreneurship: "Entrepreneurship",
  environment: "Environmental Justice",
  faith: "Faith & Purpose",
  health: "Health & Wellness",
  leadership: "Leadership",
  law: "Law & Justice",
  medicine: "Medicine & Healthcare",
  mental_health: "Mental Health",
  music: "Music",
  personal: "Personal Development",
  public_speaking: "Public Speaking",
  justice: "Social Justice",
  stem: "STEM",
  technology: "Technology",
};

function normalizePillarValue(
  value: unknown
): string {
  const clean = String(
    value || ""
  ).trim();

  if (!clean) {
    return "";
  }

  const aliasKey = clean
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return (
    LEGACY_PILLAR_ALIASES[
      aliasKey
    ] || clean
  );
}

export function normalizePillars(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowed = new Set<string>(
    PLAYBOOK_PILLARS
  );

  return Array.from(
    new Set(
      value
        .map(normalizePillarValue)
        .filter((pillar) =>
          allowed.has(pillar)
        )
    )
  ).slice(0, MAX_SCHOLAR_PILLARS);
}
