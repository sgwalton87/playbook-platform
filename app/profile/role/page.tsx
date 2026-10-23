"use client";
import { stableProfileSnapshot } from "@/lib/onboarding/stableSnapshot";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SportPositionField from "@/components/profile/SportPositionField";
import ActivityProfileField from "@/components/profile/ActivityProfileField";
import { getOnboardingSteps } from "@/lib/onboarding/engine";
import { ALL_COLLEGE_OPTIONS, CAREER_OPTIONS, CALIFORNIA_DISTRICTS } from "@/lib/onboarding";
import { PLAYBOOK_ROLES, requirePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";
import type { OnboardingValue } from "@/lib/onboarding/types";
import { getRoleEditableFields } from "@/lib/onboarding/editableFields";

type SavedProfile = {
  id: string;
  role: string | null;
  profile_mode: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  bio: string | null;
  onboarding_data: Record<string, OnboardingValue> | null;
};

const shell: React.CSSProperties = { minHeight: "100vh", background: "linear-gradient(160deg, #06172d 0%, #102d50 220px, #f5f7fc 220px)", padding: "clamp(16px, 4vw, 32px) 16px 140px", color: "#0f172a", fontFamily: "\'Hanken Grotesk\', system-ui, sans-serif" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontSize: 16, boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 };

export function RoleProfileEditor({ mode = "standard" }: { mode?: "standard" | "athlete" }) {
  const router = useRouter();
  const [profile, setProfile] = useState<SavedProfile | null>(null);
  const [role, setRole] = useState<PlaybookRole | null>(null);
  const [answers, setAnswers] = useState<Record<string, OnboardingValue>>({});
  const [pending, setPending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.replace("/login"); return; }
      const { data: p, error } = await supabase.from("profiles")
        .select("id,role,profile_mode,first_name,last_name,full_name,bio,onboarding_data")
        .eq("id", auth.user.id).single();
      if (!active) return;
      if (error || !p) { setNotice("Your profile could not be loaded."); setPending(false); return; }
      let canonical: PlaybookRole;
      try { canonical = requirePlaybookRole(p.profile_mode || p.role); }
      catch { setNotice("Your registered pathway needs verification. Please contact Playbook support."); setPending(false); return; }
      const record = p as SavedProfile;
      const saved = record.onboarding_data && typeof record.onboarding_data === "object" && !Array.isArray(record.onboarding_data)
        ? record.onboarding_data : {};
      setProfile(record);
      setRole(canonical);
      const fullName = String(saved.full_name ?? record.full_name ?? "").trim();
      const nameParts = fullName.split(/\s+/).filter(Boolean);
      const fallbackFirst = nameParts[0] ?? "";
      const fallbackLast = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      // Never overwrite an explicitly saved name, but fill sparse legacy profiles
      // from their existing full_name value rather than presenting blank inputs.
      setAnswers({
        ...saved,
        first_name: saved.first_name || record.first_name || fallbackFirst,
        last_name: saved.last_name || record.last_name || fallbackLast,
        full_name: fullName,
        bio: saved.bio ?? record.bio ?? ""
      });
      setPending(false);
    }
    void load();
    return () => { active = false; };
  }, [router]);

  const steps = useMemo(() => role ? getOnboardingSteps(role) : [], [role]);
  const athleteSteps = new Set(["athlete-profile", "athlete-recruiting"]);
  const visibleSteps = useMemo(() => steps.filter(step => role === "scholar-athlete" && mode === "athlete" ? athleteSteps.has(step.id) : !athleteSteps.has(step.id)), [steps, role, mode]);
  const fields = useMemo(() => getRoleEditableFields(visibleSteps), [visibleSteps]);

  const update = (key: string, value: OnboardingValue) =>
    setAnswers(previous => ({ ...previous, [key]: value }));

  async function save() {
    if (!profile || !role || saving) return;
    setSaving(true);
    setNotice("");
    const firstName = String(answers.first_name ?? "").trim();
    const lastName = String(answers.last_name ?? "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || String(answers.full_name ?? "").trim();
    const updatedAnswers: Record<string, OnboardingValue> = { ...answers, first_name: firstName, last_name: lastName, full_name: fullName };
    // Empty UI slots are not meaningful saved answers. Preserve order of entered values.
    for (const field of fields) {
      if (field.type !== "college-list" && field.type !== "invite-list") continue;
      const list = updatedAnswers[field.key];
      if (Array.isArray(list)) {
        updatedAnswers[field.key] = list.filter((entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0
        ).map(entry => typeof entry === "string" ? entry.trim() : "");
      }
    }
    // Keep compatible persisted profile columns in sync with the private draft.
    // Only fields submitted by the member are written; never write authorization state.
    const writableLegacyFields: Record<string, string> = {
      date_of_birth: "date_of_birth", gender: "gender", school: "school",
      school_district: "school_district", grade: "grade",
      dream_school: "dream_school", intended_major: "intended_major",
      primary_sport: "sport", position: "position",
      height: "height", weight: "weight", city: "city", zip_code: "zip_code",
    };
    const compatibleUpdates: Record<string, string | null> = {};
    for (const [answerKey, column] of Object.entries(writableLegacyFields)) {
      if (Object.prototype.hasOwnProperty.call(updatedAnswers, answerKey)) {
        const value = updatedAnswers[answerKey];
        if (typeof value === "string") compatibleUpdates[column] = value.trim() || null;
      }
    }
    // Detect stale editor state before replacing the private onboarding snapshot.
    const { data: latest, error: freshnessError } = await supabase.from("profiles")
      .select("onboarding_data").eq("id", profile.id).maybeSingle();
    if (freshnessError || !latest) {
      setSaving(false);
      setNotice("Unable to check for newer changes. Please reload before saving.");
      return;
    }
    if (stableProfileSnapshot(latest.onboarding_data) !== stableProfileSnapshot(profile.onboarding_data)) {
      setSaving(false);
      setNotice("Your profile was updated elsewhere. Reload to review those changes before saving.");
      return;
    }
    // Never update role, verification, consent, or authorization from this editor.
    const { data, error } = await supabase.from("profiles").update({
      ...compatibleUpdates,
      first_name: firstName || null,
      last_name: lastName || null,
      full_name: fullName || null,
      bio: String(answers.bio ?? "") || null,
      onboarding_data: updatedAnswers,
    }).eq("id", profile.id).select("id").maybeSingle();
    if (error || !data) { setSaving(false); setNotice("Changes could not be saved. Please try again."); return; }
    // A successful UPDATE request alone does not certify durable persistence.
    // Read the owner-scoped row back before showing the green saved message.
    const { data: persisted, error: verifyError } = await supabase.from("profiles")
      .select("onboarding_data,first_name,last_name,full_name").eq("id", profile.id).maybeSingle();
    setSaving(false);
    if (verifyError || !persisted ||
        stableProfileSnapshot(persisted.onboarding_data) !== stableProfileSnapshot(updatedAnswers) ||
        (persisted.first_name ?? "") !== firstName ||
        (persisted.last_name ?? "") !== lastName) {
      setNotice("Save could not be verified. Your changes may not be stored. Please reload and confirm before leaving.");
      return;
    }
    setAnswers(updatedAnswers);
    setProfile(previous => previous ? { ...previous, onboarding_data: updatedAnswers } : previous);
    setNotice("Saved and verified. Your answers were read back from your private Playbook profile.");
  }

  if (pending) return <main style={shell} role="status">Loading your profile…</main>;
  if (!profile || !role) return <main style={shell} role="alert">{notice || "Profile unavailable."}</main>;

  return <main style={shell}>
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <button onClick={() => router.push(PLAYBOOK_ROLES[role].osRoute)} style={{ ...inputStyle, width: "auto", marginBottom: 16 }}>← Back to {PLAYBOOK_ROLES[role].osLabel}</button>
      <header style={{ background: "linear-gradient(135deg, #07182e, #183c62)", color: "#fff", borderRadius: 24, padding: "clamp(22px, 4vw, 40px)", marginBottom: 22, boxShadow: "0 20px 54px rgba(4, 18, 39, .20)" }}>
        <p style={{ color: "#fd923d", margin: 0, fontWeight: 800, letterSpacing: 2, fontSize: 12 }}>YOUR PRIVATE PLAYBOOK ACCOUNT</p>
        <h1 style={{ marginBottom: 8, fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.1 }}>{PLAYBOOK_ROLES[role].osLabel} · {mode === "athlete" ? "Athlete & Recruiting Profile" : "My Profile"}</h1>
        <p style={{ lineHeight: 1.6, marginBottom: 0 }}>Update the same information you entered during onboarding. Background answers stay private; public visibility is managed separately.</p>
      </header>
      {mode === "standard" && (role === "scholar" || role === "scholar-athlete") && (
        <aside style={{ border: "1px solid #fed7aa", background: "#fff7ed", borderRadius: 16, padding: 18, marginBottom: 20 }}>
          <strong>{role === "scholar-athlete" ? "Your Athlete & Recruiting Profile" : "Additional Scholar profile tools"}</strong>
          <p style={{ margin: "8px 0 12px", lineHeight: 1.6 }}>{role === "scholar-athlete" ? "Build your athlete card and recruiting readiness in a focused, modern module. Your entries share the same saved Scholar-Athlete onboarding record." : "Additional Scholar tools are preserved in the existing editor."}</p>
          <button type="button" onClick={() => router.push(role === "scholar-athlete" ? "/profile/athlete" : "/profile/advanced")} style={{ border: 0, borderRadius: 10, padding: "12px 16px", background: "#0f2c4b", color: "#fff", fontWeight: 800, cursor: "pointer" }}>{role === "scholar-athlete" ? "Build my athlete profile →" : "Open advanced profile tools →"}</button>
        </aside>
      )}
      <datalist id="profile-college-options">{ALL_COLLEGE_OPTIONS.map(name => <option key={name} value={name} />)}</datalist>
      <datalist id="profile-career-options">{CAREER_OPTIONS.map(name => <option key={name} value={name} />)}</datalist>
      <datalist id="profile-district-options">{CALIFORNIA_DISTRICTS.map(name => <option key={name} value={name} />)}</datalist>
      {visibleSteps.map(step => {
        const stepFields = fields.filter(field => field.stepId === step.id);
        if (!stepFields.length) return null;
        return <section key={step.id} style={{ background: "#fff", borderRadius: 20, padding: "clamp(18px, 3vw, 28px)", marginBottom: 18, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(15, 23, 42, .05)" }}>
          <h2 style={{ fontSize: 21, marginTop: 0 }}>{step.title}</h2>
          <p style={{ color: "#475569", fontSize: 14 }}>{step.body}</p>
          {stepFields.map(field => {
            const value = answers[field.key];
            const current = Array.isArray(value) ? value : [];
            return <div key={field.key} style={{ margin: "20px 0" }}>
              <label htmlFor={field.key} style={labelStyle}>{field.label}</label>
              {field.type === "activity-list"
                ? <ActivityProfileField value={value} onChange={entries => update(field.key, entries)} />
                : field.type === "college-list" || field.type === "invite-list"
                ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
                    {Array.from({ length: field.type === "college-list" ? 10 : 5 }, (_, index) =>
                      <label key={index} style={labelStyle}>
                        {index + 1}. {field.type === "college-list" ? "College" : "Contact email"}
                        <input type={field.type === "invite-list" ? "email" : "text"}
                          list={field.type === "college-list" ? "profile-college-options" : undefined}
                          style={inputStyle} value={typeof current[index] === "string" ? current[index] : ""}
                          onChange={e => {
                            const next = Array.from({ length: field.type === "college-list" ? 10 : 5 }, (_, i) =>
                              typeof current[i] === "string" ? current[i] : "");
                            next[index] = e.target.value;
                            update(field.key, next);
                          }}
                          placeholder={field.placeholder || ""} />
                      </label>)}
                    <p style={{ gridColumn: "1 / -1", color: "#64748b", fontSize: 12 }}>
                      {field.type === "invite-list" ? "Contacts stay private. Saving this list never sends an invitation or creates access." : "Your college preferences are saved privately."}
                    </p>
                  </div>
                : field.type === "sport-position"
                ? <SportPositionField sport={String(answers.primary_sport ?? "")} value={String(value ?? "")} onChange={next => update(field.key, next)} inputStyle={inputStyle} labelStyle={labelStyle} />
                : field.key === "date_of_birth"
                ? <input id={field.key} type="date" style={inputStyle} value={String(value ?? "")} onChange={e => update(field.key, e.target.value)} />
                : field.type === "college" || field.type === "career" || field.type === "district"
                ? <input id={field.key} style={inputStyle} list={field.type === "college" ? "profile-college-options" : field.type === "career" ? "profile-career-options" : "profile-district-options"} value={String(value ?? "")} placeholder={field.placeholder || ""} onChange={e => update(field.key, e.target.value)} />
                : field.type === "textarea"
                ? <textarea id={field.key} rows={4} style={inputStyle} value={String(value ?? "")} onChange={e => update(field.key, e.target.value)} />
                : field.type === "multi-select"
                ? <div style={{ display: "grid", gap: 10 }}>{(field.options || []).map(option =>
                    <label key={option} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input type="checkbox" checked={current.includes(option)}
                        onChange={e => update(field.key, e.target.checked ? [...current, option] : current.filter(v => v !== option))} /> {option}
                    </label>)}</div>
                : field.type === "select"
                ? <select id={field.key} style={inputStyle} value={String(value ?? "")} onChange={e => update(field.key, e.target.value)}>
                    <option value="">Select…</option>{(field.options || []).map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                : <input id={field.key} style={inputStyle} value={String(value ?? "")}
                    placeholder={field.placeholder || ""} onChange={e => update(field.key, e.target.value)} />}
            </div>;
          })}
        </section>;
      })}
      <p role="status" aria-live="polite" style={{ minHeight: 24 }}>{notice}</p>
      <button onClick={() => void save()} disabled={saving}
        style={{ background: "#ea580c", color: "white", padding: "17px 25px", borderRadius: 14, border: "none", fontWeight: 800, fontSize: 17, width: "100%", cursor: "pointer" }}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  </main>;
}

export default function RoleProfilePage() { return <RoleProfileEditor />; }
