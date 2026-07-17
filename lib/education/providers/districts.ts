import { CALIFORNIA_PUBLIC_SCHOOLS } from "./californiaSchools.generated";

function normalizeDistrictName(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

export const CALIFORNIA_DISTRICTS: string[] =
  Array.from(
    new Set(
      CALIFORNIA_PUBLIC_SCHOOLS
        .map((school) =>
          normalizeDistrictName(
            String(school.district || "")
          )
        )
        .filter(Boolean)
    )
  ).sort((a, b) =>
    a.localeCompare(b, "en", {
      sensitivity: "base",
      numeric: true,
    })
  );

export function getDistrictOptions(
  customDistricts: string[] = []
): string[] {
  return Array.from(
    new Map(
      [
        ...CALIFORNIA_DISTRICTS,
        ...customDistricts,
      ]
        .map(normalizeDistrictName)
        .filter(Boolean)
        .map((district) => [
          district.toLowerCase(),
          district,
        ])
    ).values()
  ).sort((a, b) =>
    a.localeCompare(b, "en", {
      sensitivity: "base",
      numeric: true,
    })
  );
}

export function searchDistricts(
  query: string,
  customDistricts: string[] = [],
  limit = 40
): string[] {
  const clean = query.trim().toLowerCase();
  const districts =
    getDistrictOptions(customDistricts);

  if (!clean) {
    return districts.slice(0, limit);
  }

  const startsWith: string[] = [];
  const contains: string[] = [];

  for (const district of districts) {
    const normalized = district.toLowerCase();

    if (normalized.startsWith(clean)) {
      startsWith.push(district);
    } else if (normalized.includes(clean)) {
      contains.push(district);
    }
  }

  return [...startsWith, ...contains].slice(
    0,
    limit
  );
}
