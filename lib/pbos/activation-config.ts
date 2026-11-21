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

// This service was verified in the isolated PBOS staging project. It is not a
// valid destination for Playbook production identities or private data.
const STAGING_RUNTIME_HOST = "pbos-v1-integration-staging-loii7tzprq-uw.a.run.app";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function getPbosActivationDestinationIssue(
  environment: Readonly<Record<string, string | undefined>> = process.env
): "INVALID_ENDPOINT" | "NON_PRODUCTION_DESTINATION" | undefined {
  let endpoint: URL;
  try {
    endpoint = new URL(environment.PBOS_API_URL ?? "");
  } catch {
    return "INVALID_ENDPOINT";
  }

  const hostname = endpoint.hostname.replace(/\.$/, "");
  const loopback = LOOPBACK_HOSTS.has(hostname);
  if (endpoint.pathname !== "/pbos/v1" || endpoint.username || endpoint.password ||
      endpoint.search || endpoint.hash ||
      (endpoint.protocol !== "https:" && !(loopback && endpoint.protocol === "http:"))) {
    return "INVALID_ENDPOINT";
  }
  if (environment.VERCEL_ENV === "production" &&
      (loopback || hostname === STAGING_RUNTIME_HOST ||
        environment.PBOS_ENVIRONMENT?.trim().toLowerCase() === "staging")) {
    return "NON_PRODUCTION_DESTINATION";
  }
}
