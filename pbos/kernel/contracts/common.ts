export interface ContractValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export type ContractValidator<T> = (value: T) => ContractValidationResult;

export function contractResult(errors: readonly string[]): ContractValidationResult {
  return { valid: errors.length === 0, errors };
}

export function requireIdentifier(
  errors: string[],
  field: string,
  value: string
): void {
  if (!value.trim()) errors.push(`${field} is required.`);
}

export function requireIdentifiers(
  errors: string[],
  field: string,
  values: readonly string[]
): void {
  const normalized = values.map((value) => value.trim());
  if (normalized.some((value) => !value)) {
    errors.push(`${field} contains an empty identifier.`);
  }
  if (new Set(normalized).size !== normalized.length) {
    errors.push(`${field} contains duplicate identifiers.`);
  }
}

export function requireTimestamp(
  errors: string[],
  field: string,
  value: string
): void {
  if (!value.trim() || Number.isNaN(Date.parse(value))) {
    errors.push(`${field} must be a valid timestamp.`);
  }
}

export function requireChronology(
  errors: string[],
  startField: string,
  start: string,
  endField: string,
  end: string | null
): void {
  if (end !== null && Date.parse(end) <= Date.parse(start)) {
    errors.push(`${endField} must be later than ${startField}.`);
  }
}

export function requireDigest(
  errors: string[],
  field: string,
  value: string
): void {
  if (!/^[a-f0-9]{64}$/u.test(value)) {
    errors.push(`${field} must be a SHA-256 digest.`);
  }
}

export function mergeContractResults(
  ...results: readonly ContractValidationResult[]
): ContractValidationResult {
  return contractResult(results.flatMap(({ errors }) => errors));
}
