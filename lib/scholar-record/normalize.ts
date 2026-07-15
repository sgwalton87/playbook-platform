export function firstDefined<T>(
  ...values: Array<T | null | undefined>
): T | null {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

export function normalizedString(
  ...values: Array<unknown>
): string | null {
  const value = firstDefined(...values);

  if (value === null) return null;

  const normalized = String(value).trim();

  return normalized || null;
}

export function normalizedArray<T = string>(
  ...values: Array<unknown>
): T[] {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is T =>
          item !== null &&
          item !== undefined &&
          item !== ""
      );
    }

    if (typeof value === "string" && value.trim()) {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean) as T[];
        }
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean) as T[];
      }
    }
  }

  return [];
}

export function normalizedBoolean(
  ...values: Array<unknown>
): boolean {
  const value = firstDefined(...values);

  if (value === null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  return ["true", "1", "yes", "complete"].includes(
    String(value).trim().toLowerCase()
  );
}

export function normalizedObject(
  value: unknown
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}
