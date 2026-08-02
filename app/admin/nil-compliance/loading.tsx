import { PlaybookSurfaceState } from "@/components/ui/PlaybookSurfaceState";

export default function Loading() {
  return (
    <main className="athlete-os-shell">
      <PlaybookSurfaceState
        state="loading"
        title="Loading NIL compliance"
        description="Resolving administrator authority and athlete-submitted governance records."
      />
    </main>
  );
}
