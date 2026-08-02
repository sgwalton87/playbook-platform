export const DEPLOYMENT_ENVIRONMENTS = [
  "local",
  "test",
  "preview",
  "beta",
  "production",
] as const;

export type DeploymentEnvironment = (typeof DEPLOYMENT_ENVIRONMENTS)[number];

export type EnvironmentIssue = {
  variable: string;
  message: string;
};

export type EnvironmentValidationResult =
  | {
      ok: true;
      environment: DeploymentEnvironment;
      warnings: EnvironmentIssue[];
    }
  | {
      ok: false;
      environment: DeploymentEnvironment | null;
      errors: EnvironmentIssue[];
      warnings: EnvironmentIssue[];
    };

type EnvironmentValues = Readonly<Record<string, string | undefined>>;

const REQUIRED_APPLICATION_VARIABLES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const PLACEHOLDER_PATTERNS = [
  /^replace-with-/i,
  /your-(?:test-)?project/i,
  /\.example\.com(?:$|\/)/i,
] as const;

function normalizedValue(
  values: EnvironmentValues,
  variable: string,
): string | null {
  const value = values[variable]?.trim();
  return value ? value : null;
}

function parseDeploymentEnvironment(
  value: string | undefined,
): DeploymentEnvironment | null {
  return DEPLOYMENT_ENVIRONMENTS.includes(value as DeploymentEnvironment)
    ? (value as DeploymentEnvironment)
    : null;
}

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

function validateHttpsUrl(
  values: EnvironmentValues,
  variable: string,
  allowHttpLocalhost: boolean,
): EnvironmentIssue | null {
  const value = normalizedValue(values, variable);
  if (!value) return null;

  try {
    const url = new URL(value);
    const localHttp =
      allowHttpLocalhost &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname);

    if (url.protocol !== "https:" && !localHttp) {
      return { variable, message: "must use HTTPS outside local development" };
    }
  } catch {
    return { variable, message: "must be a valid absolute URL" };
  }

  return null;
}

export function validateEnvironment(
  values: EnvironmentValues,
): EnvironmentValidationResult {
  const warnings: EnvironmentIssue[] = [];
  const errors: EnvironmentIssue[] = [];
  const environment = parseDeploymentEnvironment(
    normalizedValue(values, "PLAYBOOK_DEPLOYMENT_ENV") ?? "local",
  );

  if (!environment) {
    errors.push({
      variable: "PLAYBOOK_DEPLOYMENT_ENV",
      message: `must be one of: ${DEPLOYMENT_ENVIRONMENTS.join(", ")}`,
    });
  }

  for (const variable of REQUIRED_APPLICATION_VARIABLES) {
    const value = normalizedValue(values, variable);
    if (!value) {
      errors.push({ variable, message: "is required" });
    } else if (isPlaceholder(value)) {
      errors.push({ variable, message: "must not use a documented placeholder" });
    }
  }

  const supabaseUrlIssue = validateHttpsUrl(
    values,
    "NEXT_PUBLIC_SUPABASE_URL",
    environment === "local" || environment === "test",
  );
  if (supabaseUrlIssue) errors.push(supabaseUrlIssue);

  if (environment === "beta" || environment === "production") {
    const appUrl = normalizedValue(values, "PLAYBOOK_APP_URL");
    if (!appUrl) {
      errors.push({ variable: "PLAYBOOK_APP_URL", message: "is required" });
    } else if (isPlaceholder(appUrl)) {
      errors.push({
        variable: "PLAYBOOK_APP_URL",
        message: "must not use a documented placeholder",
      });
    }

    const appUrlIssue = validateHttpsUrl(values, "PLAYBOOK_APP_URL", false);
    if (appUrlIssue) errors.push(appUrlIssue);

    for (const variable of ["PLAYBOOK_RELEASE", "PLAYBOOK_OBSERVABILITY_SECRET"] as const) {
      const value = normalizedValue(values, variable);
      if (!value || isPlaceholder(value)) {
        errors.push({ variable, message: "is required and must not use a documented placeholder" });
      }
    }
  }

  if (environment === "beta") {
    if (normalizedValue(values, "PLAYBOOK_BETA_EXPOSURE_MODE") !== "allowlist") {
      errors.push({
        variable: "PLAYBOOK_BETA_EXPOSURE_MODE",
        message: "must be allowlist for beta deployments",
      });
    }
    if (normalizedValue(values, "PLAYBOOK_BETA_REQUIRE_ACCESS_GRANT") !== "true") {
      errors.push({
        variable: "PLAYBOOK_BETA_REQUIRE_ACCESS_GRANT",
        message: "must be true for beta deployments",
      });
    }
  }

  const serviceRoleKey = normalizedValue(values, "SUPABASE_SERVICE_ROLE_KEY");
  const publicAnonKey = normalizedValue(values, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (serviceRoleKey && publicAnonKey && serviceRoleKey === publicAnonKey) {
    errors.push({
      variable: "SUPABASE_SERVICE_ROLE_KEY",
      message: "must not equal the public anonymous key",
    });
  }

  if (!normalizedValue(values, "NEXT_PUBLIC_HCAPTCHA_SITE_KEY")) {
    warnings.push({
      variable: "NEXT_PUBLIC_HCAPTCHA_SITE_KEY",
      message: "human-verification protection is not configured",
    });
  }

  if (!normalizedValue(values, "MAIL_GATEWAY_SECRET")) {
    warnings.push({
      variable: "MAIL_GATEWAY_SECRET",
      message: "inbound mail delivery will remain unavailable",
    });
  }

  for (const variable of ["RESEND_API_KEY", "PLAYBOOK_EMAIL_NOTIFICATIONS", "PLAYBOOK_ADMIN_NOTIFICATION_EMAIL"] as const) {
    if (!normalizedValue(values, variable)) {
      warnings.push({ variable, message: "governed outbound notification delivery will remain unavailable" });
    }
  }

  if (errors.length > 0) {
    return { ok: false, environment, errors, warnings };
  }

  return {
    ok: true,
    environment: environment ?? "local",
    warnings,
  };
}
