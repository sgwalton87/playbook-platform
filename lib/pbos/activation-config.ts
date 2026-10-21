import type { SupportedScholarRecordRole } from "@/lib/pbos/scholar-onboarding-service";

const RUNTIME_KEYS = [
  "PBOS_API_URL",
  "PBOS_ORGANIZATION_ID",
  "PBOS_CONNECTOR_ID",
  "PBOS_CONNECTOR_KEY_ID",
  "PBOS_CONNECTOR_SECRET_BASE64",
] as const;

const APPROVAL_KEYS: Record<SupportedScholarRecordRole, readonly string[]> = {
  SCHOLAR: [
    "PBOS_SCHOLAR_IDENTITY_APPROVAL_ID",
    "PBOS_SCHOLAR_EXCHANGE_APPROVAL_ID",
  ],
  SCHOLAR_ATHLETE: [
    "PBOS_SCHOLAR_ATHLETE_IDENTITY_APPROVAL_ID",
    "PBOS_SCHOLAR_ATHLETE_EXCHANGE_APPROVAL_ID",
  ],
  TRANSITION_YOUTH: [
    "PBOS_TRANSITION_YOUTH_IDENTITY_APPROVAL_ID",
    "PBOS_TRANSITION_YOUTH_EXCHANGE_APPROVAL_ID",
  ],
};

export function getMissingPbosActivationConfiguration(
  role: SupportedScholarRecordRole,
  environment: Readonly<Record<string, string | undefined>> = process.env
): string[] {
  return [...RUNTIME_KEYS, ...APPROVAL_KEYS[role]].filter(
    key => !environment[key]?.trim()
  );
}
