export type CollegeSearchOption = {
  id: string;
  name: string;
  source?: "college-scorecard" | "ror";
  country?: string | null;
};

const cache = new Map<
  string,
  CollegeSearchOption[]
>();

export async function searchColleges(
  query: string
): Promise<CollegeSearchOption[]> {
  const clean = query.trim();
  const cacheKey = clean.toLowerCase();

  if (clean.length < 2) {
    return [];
  }

  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `/api/colleges/search?q=${encodeURIComponent(
      clean
    )}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        `College search failed with status ${response.status}.`
    );
  }

  const results: CollegeSearchOption[] =
    Array.isArray(payload?.results)
      ? payload.results
          .map((college: any) => ({
            id: String(college.id || ""),
            name: String(
              college.name || ""
            ).trim(),
            source: college.source,
            country: college.country || null,
          }))
          .filter(
            (college: CollegeSearchOption) =>
              Boolean(college.name)
          )
      : [];

  cache.set(cacheKey, results);

  return results;
}

export function clearCollegeSearchCache() {
  cache.clear();
}
