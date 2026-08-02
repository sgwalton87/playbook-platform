import { PlaybookSurfaceState } from "@/components/ui/PlaybookSurfaceState";

export default function BetaUnavailablePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <PlaybookSurfaceState
        state="restricted"
        title="This experience is not in the current beta"
        description="Playbook is opening governed experiences in stages. Return home for access guidance or use the invitation associated with your beta cohort."
        action={{ href: "/", label: "Return to Playbook home" }}
      />
    </main>
  );
}
