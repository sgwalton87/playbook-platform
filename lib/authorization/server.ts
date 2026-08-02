import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authorizeRouteContext, type ActiveScholarRelationship } from "./routeAuthorization";
import type { Permission } from "@/lib/permissions";
import type { PlaybookRole } from "@/lib/roles/registry";
import { normalizePlaybookRole } from "@/lib/roles/registry";

export async function resolveServerAuthorization(input: {
  allowedRoles?: readonly PlaybookRole[];
  scholarId?: string | null;
  permission?: Permission;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return authorizeRouteContext({ identity: null, profile: null });

  const { data: profile } = await supabase.from("profiles").select("id,role,profile_mode").eq("id", auth.user.id).maybeSingle();
  const role = normalizePlaybookRole(profile?.profile_mode || profile?.role);
  const scholarRoles: PlaybookRole[] = ["scholar", "scholar-athlete", "transition-youth"];
  let resolvedScholarId = input.scholarId || (scholarRoles.includes(role) ? auth.user.id : null);
  let relationshipRows: Array<{ scholar_id: string; supporter_id: string | null; relationship: ActiveScholarRelationship["relationship"]; status: ActiveScholarRelationship["status"]; permissions: Permission[] }> = [];

  if (resolvedScholarId && resolvedScholarId !== auth.user.id) {
    const { data } = await supabase.from("support_relationships").select("scholar_id,supporter_id,relationship,status,permissions").eq("scholar_id", resolvedScholarId).eq("supporter_id", auth.user.id).eq("status", "active");
    relationshipRows = data || [];
  } else if (!resolvedScholarId && input.permission) {
    const { data: active } = await supabase.from("active_scholar_contexts").select("scholar_id").eq("user_id", auth.user.id).maybeSingle();
    resolvedScholarId = active?.scholar_id || null;
    if (resolvedScholarId) {
      const { data } = await supabase.from("support_relationships").select("scholar_id,supporter_id,relationship,status,permissions").eq("scholar_id", resolvedScholarId).eq("supporter_id", auth.user.id).eq("status", "active");
      relationshipRows = data || [];
    }
  }

  const relationships: ActiveScholarRelationship[] = (relationshipRows || []).map((row) => ({
    scholarId: row.scholar_id,
    supporterId: row.supporter_id,
    relationship: row.relationship,
    status: row.status,
    permissions: row.permissions || [],
  }));

  return authorizeRouteContext({
    identity: { id: auth.user.id, email: auth.user.email },
    profile,
    allowedRoles: input.allowedRoles,
    scholarId: input.permission ? (resolvedScholarId || "relationship-not-resolved") : input.scholarId,
    permission: input.permission,
    relationships,
  });
}
