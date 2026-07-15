import type { SchoolOption } from "../types";
import { optionId } from "./utils";
import { CALIFORNIA_PUBLIC_SCHOOLS } from "./californiaSchools.generated";

const BASE_SCHOOLS: SchoolOption[] =
  CALIFORNIA_PUBLIC_SCHOOLS;

let customSchools: SchoolOption[] = [];

export function getSchoolOptions(): SchoolOption[] {
  const combined = [...BASE_SCHOOLS, ...customSchools];

  return Array.from(
    new Map(
      combined.map((school) => [
        [
          school.label.toLowerCase(),
          String(school.district || "").toLowerCase(),
          String(school.city || "").toLowerCase(),
        ].join("::"),
        school,
      ])
    ).values()
  ).sort((a, b) => {
    const byName = a.label.localeCompare(b.label);

    if (byName !== 0) return byName;

    return String(a.city || "").localeCompare(
      String(b.city || "")
    );
  });
}

export function searchSchools(
  query: string,
  limit = 50
): SchoolOption[] {
  const clean = query.trim().toLowerCase();
  const options = getSchoolOptions();

  if (!clean) return options.slice(0, limit);

  const startsWithMatches = [];
  const containsMatches = [];

  for (const school of options) {
    const searchable = [
      school.label,
      school.district,
      school.city,
      school.county,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    if (
      searchable.some((value) => value.startsWith(clean))
    ) {
      startsWithMatches.push(school);
      continue;
    }

    if (
      searchable.some((value) => value.includes(clean))
    ) {
      containsMatches.push(school);
    }
  }

  return [
    ...startsWithMatches,
    ...containsMatches,
  ].slice(0, limit);
}

export function addCustomSchool(input: {
  label: string;
  district?: string | null;
  city?: string | null;
  county?: string | null;
  state?: string | null;
}): SchoolOption {
  const label = input.label.trim();

  if (!label) {
    throw new Error("School name is required.");
  }

  const existing = getSchoolOptions().find(
    (school) =>
      school.label.toLowerCase() ===
        label.toLowerCase() &&
      String(school.district || "").toLowerCase() ===
        String(input.district || "").toLowerCase() &&
      String(school.city || "").toLowerCase() ===
        String(input.city || "").toLowerCase()
  );

  if (existing) return existing;

  const school: SchoolOption = {
    id: optionId(
      `${label}-${input.district || input.city || "custom"}`
    ),
    label,
    value: label,
    district: input.district || null,
    city: input.city || null,
    county: input.county || null,
    state: input.state || "California",
    source: "playbook-custom",
  };

  customSchools = [...customSchools, school];

  return school;
}

export function resetCustomSchoolsForTesting() {
  customSchools = [];
}
