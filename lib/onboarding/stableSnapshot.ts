/** Deterministic serialization of profile snapshots.
 * JSONB object-key ordering is not a meaningful edit. Array order is meaningful.
 * Used only for equality, never as an authorization check.
 */
export function stableProfileSnapshot(value: unknown): string {
  const ordered = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(ordered);
    if (input && typeof input === "object") {
      return Object.fromEntries(Object.entries(input as Record<string, unknown>)
        .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        .map(([key, child]) => [key, ordered(child)]));
    }
    return input;
  };
  return JSON.stringify(ordered(value ?? {}));
}
