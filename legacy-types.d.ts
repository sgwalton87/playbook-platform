/**
 * Transitional structural value for legacy PBOS recovery surfaces that still
 * receive loosely shaped external records. Prefer route- or domain-specific
 * interfaces when changing product behavior.
 */
type LegacyValue = string &
  number &
  boolean &
  Record<string, LegacyValue> &
  LegacyValue[] &
  ((...args: LegacyValue[]) => LegacyValue);
