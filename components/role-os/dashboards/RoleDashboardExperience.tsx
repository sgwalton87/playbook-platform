"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";
import PermissionGate from "@/components/permissions/PermissionGate";
import { getRoleDashboard } from "@/lib/role-os/roleDashboards";
import { mapRoleToRelationship } from "@/lib/permissions";
import type { PlaybookRoleOS } from "@/lib/role-os";
import { supabase } from "@/lib/supabaseClient";

type RoleProfile = {
  id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  role?: string | null;
  profile_mode?: string | null;
  onboarding_completed?: boolean | null;
  public_profile_complete?: boolean | null;
  onboarding_data?: Record<string, unknown> | null;
  school?: string | null;
  school_district?: string | null;
  organization_name?: string | null;
  title?: string | null;
};

function text(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function getProfileName(profile: RoleProfile | null) {
  return profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.username || "Profile not named";
}

export default function RoleDashboardExperience({
  role,
}: {
  role: PlaybookRoleOS;
}) {
  const dashboard = getRoleDashboard(role);
  const relationship = mapRoleToRelationship(role);
  const [profile, setProfile] = useState<RoleProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,first_name,last_name,username,role,profile_mode,onboarding_completed,public_profile_complete,onboarding_data,school,school_district,organization_name,title")
        .eq("id", userData.user.id)
        .maybeSingle();

      setProfile((data as RoleProfile | null) || null);
      setLoading(false);
    }

    loadProfile();
  }, []);

  const onboardingData = useMemo(() => profile?.onboarding_data || {}, [profile?.onboarding_data]);
  const organization = text(onboardingData.organization_name) || text(profile?.organization_name) || text(profile?.school) || text(profile?.school_district);
  const supportFocus = text(onboardingData.family_focus) || text(onboardingData.expertise) || text(onboardingData.educator_support_focus) || text(onboardingData.partnership_goals);

  if (loading) return <PlaybookPage><main style={{ padding: 40 }}>Loading role dashboard...</main></PlaybookPage>;

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow={`${role} OS`}
        title={dashboard.title}
        subtitle={profile ? `${getProfileName(profile)} · ${profile.profile_mode || profile.role || "Role not set"}` : "No signed-in profile data is available for this dashboard."}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/profile">Update Profile</PlaybookButton>
          <PlaybookButton href="/messages" variant="secondary">Messages</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookMetrics>
        <PlaybookMetric label="Signed-in Profile" value={profile ? "Loaded" : "Not available"} />
        <PlaybookMetric label="Role" value={profile?.profile_mode || profile?.role || "Not set"} />
        <PlaybookMetric label="Onboarding" value={profile?.onboarding_completed ? "Complete" : "Not complete"} />
        <PlaybookMetric label="Public Profile" value={profile?.public_profile_complete ? "Complete" : "Incomplete"} />
      </PlaybookMetrics>

      <PlaybookGrid min={300}>
        <PlaybookCard eyebrow="Runtime Profile" title="Profile data used by this OS">
          <div style={{ display: "grid", gap: 10 }}>
            <div style={row}><span style={check}>•</span><span>Organization: {organization || "Not provided"}</span></div>
            <div style={row}><span style={check}>•</span><span>Title: {text(onboardingData.title) || text(onboardingData.mentor_title) || text(profile?.title) || "Not provided"}</span></div>
            <div style={row}><span style={check}>•</span><span>Support focus: {supportFocus || "Not provided"}</span></div>
          </div>
        </PlaybookCard>

        <PlaybookCard eyebrow="Permission-Aware Access" title="What this relationship can do">
          <div style={{ display: "grid", gap: 10 }}>
            <PermissionGate relationship={relationship} permission="view_progress">
              <div style={row}><span style={check}>✓</span><span>View learner progress</span></div>
            </PermissionGate>

            <PermissionGate relationship={relationship} permission="verify_evidence">
              <div style={row}><span style={check}>✓</span><span>Verify scholar evidence</span></div>
            </PermissionGate>

            <PermissionGate relationship={relationship} permission="create_opportunities">
              <div style={row}><span style={check}>✓</span><span>Create opportunity pathways</span></div>
            </PermissionGate>

            <PermissionGate relationship={relationship} permission="view_equity_metrics">
              <div style={row}><span style={check}>✓</span><span>View system equity metrics</span></div>
            </PermissionGate>
          </div>
        </PlaybookCard>

        <PlaybookCard eyebrow="Empty State" title="No fabricated metrics">
          <p style={body}>
            This dashboard now displays only authenticated profile fields and permissions that already exist in the runtime. Metrics that require cohort, relationship, or opportunity data remain empty until live data is connected.
          </p>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  color: "#0F172A",
  fontWeight: 800,
};

const check: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  background: "#10B981",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 900,
  flexShrink: 0,
};
