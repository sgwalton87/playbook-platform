import type { Instrumentation } from "next";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./lib/observability/logger");
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { captureOperationalError } = await import("./lib/observability/logger");
  await captureOperationalError(error, {
    service: "playbook-web",
    component: context.routeType,
    operation: "next_request",
    context: { route: context.routePath },
    metadata: { method: request.method, routerKind: context.routerKind, digest: error && typeof error === "object" && "digest" in error && typeof error.digest === "string" ? error.digest : null },
  });
};
