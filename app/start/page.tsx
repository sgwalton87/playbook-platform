"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { supabase } from "@/lib/supabaseClient";
import { ALL_COLLEGE_OPTIONS, CAREER_OPTIONS, ACTIVITY_OPTIONS, CALIFORNIA_DISTRICTS, assertRoleOnboardingCompletionSupported, createInitialOnboardingData, getOnboardingCompletionDestination, getOnboardingSteps, mapOnboardingToProfilePayload, validateOnboardingStep } from "@/lib/onboarding";
import { normalizeRole } from "@/lib/onboarding/pathwayMap";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";

export default function StartPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Loading Start Here...</main>}>
      <StartContent />
    </Suspense>
  );
}

function StartContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [user, setUser] = useState<LegacyValue>(null);
  const [profile, setProfile] = useState<LegacyValue>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<Record<string, LegacyValue>>({});
  const [customColleges, setCustomColleges] = useState<string[]>([]);
  const [customCareers, setCustomCareers] = useState<string[]>([]);
  const [, setCustomActivities] = useState<string[]>([]);
  const [, setCustomDistricts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const onboardingLoadedRef = useRef(false);
  const lastSavedFormRef = useRef("");
  const persistRef = useRef<LegacyValue>(null);

  const role = normalizeRole(
    params.get("first") === "1"
      ? params.get("role") || profile?.profile_mode || profile?.role
      : profile?.profile_mode || profile?.role || params.get("role")
  );
  const steps = getOnboardingSteps(role);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const collegeOptions = useMemo(
    () => Array.from(new Set([...ALL_COLLEGE_OPTIONS, ...customColleges])).sort(),
    [customColleges]
  );

  const careerOptions = useMemo(
    () => Array.from(new Set([...CAREER_OPTIONS, ...customCareers])).sort(),
    [customCareers]
  );

  useEffect(() => {
    async function load() {
      onboardingLoadedRef.current = false;
      const { data: u } = await supabase.auth.getUser();

      if (!u.user) {
        router.replace("/login");
        return;
      }

      setUser(u.user);

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.user.id)
        .maybeSingle();

      const safeProfile = p || {
        id: u.user.id,
        email: u.user.email,
        role,
        profile_mode: role,
      };

      const onboarding = safeProfile.onboarding_data || {};
      setProfile(safeProfile);
      setStepIndex(Number(onboarding.onboarding_step_index || 0));

      const initialForm = createInitialOnboardingData(safeProfile);
      lastSavedFormRef.current = JSON.stringify(initialForm);
      setForm(initialForm);
      onboardingLoadedRef.current = true;

      const { data: options } = await supabase
        .from("onboarding_options")
        .select("type,value")
        .in("type", ["college", "career", "activity", "district"]);

      setCustomColleges((options || []).filter((o) => o.type === "college").map((o) => o.value));
      setCustomCareers((options || []).filter((o) => o.type === "career").map((o) => o.value));
    }

    load();
  }, [role, router]);

  function update(key: string, value: LegacyValue) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveCustomOption(type: "college" | "career" | "activity" | "district", value?: string) {
    const clean = String(value || "").trim();
    if (!clean || !user?.id) return;

    const known =
      type === "college"
        ? collegeOptions.some((x) => x.toLowerCase() === clean.toLowerCase())
        : careerOptions.some((x) => x.toLowerCase() === clean.toLowerCase());

    if (known) return;

    await supabase.from("onboarding_options").insert({
      type,
      value: clean,
      created_by: user.id,
    });

    if (type === "college") setCustomColleges((prev) => [...prev, clean]);
    if (type === "career") setCustomCareers((prev) => [...prev, clean]);
    if (type === "activity") setCustomActivities((prev) => [...prev, clean]);
    if (type === "district") setCustomDistricts((prev) => [...prev, clean]);
  }

  async function uploadAvatar(file: File) {
    if (!user?.id) return;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      alert(error.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    update("avatar_url", data.publicUrl);
    try {
      await persist(false, { avatar_url: data.publicUrl });
      lastSavedFormRef.current = JSON.stringify({ ...form, avatar_url: data.publicUrl });
      setAutosaveStatus("saved");
    } catch (saveError) {
      setAutosaveStatus("error");
      setJourneyError(saveError instanceof Error ? saveError.message : "Your profile photo could not be linked to your Scholar Record.");
    }
  }

  async function persist(
    complete = false,
    override: Record<string, LegacyValue> = {},
    prepareRoleRecord = complete,
    sourceForm: Record<string, LegacyValue> | null = null
  ) {
    if (!user?.id) throw new Error("Your profile is not ready to save yet.");

    const nextForm = { ...(sourceForm || form), ...override };

    const topSchools = Array.isArray(nextForm.top_schools)
      ? nextForm.top_schools.filter(Boolean)
      : [];

    await Promise.all([
      ...topSchools.map((school: string) => saveCustomOption("college", school)),
      saveCustomOption("college", nextForm.dream_school),
      saveCustomOption("career", nextForm.ideal_profession),
      saveCustomOption("district", nextForm.school_district),
      ...(Array.isArray(nextForm.activities) ? nextForm.activities.map((a: string) => saveCustomOption("activity", a)) : []),
    ]);

    const payload = mapOnboardingToProfilePayload({
      userId: user.id,
      role,
      data: nextForm,
      stepIndex: Number(nextForm.onboarding_step_index ?? stepIndex),
      complete,
    });

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (profileError) {
      throw new Error(`Your onboarding answers could not be saved. ${profileError.message}`);
    }

    if (prepareRoleRecord && role === "scholar-athlete") {
      const graduationYear = Number(nextForm.graduation_year);
      const governingPath = String(nextForm.target_division || "undecided")
        .toLowerCase()
        .replaceAll(" ", "_")
        .replace("ncaa_", "ncaa_");
      const { error: athleteError } = await supabase.from("athlete_profiles").upsert({
        scholar_id: user.id,
        sport: String(nextForm.primary_sport || "Not specified"),
        position: nextForm.position || null,
        graduation_year: Number.isInteger(graduationYear) ? graduationYear : new Date().getFullYear() + 1,
        governing_path: ["ncaa_d1", "ncaa_d2", "ncaa_d3", "naia", "juco"].includes(governingPath) ? governingPath : "undecided",
        highlight_url: nextForm.highlight_link || null,
        target_schools: topSchools,
        updated_at: new Date().toISOString(),
      }, { onConflict: "scholar_id" });
      if (athleteError) throw new Error("Your Scholar-Athlete profile could not be connected. Your onboarding answers remain saved.");
    }

    setProfile((prev: LegacyValue) => ({ ...prev, ...payload }));
  }

  useEffect(() => {
    persistRef.current = persist;
  });

  useEffect(() => {
    if (!onboardingLoadedRef.current || !user?.id || creating || created) return;

    const serialized = JSON.stringify(form);
    if (serialized === lastSavedFormRef.current) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    const snapshot = { ...form };

    autosaveTimerRef.current = setTimeout(() => {
      autosaveQueueRef.current = autosaveQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          setAutosaveStatus("saving");
          try {
            await persistRef.current?.(false, { onboarding_step_index: stepIndex }, false, snapshot);
            lastSavedFormRef.current = serialized;
            setAutosaveStatus("saved");
          } catch (error) {
            setAutosaveStatus("error");
            setJourneyError(error instanceof Error ? error.message : "Your onboarding answers could not be autosaved.");
          }
        });
    }, 800);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [form, user?.id, stepIndex, creating, created]);

  async function sendInvites() {
    const emails = Array.isArray(form.invite_supporters)
      ? form.invite_supporters.filter(Boolean)
      : [];

    await Promise.all(
      emails.map((email: string) =>
        fetch("/api/invitations/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            role: "supporter",
            scholarId: user?.id,
            message: "I’m building my Playbook and would like you to support my journey.",
          }),
        }).catch(() => null)
      )
    );
  }

  async function next(skip = false) {
    setSaving(true);
    setJourneyError(null);

    try {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      await autosaveQueueRef.current.catch(() => undefined);

      const validationErrors = validateOnboardingStep(step, form);
      if (isLast && validationErrors.length > 0) {
        alert(validationErrors[0]);
        return;
      }

      const stepIncrement = skip ? 1 : 1;
      await persist(false, {
        onboarding_step_index: Math.min(stepIndex + stepIncrement, steps.length - 1),
      });
      lastSavedFormRef.current = JSON.stringify(form);
      setAutosaveStatus("saved");

      if (step.id === "network") {
        await sendInvites();
      }

      if (isLast) {
        setCreating(true);
        assertRoleOnboardingCompletionSupported(role);
        // Persist final evidence and any role-specific prerequisite record, but
        // leave onboarding completion false until the governed server adapter succeeds.
        await persist(false, {}, true);
        const destination = getOnboardingCompletionDestination(role);
        const response = await fetch(`/api/pbos/onboarding/${encodeURIComponent(role)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: String(form.full_name || "Scholar"),
            goalTitle: String(form.dream_school || form.ideal_profession || "Complete my scholar journey"),
          }),
        });
        const result = await response.json() as { error?: string; destination?: string };
        if (!response.ok) throw new Error(result.error || "PBOS role onboarding could not be completed.");
        if (result.destination && result.destination !== destination) {
          throw new Error("PBOS role onboarding destination does not match the canonical client contract.");
        }
        setCreating(false);
        setCreated(true);
        setTimeout(() => { router.replace(result.destination || destination); }, 15000);
        return;
      }

      setStepIndex((i) => i + 1);
    } catch (error) {
      setCreating(false);
      setAutosaveStatus("error");
      setJourneyError(error instanceof Error ? error.message : "Your onboarding progress could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <main data-visual-canon="PGDS-001" style={{ minHeight:"100vh",padding:40,background:"#06172d",color:"#fff" }}>Preparing your Playbook…</main>;

  return (
    <main style={page} data-visual-canon="PGDS-001">
      {journeyError && <div role="alert" aria-live="assertive" style={{ margin: 16, padding: 16, border: "1px solid #B91C1C", borderRadius: 12, color: "#B91C1C" }}>{journeyError}</div>}
      {creating && (
        <div style={overlay}>
          <div style={confetti}>✨ 🧭 📚</div>
          <h1 style={overlayTitle}>Hold tight, {form.full_name || "Scholar"}.</h1>
          <p style={overlayText}>We are creating your profile...</p>
        </div>
      )}

      {created && (
        <div style={overlay}>
          <div style={confetti}>🎉 ✨ 🏆 🎓 🧭 🎉<br />🎉 ✨ 🏆 🎓 🧭 🎉<br />🎉 ✨ 🏆 🎓 🧭 🎉</div>
          <h1 style={overlayTitle}>Congratulations, {form.full_name || "Scholar"}!</h1>
          <p style={overlayText}>Your Playbook profile is ready. Taking you to your dashboard...</p>
        </div>
      )}

      <section style={hero}>
        <div style={heroText}>
          <PlaybookLogo size={108} priority />
          <p style={eyebrow}>Start Here · {role}</p>
          <h1 style={heroTitle}>Build the record that opens your next door.</h1>
          <p style={heroBody}>
            Your answers autosave to your private Scholar Record. You choose separately whether to publish a public profile.
          </p>
          <p role="status" aria-live="polite" style={{ ...heroBody, fontSize: 13, marginTop: 8 }}>
            {autosaveStatus === "saving" && "Saving your progress…"}
            {autosaveStatus === "saved" && "✓ Progress saved"}
            {autosaveStatus === "error" && "Save failed — your answers are still on this screen."}
          </p>
        </div>

        <div style={heroImageWrap}>
          <Image unoptimized width={1200} height={800}
            src={role === "scholar-athlete" ? PLAYBOOK_HERO_VISUALS.athlete.image : PLAYBOOK_HERO_VISUALS.signup.image}
            alt="Scholars building their next play"
            style={heroImage}
          />
        </div>
      </section>

      <section style={progressWrap}>
        {steps.map((item, index) => (
          <div key={item.id} style={stepPill(index <= stepIndex)}>
            <span>{index + 1}</span>
            <strong>{item.title.split(".")[0]}</strong>
          </div>
        ))}
      </section>

      <section style={card}>
        <p style={formEyebrow}>{step.id}</p>
        <h2 style={formTitle}>{step.title}</h2>
        <p style={formBody}>{step.body}</p>

        <datalist id="college-options">
          {collegeOptions.map((name) => <option key={name} value={name} />)}
        </datalist>

        <datalist id="career-options">
          {careerOptions.map((name) => <option key={name} value={name} />)}
        </datalist>

        <datalist id="district-options">
          {CALIFORNIA_DISTRICTS.map((name) => <option key={name} value={name} />)}
        </datalist>

        <datalist id="activity-options">
          {ACTIVITY_OPTIONS.map((name) => <option key={name} value={name} />)}
        </datalist>

        <div style={fields}>
          {step.id === "identity" && (
            <div style={avatarRow}>
              <div style={avatar}>
                {form.avatar_url ? <Image unoptimized width={1200} height={800} src={form.avatar_url} style={avatarImg} alt="" /> : "📸"}
              </div>
              <label style={uploadButton}>
                Upload profile photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAvatar(file);
                  }}
                />
              </label>
            </div>
          )}

          {step.fields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={form[field.key]}
              onChange={(value: LegacyValue) => update(field.key, value)}
              onBlur={(value: string) => {
                if (field.type === "college") saveCustomOption("college", value);
                if (field.type === "career") saveCustomOption("career", value);
              }}
            />
          ))}
        </div>

        <div style={actions}>
          {stepIndex > 0 && (
            <button style={secondary} onClick={() => setStepIndex((i) => i - 1)}>
              Back
            </button>
          )}

          <button style={secondary} onClick={() => next(true)} disabled={saving}>
            Skip for now
          </button>

          <button style={primary} onClick={() => next(false)} disabled={saving}>
            {saving ? "Saving..." : isLast ? "Finish + Create Profile" : "Next Play →"}
          </button>
        </div>
      </section>
    </main>
  );
}

function FieldRenderer({ field, value, onChange, onBlur }: LegacyValue) {
  const [draft, setDraft] = useState({
    activity: "",
    category: "",
    description: "",
    hours: "",
    supervisor: "",
  });
  if (field.type === "textarea") {
    return (
      <label style={label}>
        {field.label}
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={{ ...input, minHeight: 120 }}
        />
      </label>
    );
  }


  if (field.type === "safety-agreement") {
    return (
      <div style={group}>
        <div style={safetyBox}>
          <h3 style={{ marginTop: 0 }}>The Playbook Community Safety Agreement</h3>
          <p>The Playbook is a community built for learning, opportunity, growth, mentorship, and connection. Every member deserves to participate without being bullied, harassed, threatened, humiliated, excluded, or targeted.</p>
          <p>By joining The Playbook, I agree that I will not participate in bullying, harassment, intimidation, discrimination, threats, unwanted sexual conduct, cyberbullying, coordinated targeting, or retaliation in any form.</p>
          <p>This applies to posts, comments, messages, groups, events, courses, mentoring relationships, athletic spaces, and other interactions connected to The Playbook.</p>
          <p>Harmful conduct may include repeated unwanted contact, spreading harmful rumors, sharing private or embarrassing information without permission, encouraging others to target someone, discriminatory harassment, threatening language, or using Playbook features to isolate, shame, or intimidate another person.</p>
          <p>I agree to treat other community members with dignity, report serious safety concerns through the appropriate reporting tools, and cooperate with reasonable safety reviews when necessary.</p>
          <p>I understand that violating this agreement may result in content removal, feature restrictions, temporary suspension, removal from a program or event, or account termination, depending on the circumstances and severity of the conduct.</p>
        </div>

        <label style={agreeRow}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <label style={label}>
        {field.label}
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={input}
        >
          <option value="">Choose one...</option>
          {(field.options || []).map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "multi-select") {
    const arr = Array.isArray(value) ? value : [];

    return (
      <div style={group}>
        <div style={sectionLabel}>{field.label}</div>
        <div style={chipGrid}>
          {(field.options || []).map((option: string) => {
            const active = arr.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  onChange(
                    active
                      ? arr.filter((x: string) => x !== option)
                      : [...arr, option]
                  )
                }
                style={chip(active)}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "college" || field.type === "career" || field.type === "district") {
    const list =
      field.type === "college"
        ? "college-options"
        : field.type === "career"
          ? "career-options"
          : "district-options";

    return (
      <label style={label}>
        {field.label}
        <input
          list={list}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          placeholder={field.placeholder}
          style={input}
        />
      </label>
    );
  }

  if (field.type === "activity-list") {
    const arr = Array.isArray(value) ? value : [];
    function addActivity() {
      if (!draft.activity.trim()) return;
      onChange([...arr, draft]);
      onBlur?.(draft.activity);
      setDraft({ activity: "", category: "", description: "", hours: "", supervisor: "" });
    }

    return (
      <div style={group}>
        <div style={sectionLabel}>{field.label}</div>

        <div style={miniGrid}>
          <label style={label}>
            Activity
            <input
              list="activity-options"
              value={draft.activity}
              onChange={(e) => setDraft({ ...draft, activity: e.target.value })}
              placeholder="Basketball, robotics, job, volunteering..."
              style={input}
            />
          </label>

          <label style={label}>
            Category
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              style={input}
            >
              <option value="">Choose category...</option>
              {["Sports","Leadership","Arts","Service","Work","STEM","Faith/Community","Family responsibilities","Other"].map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </label>

          <label style={label}>
            Hours
            <input
              value={draft.hours}
              onChange={(e) => setDraft({ ...draft, hours: e.target.value })}
              placeholder="ex: 25"
              style={input}
            />
          </label>

          <label style={label}>
            Mentor / Supervisor
            <input
              value={draft.supervisor}
              onChange={(e) => setDraft({ ...draft, supervisor: e.target.value })}
              placeholder="Coach, teacher, manager..."
              style={input}
            />
          </label>
        </div>

        <label style={label}>
          Description
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="What did you do? What did you learn?"
            style={{ ...input, minHeight: 90 }}
          />
        </label>

        <button type="button" style={primary} onClick={addActivity}>
          Add Entry
        </button>

        <div style={summaryList}>
          {arr.length === 0 ? (
            <p style={{ color: "#64748B", margin: 0 }}>No activity entries added yet.</p>
          ) : (
            arr.map((item: LegacyValue, i: number) => (
              <div key={`${item.activity}-${i}`} style={summaryItem}>
                <div>
                  <strong>{item.activity}</strong>
                  <div style={{ color: "#64748B", fontSize: 13 }}>
                    {item.category || "Uncategorized"} · {item.hours || "0"} hours · {item.supervisor || "No supervisor listed"}
                  </div>
                  {item.description && <p style={{ margin: "6px 0 0", color: "#475569" }}>{item.description}</p>}
                </div>
                <button
                  type="button"
                  style={removeButton}
                  onClick={() => onChange(arr.filter((_: LegacyValue, index: number) => index !== i))}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (field.type === "college-list" || field.type === "invite-list") {
    const length = field.type === "college-list" ? 10 : 5;
    const list = field.type === "college-list" ? "college-options" : undefined;
    const arr = Array.isArray(value) ? value : Array(length).fill("");

    return (
      <div style={group}>
        <div style={sectionLabel}>{field.label}</div>
        <div style={miniGrid}>
          {Array.from({ length }).map((_, i) => (
            <input
              key={i}
              list={list}
              type={field.type === "invite-list" ? "email" : "text"}
              value={arr[i] || ""}
              onChange={(e) => {
                const next = [...arr];
                next[i] = e.target.value;
                onChange(next);
              }}
              onBlur={(e) => {
                if (field.type === "college-list") onBlur?.(e.target.value);
              }}
              placeholder={`${i + 1}. ${field.placeholder}`}
              style={input}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <label style={label}>
      {field.label}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={input}
      />
    </label>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "radial-gradient(circle at 82% 10%,rgba(255,91,31,.18),transparent 26%),linear-gradient(135deg,#06172D,#081D38 58%,#031023)", color: "#FFFFFF", padding: 24 };
const hero: React.CSSProperties = { maxWidth: 1280, margin: "0 auto 22px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", background: "#0F172A", borderRadius: 34, overflow: "hidden" };
const heroText: React.CSSProperties = { padding: "clamp(26px,4vw,52px)", display: "flex", flexDirection: "column", justifyContent: "center" };
const heroImageWrap: React.CSSProperties = { minHeight: 330 };
const heroImage: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const eyebrow: React.CSSProperties = { marginTop: 18, fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase", color: "#F97316" };
const heroTitle: React.CSSProperties = { fontFamily: "'Anton', sans-serif", fontSize: "clamp(38px,5.5vw,68px)", lineHeight: .92, color: "#F8F7F4", textTransform: "uppercase", margin: "10px 0 18px" };
const heroBody: React.CSSProperties = { fontSize: 19, lineHeight: 1.45, color: "rgba(248,247,244,.76)", fontWeight: 700 };
const progressWrap: React.CSSProperties = { maxWidth: 1280, margin: "0 auto 22px", display: "flex", gap: 10, overflowX: "auto" };
const stepPill = (active: boolean): React.CSSProperties => ({ border: active ? "1px solid #F97316" : "1px solid #E2E8F0", background: active ? "#FFF7ED" : "#FFFFFF", borderRadius: 999, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 });
const card: React.CSSProperties = { maxWidth: 920, margin: "0 auto", background: "rgba(4,18,39,.92)", border: "1px solid rgba(255,255,255,.16)", borderRadius: "28px 8px 28px 8px", padding: "clamp(28px,5vw,58px)", boxShadow: "0 30px 80px rgba(0,0,0,.3)" };
const formEyebrow: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase", color: "#F97316", margin: 0 };
const formTitle: React.CSSProperties = { fontSize: "clamp(34px,5vw,58px)", lineHeight: 1, margin: "8px 0" };
const formBody: React.CSSProperties = { fontSize: 19, color: "#B8C8DA", lineHeight: 1.5 };
const fields: React.CSSProperties = { display: "grid", gap: 16, marginTop: 18 };
const label: React.CSSProperties = { display: "grid", gap: 8, fontWeight: 900 };
const input: React.CSSProperties = { border: "1px solid rgba(255,255,255,.22)", borderRadius: 14, padding: "15px 18px", fontSize: 18, width: "100%", background:"rgba(255,255,255,.08)", color:"#FFFFFF" };
const actions: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 };
const primary: React.CSSProperties = { border: "none", borderRadius: 999, background: "#F97316", color: "#FFFFFF", padding: "15px 24px", fontWeight: 950, cursor: "pointer" };
const secondary: React.CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 999, background: "#FFFFFF", color: "#0F172A", padding: "15px 22px", fontWeight: 950, cursor: "pointer" };
const group: React.CSSProperties = { display: "grid", gap: 10 };
const sectionLabel: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".14em", color: "#64748B", textTransform: "uppercase" };
const miniGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 };
const chipGrid: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8 };
const chip = (active: boolean): React.CSSProperties => ({ border: active ? "1px solid #F97316" : "1px solid #CBD5E1", background: active ? "#FFF7ED" : "#FFFFFF", color: active ? "#F97316" : "#0F172A", borderRadius: 999, padding: "10px 14px", fontWeight: 900, cursor: "pointer" });
const avatarRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" };
const avatar: React.CSSProperties = { width: 86, height: 86, borderRadius: 999, background: "#E2E8F0", display: "grid", placeItems: "center", overflow: "hidden", fontSize: 28 };
const avatarImg: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const uploadButton: React.CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 999, padding: "12px 18px", fontWeight: 950, cursor: "pointer" };
const overlay: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,.94)", color: "#F8F7F4", display: "grid", placeItems: "center", textAlign: "center", padding: 24 };
const overlayTitle: React.CSSProperties = { fontFamily: "'Anton', sans-serif", fontSize: "clamp(44px,7vw,86px)", textTransform: "uppercase", margin: 0 };
const overlayText: React.CSSProperties = { fontSize: 22, color: "rgba(248,247,244,.75)" };
const confetti: React.CSSProperties = { fontSize: 38, marginBottom: 16 };

const summaryList: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 10,
};

const summaryItem: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  border: "1px solid #E2E8F0",
  borderRadius: 14,
  padding: "12px 14px",
  background: "#F8FAFC",
  fontWeight: 900,
};

const removeButton: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#F97316",
  fontWeight: 950,
  cursor: "pointer",
};

const safetyBox: React.CSSProperties = {
  maxHeight: 360,
  overflowY: "auto",
  border: "1px solid #CBD5E1",
  borderRadius: 20,
  padding: 20,
  background: "#F8FAFC",
  color: "#334155",
  lineHeight: 1.55,
};

const agreeRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  fontSize: 18,
  fontWeight: 950,
  background: "#FFF7ED",
  border: "1px solid #FED7AA",
  borderRadius: 18,
  padding: 16,
};