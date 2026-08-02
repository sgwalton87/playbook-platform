"use client";

import { PlaybookSurfaceState } from "@/components/ui/PlaybookSurfaceState";
import { RouteErrorReporter } from "@/components/observability/RouteErrorReporter";

export default function ErrorState({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="athlete-os-shell">
      <RouteErrorReporter error={error} />
      <PlaybookSurfaceState
        state="error"
        title="Athlete OS needs a reset"
        description="Your data was not changed. Retry the authorized workspace request."
        action={<button className="playbook-button" onClick={reset}>Retry Athlete OS</button>}
      />
    </main>
  );
}
