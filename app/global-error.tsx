"use client";

import { useEffect } from "react";
import { reportClientFailure } from "@/lib/observability/client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientFailure("client_error", error.name || "GlobalRenderError");
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 640, margin: "10vh auto", padding: 24 }}>
          <h1>Playbook could not load this experience</h1>
          <p>The failure has been recorded without including your private information. You can safely try again.</p>
          <button type="button" onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  );
}
