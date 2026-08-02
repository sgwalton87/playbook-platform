import { redirect } from "next/navigation";
import ApplicationWorkspaceDashboard from "@/components/application-workspace/ApplicationWorkspaceDashboard";
import ForbiddenState from "@/components/auth/ForbiddenState";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ApplicationWorkspacesPage() {
  const authorization = await resolveServerAuthorization({ permission: "view_progress" });
  if (!authorization.authorized && authorization.reason === "unauthenticated") redirect("/login");
  if (!authorization.authorized) return <ForbiddenState reason="Select an active Scholar relationship with progress access." />;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("application_workspaces").select("id,opportunity_name,opportunity_type,deadline,requirements,evidence,status,created_at").eq("scholar_id", authorization.scholarId).order("created_at", { ascending: false });
  if (error) throw new Error("Authorized application workspaces are unavailable.");
  return <ApplicationWorkspaceDashboard scholarId={authorization.scholarId} initialWorkspaces={data || []} canCreate={authorization.relationship === null} />;
}
