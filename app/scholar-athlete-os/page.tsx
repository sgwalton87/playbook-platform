import { redirect } from "next/navigation";
import ScholarAthleteDashboard from "@/components/scholar-athlete/ScholarAthleteDashboard";
import { PlaybookSurfaceState } from "@/components/ui/PlaybookSurfaceState";
import { loadScholarAthleteDashboard } from "@/lib/scholar-athlete/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ScholarAthleteOSPage() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const result = await loadScholarAthleteDashboard(supabase, auth.user.id);
  if (!result.ok) {
    return (
      <main className="athlete-os-shell">
        <PlaybookSurfaceState
          state="error"
          title="Athlete workspace unavailable"
          description={result.error}
          action={{ href: "/scholar-athlete-os", label: "Try again" }}
        />
      </main>
    );
  }
  return <ScholarAthleteDashboard initialData={result.data} />;
}
