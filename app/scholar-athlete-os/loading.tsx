import { PlaybookSurfaceState } from "@/components/ui/PlaybookSurfaceState";

export default function Loading() {
  return (
    <main className="athlete-os-shell">
      <PlaybookSurfaceState
        state="loading"
        title="Loading Athlete OS"
        description="Resolving your athlete-owned profile, recruiting pipeline, and NIL workspace."
      />
    </main>
  );
}
