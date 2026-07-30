import type { TemporalIdentity } from "./types";

export function validateTemporalIdentity(value: TemporalIdentity): readonly string[] {
  const dates = [
    ["effective_at", value.effective_at],
    ["observed_at", value.observed_at],
    ["recorded_at", value.recorded_at],
  ] as const;
  const errors = dates
    .filter(([, timestamp]) => !Number.isFinite(Date.parse(timestamp)))
    .map(([name]) => `${name} is invalid.`);
  if (
    errors.length === 0 &&
    Date.parse(value.observed_at) < Date.parse(value.effective_at)
  ) {
    errors.push("Observation precedes effective time.");
  }
  if (
    errors.length === 0 &&
    Date.parse(value.recorded_at) < Date.parse(value.observed_at)
  ) {
    errors.push("Recording precedes observation.");
  }
  return errors;
}
