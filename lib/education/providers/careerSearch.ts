export type CareerSearchOption = {
  id: string;
  title: string;
};

const cache = new Map<
  string,
  CareerSearchOption[]
>();

export async function searchCareers(
  query: string
): Promise<CareerSearchOption[]> {
  const clean = query.trim();
  const cacheKey =
    clean.toLowerCase();

  if (clean.length < 2) {
    return [];
  }

  const cached =
    cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `/api/careers/search?q=${encodeURIComponent(
      clean
    )}`,
    {
      headers: {
        Accept:
          "application/json",
      },
    }
  );

  const payload =
    await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        `Career search failed with status ${response.status}.`
    );
  }

  const results: CareerSearchOption[] =
    Array.isArray(payload?.results)
      ? payload.results
          .map((career: any) => ({
            id: String(
              career.id || ""
            ),
            title: String(
              career.title || ""
            ).trim(),
          }))
          .filter(
            (
              career: CareerSearchOption
            ) =>
              Boolean(
                career.title
              )
          )
      : [];

  cache.set(
    cacheKey,
    results
  );

  return results;
}

export function clearCareerSearchCache() {
  cache.clear();
}
