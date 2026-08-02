"use client";

import { PlaybookSurfaceState } from "@/components/ui/PlaybookSurfaceState";
import { RouteErrorReporter } from "@/components/observability/RouteErrorReporter";

export default function ErrorState({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="athlete-os-shell">
      <RouteErrorReporter error={error} />
      <PlaybookSurfaceState
        state="error"
        title="NIL review stopped safely"
        description="No compliance decision was changed. Retry the authorized queue."
        action={
          <button className="playbook-button" onClick={reset}>
            Retry review queue
          </button>
        }
      />
    </main>
  );
}
