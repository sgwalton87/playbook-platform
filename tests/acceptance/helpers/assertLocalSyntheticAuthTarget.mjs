const isolationError = "Synthetic auth writes require explicit approval and localhost application/database targets.";

/** Fail before constructing an administrative client or creating synthetic identities.
 * @param {Record<string, string | undefined>} environment
 */
export function assertLocalSyntheticAuthTarget(environment = process.env) {
  if (environment.PBOS_ALLOW_SYNTHETIC_AUTH_WRITE !== "YES") throw new Error(isolationError);
  for (const name of ["PLAYWRIGHT_BASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]) {
    let target;
    try { target = new URL(environment[name] || ""); }
    catch { throw new Error(isolationError); }
    if (!["http:", "https:"].includes(target.protocol) ||
        !["localhost", "127.0.0.1"].includes(target.hostname) ||
        target.username || target.password) throw new Error(isolationError);
  }
}
