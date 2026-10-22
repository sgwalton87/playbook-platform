"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getOnboardingSteps } from "@/lib/onboarding/engine";
import { PLAYBOOK_ROLES, requirePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";
import type { OnboardingValue } from "@/lib/onboarding/types";

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

const shell: React.CSSProperties = { minHeight: "100vh", background: "#eef2f8", padding: "28px 18px 100px", color: "#0f172a", fontFamily: "system-ui, sans-serif" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontSize: 16, boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 };

export default function RoleProfilePage() {
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
      if (canonical === "scholar" || canonical === "scholar-athlete") { router.replace("/profile"); return; }
      const record = p as SavedProfile;
      const saved = record.onboarding_data && typeof record.onboarding_data === "object" && !Array.isArray(record.onboarding_data)
        ? record.onboarding_data : {};
      setProfile(record);
      setRole(canonical);
      setAnswers({
        ...saved,
        first_name: saved.first_name ?? record.first_name ?? "",
        last_name: saved.last_name ?? record.last_name ?? "",
        full_name: saved.full_name ?? record.full_name ?? "",
        bio: saved.bio ?? record.bio ?? ""
      });
      setPending(false);
    }
    void load();
    return () => { active = false; };
  }, [router]);

  const steps = useMemo(() => role ? getOnboardingSteps(role) : [], [role]);
  const fields = useMemo(() => steps.flatMap(step => step.fields
    .filter(field => field.type !== "safety-agreement" && field.type !== "invite-list")
    .map(field => ({ ...field, phase: step.phase }))), [steps]);

  const update = (key: string, value: OnboardingValue) =>
    setAnswers(previous => ({ ...previous, [key]: value }));

  async function save() {
    if (!profile || !role || saving) return;
    setSaving(true);
    setNotice("");
    const firstName = String(answers.first_name ?? "").trim();
    const lastName = String(answers.last_name ?? "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || String(answers.full_name ?? "").trim();
    const updatedAnswers = { ...answers, full_name: fullName };
    // Never update role, verification, consent, or authorization from this editor.
    const { data, error } = await supabase.from("profiles").update({
      first_name: firstName || null,
      last_name: lastName || null,
      full_name: fullName || null,
      bio: String(answers.bio ?? "") || null,
      onboarding_data: updatedAnswers,
    }).eq("id", profile.id).select("id").maybeSingle();
    setSaving(false);
    if (error || !data) { setNotice("Changes could not be saved. Please try again."); return; }
    setAnswers(updatedAnswers);
    setNotice("Saved. Your onboarding answers and profile are synchronized.");
  }

  if (pending) return <main style={shell}>Loading your profile…</main>;
  if (!profile || !role) return <main style={shell} role="alert">{notice || "Profile unavailable."}</main>;

  return <main style={shell}>
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <button onClick={() => router.push(PLAYBOOK_ROLES[role].osRoute)} style={{ ...inputStyle, width: "auto", marginBottom: 16 }}>← Back to {PLAYBOOK_ROLES[role].osLabel}</button>
      <header style={{ background: "#101c34", color: "#fff", borderRadius: 20, padding: 24, marginBottom: 20 }}>
        <p style={{ color: "#fd923d", margin: 0, fontWeight: 800, letterSpacing: 2, fontSize: 12 }}>YOUR PRIVATE PLAYBOOK ACCOUNT</p>
        <h1 style={{ marginBottom: 8 }}>{PLAYBOOK_ROLES[role].label} Profile</h1>
        <p style={{ lineHeight: 1.6, marginBottom: 0 }}>Update the same information you entered during onboarding. Background answers stay private; public visibility is managed separately.</p>
      </header>
      {steps.map(step => {
        const stepFields = fields.filter(field => field.phase === step.phase);
        if (!stepFields.length) return null;
        return <section key={step.id} style={{ background: "#fff", borderRadius: 20, padding: 22, marginBottom: 18 }}>
          <h2 style={{ fontSize: 21, marginTop: 0 }}>{step.title}</h2>
          <p style={{ color: "#475569", fontSize: 14 }}>{step.body}</p>
          {stepFields.map(field => {
            const value = answers[field.key];
            const current = Array.isArray(value) ? value : [];
            return <div key={field.key} style={{ margin: "20px 0" }}>
              <label htmlFor={field.key} style={labelStyle}>{field.label}</label>
              {field.type === "textarea"
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
