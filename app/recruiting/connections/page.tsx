"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlaybookButton,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui/PlaybookPage";
import { supabase } from "@/lib/supabaseClient";

type DirectoryProfile = {
  user_id: string;
  role: "coach" | "college_recruiter";
  display_name: string;
  organization: string | null;
  expertise: string[] | null;
};

type PendingInvitation = {
  invitee_user_id: string | null;
  relationship: string;
  status: string;
};

type SupportRelationship = {
  supporter_id: string | null;
  relationship: string;
  status: string;
};

type RelationshipState = "available" | "pending" | "connected";

type WorkspaceData = {
  profiles: DirectoryProfile[];
  invitations: PendingInvitation[];
  relationships: SupportRelationship[];
};

async function fetchWorkspace(userId: string): Promise<WorkspaceData> {
  const [directoryResult, invitationResult, relationshipResult] = await Promise.all([
    supabase
      .from("support_directory_profiles")
      .select("user_id,role,display_name,organization,expertise")
      .eq("searchable", true)
      .in("role", ["coach", "college_recruiter"])
      .order("display_name", { ascending: true }),
    supabase
      .from("support_invitations")
      .select("invitee_user_id,relationship,status")
      .eq("scholar_id", userId)
      .in("relationship", ["coach", "college_recruiter"])
      .eq("status", "pending"),
    supabase
      .from("support_relationships")
      .select("supporter_id,relationship,status")
      .eq("scholar_id", userId)
      .in("relationship", ["coach", "college_recruiter"])
      .eq("status", "active"),
  ]);

  const firstError = directoryResult.error || invitationResult.error || relationshipResult.error;
  if (firstError) throw firstError;

  return {
    profiles: (directoryResult.data || []) as DirectoryProfile[],
    invitations: (invitationResult.data || []) as PendingInvitation[],
    relationships: (relationshipResult.data || []) as SupportRelationship[],
  };
}

