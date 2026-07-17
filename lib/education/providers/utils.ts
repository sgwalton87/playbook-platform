import type { EducationOption } from "../types";

export function optionId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toEducationOption(label: string): EducationOption {
  const clean = label.trim();

  return {
    id: optionId(clean),
    label: clean,
    value: clean,
  };
}

export function uniqueAlphabetical(values: string[]): string[] {
  return Array.from(
    new Map(
      values
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => [value.toLowerCase(), value])
    ).values()
  ).sort((a, b) => a.localeCompare(b));
}
