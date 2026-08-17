"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type PrivacyStatus = {
  profile_visibility: "private" | "public";
  active_consent: boolean;
  consent_version: string | null;
  consented_at: string | null;
  revoked_at: string | null;
};

const CONSENT_VERSION = "public-profile-v1";

function firstStatus(value: unknown): PrivacyStatus | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;
  return row as PrivacyStatus;
}

export default function ProfilePrivacyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PrivacyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.replace("/login?next=/profile/privacy"); return; }
    const result = await supabase.rpc("get_public_profile_privacy_status");
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    setStatus(firstStatus(result.data));
    setLoading(false);
  }, [router]);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  async function publish() {
    if (!consent) { setError("Confirm the publication consent before making your profile public."); return; }
    setBusy(true); setError(""); setMessage("");
    const result = await supabase.rpc("set_public_profile_visibility", {
      requested_public: true,
      requested_consent_version: CONSENT_VERSION,
    });
    if (result.error) { setError(result.error.message); setBusy(false); return; }
    setStatus(firstStatus(result.data));
    setConsent(false);
    setMessage("Your public profile is published under the current privacy consent. Sensitive private fields remain owner-only.");
    setBusy(false);
  }

  async function makePrivate() {
    setBusy(true); setError(""); setMessage("");
    const result = await supabase.rpc("set_public_profile_visibility", {
      requested_public: false,
      requested_consent_version: null,
    });
    if (result.error) { setError(result.error.message); setBusy(false); return; }
    setStatus(firstStatus(result.data));
    setMessage("Your public profile is private. Anonymous profile access is now disabled and your revocation is preserved for auditability.");
    setBusy(false);
  }

  const published = Boolean(status?.profile_visibility === "public" && status.active_consent);

  return <PlaybookPage>
    <div data-testid="profile-privacy" data-visual-canon="PGPP-PRIVACY-001">
      <PlaybookHero eyebrow="Profile Privacy" title="You control whether your Scholar profile is public." subtitle="Playbook now requires explicit, versioned publication consent. Private academic, financial, recruiting, location, and athletic-measurement fields remain owner-only even when you publish the public-safe profile projection.">
        <div style={actions}><PlaybookButton href="/profile">Edit private profile</PlaybookButton><PlaybookButton href="/dashboard" variant="secondary">Dashboard</PlaybookButton></div>
      </PlaybookHero>

      <PlaybookMetrics>
        <PlaybookMetric label="Current visibility" value={loading ? "…" : published ? "Public" : "Private"} />
        <PlaybookMetric label="Publication consent" value={loading ? "…" : status?.active_consent ? "Active" : "Not active"} />
        <PlaybookMetric label="Sensitive fields" value="Owner only" />
        <PlaybookMetric label="Consent version" value={status?.consent_version || "None"} />
      </PlaybookMetrics>

      {error ? <div role="alert" style={alert}>{error}</div> : null}
      {message ? <div role="status" aria-live="polite" style={success}>{message}</div> : null}

      <PlaybookGrid min={360}>
        <PlaybookCard eyebrow="Default deny" title={published ? "Your public-safe profile is currently published" : "Your profile is private"}>
          <PlaybookPill>{published ? "Explicitly public" : "Private by default"}</PlaybookPill>
          <p style={copy}>{published ? "Anonymous visitors may load only the public-safe profile projection. You can revoke publication at any time." : "Anonymous visitors cannot load your Scholar profile. Nothing becomes public until you explicitly publish it below."}</p>
          {published ? <button type="button" disabled={busy} onClick={() => void makePrivate()} style={dangerButton}>{busy ? "Updating…" : "Make profile private"}</button> : null}
        </PlaybookCard>

        <PlaybookCard eyebrow="Publication consent" title="What becomes public if you publish">
          <p style={copy}>Public-safe profile fields may include your username/display name, role, avatar/cover image, biography, sport/position, intended major, dream school, highlight link, selected social links, and favorite quote.</p>
          <p style={copy}><strong>Not public through this projection:</strong> GPA, SAT/ACT, grade, graduation year, exact school/location, athletic measurements, coach/team details, recruiting status, desired salary, XP/coins, private documents, support relationships, demographics, or other restricted Scholar Record data.</p>
          {!published ? <>
            <label style={consentRow}><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> I understand the public-safe field list above and explicitly consent to publish my Scholar profile under {CONSENT_VERSION}.</label>
            <button type="button" disabled={busy || !consent} onClick={() => void publish()} style={primaryButton}>{busy ? "Publishing…" : "Publish public-safe profile"}</button>
          </> : null}
        </PlaybookCard>
      </PlaybookGrid>
    </div>
  </PlaybookPage>;
}

const actions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const consentRow: React.CSSProperties = { display: "flex", gap: 10, alignItems: "flex-start", color: "#334155", lineHeight: 1.55, margin: "16px 0" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const success: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const primaryButton: React.CSSProperties = { minHeight: 44, border: 0, borderRadius: 999, padding: "0 16px", background: "#F97316", color: "#FFF", fontWeight: 900, cursor: "pointer" };
const dangerButton: React.CSSProperties = { ...primaryButton, background: "#B91C1C" };
