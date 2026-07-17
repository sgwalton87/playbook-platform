import { NextRequest, NextResponse } from "next/server";

type CollegeResult = {
  id: string;
  name: string;
  source: "college-scorecard" | "ror";
  country?: string | null;
};

type ScorecardResult = {
  id?: number | string;
  "school.name"?: string;
  "school.alias"?: string;
};

type RorName = {
  value?: string;
  types?: string[];
};

type RorItem = {
  id?: string;
  names?: RorName[];
  types?: string[];
  locations?: Array<{
    geonames_details?: {
      country_name?: string;
      country_code?: string;
    };
  }>;
};

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function deduplicate(
  results: CollegeResult[]
): CollegeResult[] {
  const unique = new Map<string, CollegeResult>();

  for (const result of results) {
    const key = normalizeName(result.name);

    if (!key) continue;

    const existing = unique.get(key);

    /*
     * Prefer College Scorecard metadata for duplicate U.S.
     * schools, while retaining ROR for international coverage.
     */
    if (
      !existing ||
      (existing.source === "ror" &&
        result.source === "college-scorecard")
    ) {
      unique.set(key, result);
    }
  }

  return Array.from(unique.values());
}

function getRorDisplayName(item: RorItem) {
  const names = Array.isArray(item.names)
    ? item.names
    : [];

  const display = names.find((name) =>
    name.types?.includes("ror_display")
  );

  const label = names.find((name) =>
    name.types?.includes("label")
  );

  return (
    display?.value?.trim() ||
    label?.value?.trim() ||
    names[0]?.value?.trim() ||
    ""
  );
}

async function searchCollegeScorecard(
  query: string
): Promise<CollegeResult[]> {
  const apiKey =
    process.env.COLLEGE_SCORECARD_API_KEY;

  if (!apiKey) {
    console.warn(
      "COLLEGE_SCORECARD_API_KEY is not configured."
    );

    return [];
  }

  const url = new URL(
    "https://api.data.gov/ed/collegescorecard/v1/name-autocomplete"
  );

  url.searchParams.set("school_search", query);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60 * 60 * 24,
    },
  });

  if (!response.ok) {
    console.warn(
      `College Scorecard search failed: ${response.status}`
    );

    return [];
  }

  const payload = await response.json();

  if (!Array.isArray(payload?.results)) {
    return [];
  }

  return payload.results
    .map((school: ScorecardResult) => {
      const name =
        school["school.name"] ||
        school["school.alias"] ||
        "";

      return {
        id: `scorecard:${String(
          school.id || name
        )}`,
        name: name.trim(),
        source: "college-scorecard" as const,
        country: "United States",
      };
    })
    .filter(
      (college: CollegeResult) =>
        Boolean(college.name)
    );
}

async function searchRor(
  query: string
): Promise<CollegeResult[]> {
  const url = new URL(
    "https://api.ror.org/v2/organizations"
  );

  /*
   * ROR searches names, aliases, acronyms and identifiers.
   * Restrict results to educational organizations.
   */
  url.searchParams.set("query", query);
  url.searchParams.set("filter", "types:education");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60 * 60 * 24,
    },
  });

  if (!response.ok) {
    console.warn(
      `ROR college search failed: ${response.status}`
    );

    return [];
  }

  const payload = await response.json();

  if (!Array.isArray(payload?.items)) {
    return [];
  }

  return payload.items
    .map((item: RorItem) => {
      const name = getRorDisplayName(item);

      const country =
        item.locations?.[0]?.geonames_details
          ?.country_name || null;

      return {
        id: `ror:${String(item.id || name)}`,
        name,
        source: "ror" as const,
        country,
      };
    })
    .filter(
      (college: CollegeResult) =>
        Boolean(college.name)
    );
}

export async function GET(
  request: NextRequest
) {
  const query =
    request.nextUrl.searchParams
      .get("q")
      ?.trim() || "";

  if (query.length < 2) {
    return NextResponse.json({
      results: [],
    });
  }

  try {
    const [scorecardResult, rorResult] =
      await Promise.allSettled([
        searchCollegeScorecard(query),
        searchRor(query),
      ]);

    const scorecard =
      scorecardResult.status === "fulfilled"
        ? scorecardResult.value
        : [];

    const global =
      rorResult.status === "fulfilled"
        ? rorResult.value
        : [];

    const results = deduplicate([
      ...scorecard,
      ...global,
    ]).slice(0, 40);

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error(
      "Combined college search failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "College search is temporarily unavailable.",
        results: [],
      },
      {
        status: 502,
      }
    );
  }
}
