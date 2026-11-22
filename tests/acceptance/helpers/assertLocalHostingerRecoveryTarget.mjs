import { assertLocalSyntheticAuthTarget } from "./assertLocalSyntheticAuthTarget.mjs";

/** @param {Record<string, string | undefined>} environment */
export function assertLocalHostingerRecoveryTarget(environment) {
  assertLocalSyntheticAuthTarget(environment);
  if (
    environment.PBOS_ENABLE_HOSTINGER_RECOVERY !== "YES" ||
    !["127.0.0.1", "localhost"].includes(environment.SMTP_HOST ?? "") ||
    environment.SMTP_PORT !== "54325" ||
    environment.SMTP_SECURE !== "false" ||
    !/^[a-f0-9]{40}$/.test(environment.PBOS_ACCEPTANCE_COMMIT ?? "")
  ) {
    throw new Error("Hostinger recovery requires explicit opt-in, an exact revision, and the local mail capture endpoint.");
  }
}
