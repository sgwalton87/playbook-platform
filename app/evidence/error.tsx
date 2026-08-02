"use client";

import { PlaybookSurfaceState } from "@/components/ui";
import { PlaybookButton } from "@/components/ui/PlaybookButton";
import { RouteErrorReporter } from "@/components/observability/RouteErrorReporter";

export default function ErrorState({ error, reset }: { error: Error; reset: () => void }) {
  return <main style={{ maxWidth: 720, margin: "64px auto", padding: 32 }}><RouteErrorReporter error={error} /><PlaybookSurfaceState state="error" title="Evidence is temporarily unavailable" description="No evidence has been inferred or substituted. Try the authorized source again." action={<PlaybookButton onClick={reset}>Try again</PlaybookButton>} /></main>;
}
