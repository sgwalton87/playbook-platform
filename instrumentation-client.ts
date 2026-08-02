import { reportClientFailure } from "./lib/observability/client";

window.addEventListener("error", (event) => reportClientFailure("client_error", event.error?.name || "ClientError"));
window.addEventListener("unhandledrejection", (event) => {
  const classification = event.reason instanceof Error ? event.reason.name : "UnhandledRejection";
  const kind = /navigation|route/i.test(classification) ? "navigation_failure" : "unhandled_rejection";
  reportClientFailure(kind, classification);
});

export function onRouterTransitionStart(): void {
  performance.mark("playbook-navigation-start");
}