export default function RecruitingConnectionsPage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [relationships, setRelationships] = useState<SupportRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | DirectoryProfile["role"]>("all");
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login?next=/recruiting/connections");
        return;
      }

      try {
        const workspace = await fetchWorkspace(auth.user.id);
        if (!active) return;
        setOwnerId(auth.user.id);
        setProfiles(workspace.profiles);
        setInvitations(workspace.invitations);
        setRelationships(workspace.relationships);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load the verified recruiting network.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [router]);

  function stateFor(profile: DirectoryProfile): RelationshipState {
    if (relationships.some((row) => row.supporter_id === profile.user_id && row.relationship === profile.role && row.status === "active")) {
      return "connected";
    }
    if (invitations.some((row) => row.invitee_user_id === profile.user_id && row.relationship === profile.role && row.status === "pending")) {
      return "pending";
    }
    return "available";
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredProfiles = profiles.filter((profile) => {
    if (roleFilter !== "all" && profile.role !== roleFilter) return false;
    if (!normalizedQuery) return true;
    return [profile.display_name, profile.organization || "", ...(profile.expertise || [])]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  async function invite(profile: DirectoryProfile) {
    if (!ownerId) return;
    setSendingTo(profile.user_id);
    setError(null);
    setNotice(null);

    const { error: inviteError } = await supabase.rpc("create_verified_recruiting_support_invitation", {
      target_user_id: profile.user_id,
      relationship_kind: profile.role,
    });

    if (inviteError) {
      setError(inviteError.message);
      setSendingTo(null);
      return;
    }

    try {
      const workspace = await fetchWorkspace(ownerId);
      setProfiles(workspace.profiles);
      setInvitations(workspace.invitations);
      setRelationships(workspace.relationships);
      setNotice(`Connection invitation sent to ${profile.display_name}. No Scholar-record access was granted.`);
    } catch (reloadError) {
      setError(reloadError instanceof Error ? reloadError.message : "Invitation was created, but the network status could not be refreshed.");
    } finally {
      setSendingTo(null);
    }
  }

  return (
    <PlaybookPage>
      <div data-testid="recruiting-connections" data-visual-canon="PGRC-001">
        <PlaybookHero
          eyebrow="Verified Recruiting Network"
          title="Find verified people. Build relationships without giving away your record."
          subtitle="Search only Playbook identities whose Coach or College Recruiter verification has been approved. A connection invitation establishes relationship identity only; it does not grant access to your Scholar Record."
        >
          <div style={heroActions}>
            <PlaybookButton href="/recruiting">Recruiting Command Center</PlaybookButton>
            <PlaybookButton href="/scholar-athlete-os" variant="secondary">Scholar-Athlete OS</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={trustPanel} aria-labelledby="network-trust-heading">
          <PlaybookPill>Trust boundary</PlaybookPill>
          <h2 id="network-trust-heading" style={sectionTitle}>Verified identity is not data permission.</h2>
          <div style={trustGrid}>
            <TrustItem title="Verified publication" copy="Profiles appear here only after the underlying Coach or College Recruiter verification is approved." />
            <TrustItem title="Private routing" copy="Playbook routes the invitation to the verified account without exposing verification email evidence in this directory." />
            <TrustItem title="Explicit consent" copy="The professional must accept the invitation before a support relationship becomes active." />
            <TrustItem title="Zero-data by default" copy="Coach and Recruiter relationships created here carry no Scholar-record permissions." />
          </div>
        </section>

        <section style={directoryPanel} aria-labelledby="directory-heading">
          <div style={headingRow}>
            <div>
              <PlaybookPill>Coach Connections + Recruiter Search</PlaybookPill>
              <h2 id="directory-heading" style={sectionTitle}>Verified recruiting directory</h2>
            </div>
            <span style={recordTruth}>{loading ? "Loading verified identities…" : `${filteredProfiles.length} matching profile${filteredProfiles.length === 1 ? "" : "s"}`}</span>
          </div>

          <div style={filters}>
            <label style={fieldLabel}>
              Search
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, school, college, sport, position…" style={input} type="search" />
            </label>
            <label style={fieldLabel}>
              Role
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)} style={input}>
                <option value="all">All verified roles</option>
                <option value="coach">High School Coaches</option>
                <option value="college_recruiter">College Coaches / Recruiters</option>
              </select>
            </label>
          </div>

          {error ? <div role="alert" style={errorState}><strong>Recruiting network needs attention.</strong> {error}</div> : null}
          {notice ? <div role="status" style={successState}>{notice}</div> : null}

          {!loading && !error && profiles.length === 0 ? (
            <div style={emptyState}>
              <h3 style={{ marginTop: 0 }}>No verified recruiting professionals are published yet.</h3>
              <p style={muted}>Playbook will not manufacture a directory. Coaches and College Recruiters appear only after their real verification request is approved through the governed review process.</p>
            </div>
          ) : null}

          {!loading && !error && profiles.length > 0 && filteredProfiles.length === 0 ? (
            <div style={emptyState}>
              <h3 style={{ marginTop: 0 }}>No verified profiles match these filters.</h3>
              <p style={muted}>Try a broader name, organization, sport, position, or role filter.</p>
            </div>
          ) : null}

          <div style={profileGrid}>
            {filteredProfiles.map((profile) => {
              const relationshipState = stateFor(profile);
              const busy = sendingTo === profile.user_id;
              return (
                <article key={profile.user_id} style={profileCard}>
                  <div style={cardTopline}>
                    <span style={verifiedBadge}>✓ Verified {profile.role === "coach" ? "Coach" : "College Recruiter"}</span>
                    <span style={stateBadge}>{relationshipState === "connected" ? "Connected" : relationshipState === "pending" ? "Invitation pending" : "Available"}</span>
                  </div>
                  <h3 style={profileName}>{profile.display_name}</h3>
                  <p style={organization}>{profile.organization || "Organization not published"}</p>
                  {(profile.expertise || []).length > 0 ? (
                    <ul style={expertiseList} aria-label="Published expertise">
                      {(profile.expertise || []).map((item) => <li key={item} style={expertiseChip}>{item}</li>)}
                    </ul>
                  ) : (
                    <p style={muted}>No additional public recruiting focus has been published.</p>
                  )}
                  <div style={cardFooter}>
                    {relationshipState === "available" ? (
                      <button type="button" onClick={() => void invite(profile)} disabled={busy} style={{ ...connectButton, opacity: busy ? 0.65 : 1 }}>
                        {busy ? "Sending…" : "Invite to Connect"}
                      </button>
                    ) : (
                      <span style={relationshipNote}>
                        {relationshipState === "connected"
                          ? "Relationship identity active · Scholar data permissions: none"
                          : "Waiting for the verified professional to accept"}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </PlaybookPage>
  );
}

function TrustItem({ title, copy }: { title: string; copy: string }) {
  return <div style={trustItem}><strong style={trustTitle}>{title}</strong><span style={trustCopy}>{copy}</span></div>;
}

const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: "clamp(20px,4vw,30px)", background: "#081D34", color: "#F8FAFC", borderRadius: "8px 28px 8px 28px", border: "1px solid rgba(255,255,255,.1)" };
const trustGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12, marginTop: 18 };
const trustItem: React.CSSProperties = { display: "grid", gap: 6, padding: 16, borderRadius: 16, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" };
const trustTitle: React.CSSProperties = { color: "#FFFFFF", fontSize: 14 };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", fontSize: 13, lineHeight: 1.55 };
const directoryPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "clamp(20px,4vw,34px)", background: "#FFFFFF", border: "1px solid #DDE6EF", borderRadius: "24px 6px 24px 6px", boxShadow: "0 16px 50px rgba(15,23,42,.06)" };
const headingRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "start" };
const sectionTitle: React.CSSProperties = { margin: "12px 0 0", color: "#102238", fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.05 };
const recordTruth: React.CSSProperties = { color: "#6B7F94", fontSize: 12, fontWeight: 800 };
const filters: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12, marginTop: 24 };
const fieldLabel: React.CSSProperties = { display: "grid", gap: 7, color: "#20364E", fontSize: 12, fontWeight: 900 };
const input: React.CSSProperties = { width: "100%", minHeight: 46, boxSizing: "border-box", borderRadius: 13, border: "1px solid #C9D6E2", padding: "0 13px", background: "#FBFCFE", color: "#102238", font: "inherit" };
const errorState: React.CSSProperties = { marginTop: 18, padding: 16, borderRadius: 16, background: "#FFF5F4", border: "1px solid #F5B7B1", color: "#7F1D1D" };
const successState: React.CSSProperties = { marginTop: 18, padding: 16, borderRadius: 16, background: "#F0FDF4", border: "1px solid #86EFAC", color: "#166534", fontWeight: 800 };
const emptyState: React.CSSProperties = { marginTop: 22, padding: 22, borderRadius: 18, background: "#F4F8FB", border: "1px dashed #B8C9D8", color: "#20364E" };
const muted: React.CSSProperties = { margin: "8px 0 0", color: "#61748A", lineHeight: 1.6 };
const profileGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 16, marginTop: 24 };
const profileCard: React.CSSProperties = { display: "flex", flexDirection: "column", padding: 20, borderRadius: 20, border: "1px solid #E2E8F0", background: "linear-gradient(180deg,#FFFFFF,#F8FAFC)", minHeight: 265 };
const cardTopline: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 };
const verifiedBadge: React.CSSProperties = { color: "#0F766E", fontSize: 10, fontWeight: 950, letterSpacing: ".08em", textTransform: "uppercase" };
const stateBadge: React.CSSProperties = { color: "#61748A", fontSize: 10, fontWeight: 900 };
const profileName: React.CSSProperties = { margin: "15px 0 4px", color: "#102238", fontSize: 24 };
const organization: React.CSSProperties = { margin: 0, color: "#4A6078", fontWeight: 800 };
const expertiseList: React.CSSProperties = { listStyle: "none", padding: 0, margin: "16px 0", display: "flex", flexWrap: "wrap", gap: 7 };
const expertiseChip: React.CSSProperties = { padding: "6px 9px", borderRadius: 999, background: "#EDF4FA", color: "#29455F", fontSize: 11, fontWeight: 800 };
const cardFooter: React.CSSProperties = { marginTop: "auto", paddingTop: 16 };
const connectButton: React.CSSProperties = { minHeight: 44, border: 0, borderRadius: 999, padding: "0 16px", background: "#F97316", color: "#FFFFFF", fontWeight: 950, cursor: "pointer" };
const relationshipNote: React.CSSProperties = { display: "block", color: "#526A82", fontSize: 12, lineHeight: 1.55, fontWeight: 750 };
