export const GPA_MIN = 0;
export const GPA_MAX = 5;
export const GPA_INCREMENT = 0.05;

const numericGpas = Array.from(
  {
    length:
      Math.round((GPA_MAX - GPA_MIN) / GPA_INCREMENT) + 1,
  },
  (_, index) =>
    (GPA_MAX - index * GPA_INCREMENT).toFixed(2)
);

export const GPA_OPTIONS = [
  ...numericGpas,
  "Other / Not sure",
] as const;

export function isRecognizedGpa(value: unknown): boolean {
  if (value === "Other / Not sure") return true;

  const parsed = Number(value);

  return (
    Number.isFinite(parsed) &&
    parsed >= GPA_MIN &&
    parsed <= GPA_MAX
  );
}
