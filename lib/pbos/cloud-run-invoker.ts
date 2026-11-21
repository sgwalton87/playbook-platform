import { getVercelOidcToken } from "@vercel/oidc";

type Environment = Readonly<Record<string, string | undefined>>;

export function verifyProductionPbosInvocationTarget(endpoint: string, environment: Environment = process.env) {
  const { audience } = getCloudRunInvocationConfig(environment);
  const target = new URL(endpoint);
  if (target.origin !== audience || target.pathname !== "/pbos/v1" || target.username ||
      target.password || target.search || target.hash) {
    throw new Error("Production PBOS endpoint does not match the approved Cloud Run audience.");
  }
}

export function getCloudRunInvocationConfig(environment: Environment) {
  const provider = environment.PBOS_GCP_WIF_PROVIDER ?? "";
  const serviceAccount = environment.PBOS_GCP_INVOKER_SERVICE_ACCOUNT ?? "";
  const audience = environment.PBOS_CLOUD_RUN_AUDIENCE ?? "";
  if (!/^\/\/iam\.googleapis\.com\/projects\/[0-9]+\/locations\/global\/workloadIdentityPools\/pbos-playbook-production\/providers\/vercel$/.test(provider) ||
      !/^pbos-playbook-invoker@[a-z][a-z0-9-]{4,28}[a-z0-9]\.iam\.gserviceaccount\.com$/.test(serviceAccount) ||
      serviceAccount.includes("staging") ||
      !/^https:\/\/[a-z0-9-]+\.run\.app$/.test(audience) || audience.includes("staging")) {
    throw new Error("Production PBOS Google invocation configuration is invalid.");
  }
  return { provider, serviceAccount, audience };
}

export async function getProductionPbosIdToken(
  environment: Environment = process.env,
  transport: typeof fetch = fetch,
  subjectToken: () => Promise<string> = getVercelOidcToken
): Promise<string> {
  const { provider, serviceAccount, audience } = getCloudRunInvocationConfig(environment);
  const assertion = await subjectToken();
  if (!assertion || /\s/.test(assertion)) throw new Error("Production Playbook OIDC identity is unavailable.");
  const sts = await transport("https://sts.googleapis.com/v1/token", {
    method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(8_000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      audience: provider,
      requested_token_type: "urn:ietf:params:oauth:token-type:access_token",
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      scope: "https://www.googleapis.com/auth/cloud-platform",
      subject_token: assertion,
    }),
  });
  const federated = sts.ok ? await sts.json() as { access_token?: unknown } : null;
  if (typeof federated?.access_token !== "string" || !federated.access_token || /\s/.test(federated.access_token)) {
    throw new Error("Google denied Playbook workload federation.");
  }
  const minted = await transport(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccount}:generateIdToken`, {
      method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(8_000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${federated.access_token}` },
      body: JSON.stringify({ audience, includeEmail: true }),
    }
  );
  const result = minted.ok ? await minted.json() as { token?: unknown } : null;
  if (typeof result?.token !== "string" || !result.token || /\s/.test(result.token)) {
    throw new Error("Google denied the production PBOS invocation identity.");
  }
  return result.token;
}
