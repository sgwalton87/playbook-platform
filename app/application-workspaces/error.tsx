"use client";
import { PlaybookButton } from "@/components/ui/PlaybookButton";
import { PlaybookSurfaceState } from "@/components/ui";
import { RouteErrorReporter } from "@/components/observability/RouteErrorReporter";
export default function ErrorState({ error, reset }: { error: Error; reset: () => void }) { return <main style={{ maxWidth: 1040, margin: "48px auto", padding: 24 }}><RouteErrorReporter error={error} /><PlaybookSurfaceState state="error" title="Application workspaces are unavailable" description="No application state was inferred or substituted." action={<PlaybookButton onClick={reset}>Try again</PlaybookButton>} /></main>; }
