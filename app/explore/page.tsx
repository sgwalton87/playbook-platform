import { redirect } from "next/navigation";
import CapabilityDirectory from "@/components/explore/CapabilityDirectory";
import { requireUser } from "@/lib/supabase/server";
import { isPlatformOperatorRole } from "@/lib/auth/platformOperator";
import { getCapabilityCatalog } from "@/lib/platform/capabilityCatalog";

export default async function ExplorePlaybookPage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login?next=/explore");

  const profile = await supabase
    .from("profiles")
    .select("role,profile_mode")
    .eq("id", user.id)
    .maybeSingle();

  const durableRole = profile.data?.profile_mode || profile.data?.role || null;
  const includeFounder = isPlatformOperatorRole(profile.data?.role);

  return (
    <CapabilityDirectory
      groups={getCapabilityCatalog({ includeFounder })}
      currentRole={durableRole}
    />
  );
}
