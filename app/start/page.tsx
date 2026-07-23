"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { supabase } from "@/lib/supabaseClient";
import { getOnboardingSteps, ALL_COLLEGE_OPTIONS, CAREER_OPTIONS, ACTIVITY_OPTIONS, CALIFORNIA_DISTRICTS, getNextOnboardingStep, getOnboardingValidationError } from "@/lib/onboarding";
import { getSupportRoleOption, getSupportRoleOptions } from "@/lib/onboarding";
import { getPathway, normalizeRole } from "@/lib/onboarding/pathwayMap";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import type { User } from "@supabase/supabase-js";
import type { OnboardingField } from "@/lib/onboarding";
import type { RelationshipKind } from "@/lib/permissions";
import type { PlaybookRole } from "@/lib/roles/registry";
import OnboardingAccountGate from "@/components/onboarding/OnboardingAccountGate";
import { withTimeout } from "@/lib/async/withTimeout";
import { fireConfetti } from "@/lib/confetti";
import { INVITE_TOKEN_STORAGE_KEY } from "@/lib/invite-auth";

type OnboardingProfile = {
  id: string;
  email?: string | null;
  role?: string | null;
  profile_mode?: string | null;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  school?: string | null;
  grade?: string | null;
  dream_school?: string | null;
  ideal_profession?: string | null;
  onboarding_data?: OnboardingForm;
  [key: string]: unknown;
};

type ActivityEntry = {
  activity: string;
  category: string;
  description: string;
  hours: string;
  supervisor: string;
};

type OnboardingForm = Record<string, unknown>;

type SupportNetworkEntry = {
  role: RelationshipKind;
  invitedRole: PlaybookRole | "";
  label: string;
  customRole?: string;
  name: string;
  email: string;
};

const SUPPORT_NETWORK_DEFAULTS: SupportNetworkEntry[] = [
  { role: "parent_guardian", invitedRole: "family", label: "Parent / Guardian", name: "", email: "" },
  { role: "mentor", invitedRole: "", label: "Choose a role", name: "", email: "" },
  { role: "mentor", invitedRole: "", label: "Choose a role", name: "", email: "" },
  { role: "mentor", invitedRole: "", label: "Choose a role", name: "", email: "" },
  { role: "mentor", invitedRole: "", label: "Choose a role", name: "", email: "" },
];

const asText = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value) : "";

export default function StartPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Loading Start Here...</main>}>
      <StartContent />
    </Suspense>
  );
}

function StartContent() {
  const params = useSearchParams();
  const invitationToken = params.get("invite");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<OnboardingForm>({});
  const [customColleges, setCustomColleges] = useState<string[]>([]);
  const [customCareers, setCustomCareers] = useState<string[]>([]);
  const [customActivities, setCustomActivities] = useState<string[]>([]);
  const [customDistricts, setCustomDistricts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [authResolved, setAuthResolved] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const activityOptions = useMemo(
    () => Array.from(new Set([...ACTIVITY_OPTIONS, ...customActivities])).sort(),
    [customActivities]
  );

  const districtOptions = useMemo(
    () => Array.from(new Set([...CALIFORNIA_DISTRICTS, ...customDistricts])).sort(),
    [customDistricts]
  );

  useEffect(() => () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
  }, []);

  useEffect(() => {
    async function load() {
      const sessionData = await withTimeout(
        supabase.auth.getSession().then(({ data }) => data),
        1800,
      ).catch(() => ({ session: null }));
      const currentUser = sessionData.session?.user;

      if (!currentUser) {
        setAuthResolved(true);
        return;
      }

      setUser(currentUser);
      setAuthResolved(true);

      const profileResult = await withTimeout(
        supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle(),
        8_000,
        "Your profile is taking too long to load.",
      ).catch(() => ({ data: null }));
      const p = profileResult.data;

      const safeProfile = p || {
        id: currentUser.id,
        email: currentUser.email,
        role,
        profile_mode: role,
      };

      const onboarding = safeProfile.onboarding_data || {};
      setProfile(safeProfile);
      setStepIndex(invitationToken ? 0 : Number(onboarding.onboarding_step_index || 0));

      setForm({
        full_name: safeProfile.full_name || "",
        username: safeProfile.username || "",
        avatar_url: safeProfile.avatar_url || "",
        bio: safeProfile.bio || "",
        school: safeProfile.school || "",
        grade: safeProfile.grade || "",
        dream_school: safeProfile.dream_school || "",
        ideal_profession: safeProfile.ideal_profession || "",
        top_schools: onboarding.top_schools || Array(10).fill(""),
        activities: onboarding.activities || Array(8).fill(""),
        support_network:
          onboarding.support_network ||
          onboarding.starting_five ||
          (Array.isArray(onboarding.invite_supporters)
            ? SUPPORT_NETWORK_DEFAULTS.map((slot, index) => ({
                ...slot,
                email: asText(onboarding.invite_supporters?.[index]),
              }))
            : SUPPORT_NETWORK_DEFAULTS),
        ...onboarding,
      });

      const optionsResult = await withTimeout(
        supabase.from("onboarding_options").select("type,value").in("type", ["college", "career", "activity", "district"]),
        8_000,
      ).catch(() => ({ data: null }));
      const options = optionsResult.data;

      setCustomColleges((options || []).filter((o) => o.type === "college").map((o) => o.value));
      setCustomCareers((options || []).filter((o) => o.type === "career").map((o) => o.value));
      setCustomActivities((options || []).filter((o) => o.type === "activity").map((o) => o.value));
      setCustomDistricts((options || []).filter((o) => o.type === "district").map((o) => o.value));
    }

    load();
  }, [invitationToken, role]);

  function update(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError("");

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      const saved = await persist(false, { [key]: value });
      setSaveState(saved ? "saved" : "error");
    }, 900);
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
    await persist(false, { avatar_url: data.publicUrl });
  }

  async function persist(complete = false, override: OnboardingForm = {}) {
    if (!user?.id) return false;

    const nextForm = { ...form, ...override };

    const topSchools = Array.isArray(nextForm.top_schools)
      ? nextForm.top_schools.map(asText).filter(Boolean)
      : [];

    const activities = Array.isArray(nextForm.activities)
      ? nextForm.activities.filter(Boolean)
      : [];

    const supportNetwork = Array.isArray(nextForm.support_network)
      ? nextForm.support_network
      : SUPPORT_NETWORK_DEFAULTS;

    const canonicalOnboarding = { ...nextForm };
    delete canonicalOnboarding.starting_five;
    delete canonicalOnboarding.invite_supporters;

    await Promise.all([
      ...topSchools.map((school: string) => saveCustomOption("college", school)),
      saveCustomOption("college", asText(nextForm.dream_school)),
      saveCustomOption("career", asText(nextForm.ideal_profession)),
      saveCustomOption("district", asText(nextForm.school_district)),
      ...(Array.isArray(nextForm.activities) ? nextForm.activities.map((activity) => saveCustomOption("activity", typeof activity === "object" && activity && "activity" in activity ? asText(activity.activity) : asText(activity))) : []),
    ]);

    const payload = {
      id: user.id,
      email: user.email,
      role,
      profile_mode: role,
      requested_role: role,
      full_name: nextForm.full_name || null,
      username: nextForm.username || null,
      avatar_url: nextForm.avatar_url || null,
      bio: nextForm.bio || null,
      school: nextForm.school || null,
      grade: nextForm.grade || null,
      dream_school: nextForm.dream_school || null,
      ideal_profession: nextForm.ideal_profession || null,
      onboarding_data: {
        ...canonicalOnboarding,
        top_schools: topSchools,
        activities,
        support_network: supportNetwork,
        onboarding_step_index: nextForm.onboarding_step_index ?? stepIndex,
      },
      onboarding_completed: complete,
      onboarding_completed_at: complete ? new Date().toISOString() : null,
      public_profile_complete: Boolean(nextForm.full_name && nextForm.username && nextForm.bio),
      community_safety_agreed: Boolean(nextForm.community_safety_agreed),
      community_safety_agreed_at: nextForm.community_safety_agreed ? new Date().toISOString() : null,
      community_safety_policy_version: nextForm.community_safety_agreed ? "playbook-safety-v1" : null,
    };

    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

    if (error) {
      setFormError("We couldn’t save your progress. Check your connection and try again.");
      return false;
    }

    setProfile((prev) => prev ? ({ ...prev, ...payload } as OnboardingProfile) : prev);
    return true;
  }

  async function sendInvites() {
    const invitations = Array.isArray(form.support_network)
      ? form.support_network
          .filter((entry): entry is SupportNetworkEntry => Boolean(entry && typeof entry === "object"))
          .filter((entry) => Boolean(entry.email && entry.invitedRole))
          .map((entry) => ({
            email: asText(entry.email),
            name: asText(entry.name) || entry.customRole || entry.label,
            relationship: entry.role,
            invitedRole: entry.invitedRole,
          }))
      : [];

    const session = await withTimeout(
      supabase.auth.getSession().then(({ data }) => data.session),
      1_800,
    ).catch(() => null);

    if (!session?.access_token) return;

    await Promise.all(
      invitations.map((invite) =>
        fetch("/api/invitations/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            inviteeEmail: invite.email,
            inviteeName: invite.name,
            relationship: invite.relationship,
            invitedRole: invite.invitedRole,
            scholarName: asText(form.full_name) || "A Playbook learner",
          }),
        }).catch(() => null)
      )
    );
  }

  async function activatePendingInvitation() {
    const token =
      invitationToken ||
      window.localStorage.getItem(INVITE_TOKEN_STORAGE_KEY);

    if (!token) return { ok: true, destination: null as string | null };

    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session?.access_token || ""}`,
      },
      body: JSON.stringify({ token, status: "accepted" }),
    });
    const result = await response.json();

    if (!response.ok || result.requiresOnboarding) {
      return {
        ok: false,
        destination: null,
        error: result.error || "Complete your invited role onboarding before joining the network.",
      };
    }

    window.localStorage.removeItem(INVITE_TOKEN_STORAGE_KEY);
    return { ok: true, destination: (result.destination || null) as string | null };
  }

  async function next(skip = false) {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    const validationError = getOnboardingValidationError({ stepId: step.id, form, skip, isLast });
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setSaveState("saving");
    const saved = await persist(false, {
      onboarding_step_index: getNextOnboardingStep(stepIndex, steps.length),
    });

    if (!saved) {
      setSaving(false);
      setSaveState("error");
      return;
    }

    setSaveState("saved");

    if (step.id === "network" || step.id === "starting-five") {
      await sendInvites();
    }

    if (isLast) {
      setCreating(true);
      const completed = await persist(true);
      setCreating(false);

      if (!completed) {
        setSaving(false);
        setSaveState("error");
        return;
      }

      const activation = await activatePendingInvitation();
      if (!activation.ok) {
        setSaving(false);
        setFormError(activation.error || "We couldn’t activate your invitation yet.");
        return;
      }

      setCreated(true);
      fireConfetti();
      setTimeout(() => {
        const destination = activation.destination || getPathway(role).osRoute;
        window.location.href = `/tutorial?role=${encodeURIComponent(role)}&destination=${encodeURIComponent(destination)}`;
      }, 2600);
      return;
    }

    setStepIndex((i) => i + 1);
    setSaving(false);
  }

  if (!authResolved) {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F8F7F4", fontWeight: 900 }}>Opening your Playbook…</main>;
  }

  if (!user) return <OnboardingAccountGate role={role} />;

  if (!profile) return <main style={{ padding: 40 }}>Loading...</main>;

  return (
    <main style={page}>
      {creating && (
        <div style={overlay}>
          <div style={confetti}>✨ 🧭 📚</div>
          <h1 style={overlayTitle}>Hold tight, {asText(form.full_name) || "Scholar"}.</h1>
          <p style={overlayText}>We are creating your profile...</p>
        </div>
      )}

      {created && (
        <div style={overlay}>
          <div style={confetti}>🎉 ✨ 🏆 🎓 🧭 🎉<br />🎉 ✨ 🏆 🎓 🧭 🎉<br />🎉 ✨ 🏆 🎓 🧭 🎉</div>
          <h1 style={overlayTitle}>Congratulations, {asText(form.full_name) || "Scholar"}!</h1>
          <p style={overlayText}>Your Playbook profile is ready. Taking you to your dashboard...</p>
        </div>
      )}

      <section style={hero}>
        <div style={heroText}>
          <PlaybookLogo size={108} priority />
          <p style={eyebrow}>Start Here · {role}</p>
          <h1 style={heroTitle}>Build the record that opens your next door.</h1>
          <p style={heroBody}>
            Your answers autosave and feed your dashboard, private profile, and public-facing profile.
          </p>
        </div>

        <div style={heroImageWrap}>
          <Image
            src={role === "scholar-athlete" ? PLAYBOOK_HERO_VISUALS.athlete.image : PLAYBOOK_HERO_VISUALS.signup.image}
            alt="Scholars building their next play"
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            style={heroImage}
          />
        </div>
      </section>

      <section style={progressWrap}>
        {steps.map((item, index) => (
          <div key={item.id} style={stepPill(index <= stepIndex)} aria-current={index === stepIndex ? "step" : undefined}>
            <span>{index + 1}</span>
            <strong>{item.title.split(".")[0]}</strong>
          </div>
        ))}
      </section>

      <section style={card}>
        <div style={statusRow} aria-live="polite">
          <span style={statusDot(saveState)} />
          <span>{saveState === "saving" ? "Saving your progress…" : saveState === "saved" ? "Progress saved" : saveState === "error" ? "Save needs attention" : "Your progress autosaves"}</span>
          <span style={stepCount}>Step {stepIndex + 1} of {steps.length}</span>
        </div>
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
          {districtOptions.map((name) => <option key={name} value={name} />)}
        </datalist>

        <datalist id="activity-options">
          {activityOptions.map((name) => <option key={name} value={name} />)}
        </datalist>

        <div style={fields}>
          {step.id === "identity" && (
            <div style={avatarRow}>
              <div style={avatar}>
                {typeof form.avatar_url === "string" && form.avatar_url ? (
                  <Image src={form.avatar_url} alt="Profile preview" fill sizes="86px" unoptimized style={avatarImg} />
                ) : "📸"}
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
              ownerRole={role}
              value={form[field.key]}
              onChange={(value) => update(field.key, value)}
              onBlur={(value: string) => {
                if (field.type === "college") saveCustomOption("college", value);
                if (field.type === "career") saveCustomOption("career", value);
              }}
            />
          ))}
        </div>

        {formError && <div role="alert" style={errorBanner}>{formError}</div>}

        <div style={actions}>
          {stepIndex > 0 && (
            <button type="button" style={secondary} onClick={() => setStepIndex((i) => i - 1)}>
              Back
            </button>
          )}

          <button type="button" style={secondary} onClick={() => next(true)} disabled={saving}>
            Skip for now
          </button>

          <button type="button" style={primary} onClick={() => next(false)} disabled={saving}>
            {saving ? "Saving..." : isLast ? "Finish + Create Profile" : "Next Play →"}
          </button>
        </div>
      </section>
    </main>
  );
}

function FieldRenderer({
  field,
  ownerRole,
  value,
  onChange,
  onBlur,
}: {
  field: OnboardingField;
  ownerRole: PlaybookRole;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: (value: string) => void;
}) {
  const [activityDraft, setActivityDraft] = useState({
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
          value={asText(value)}
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
          value={asText(value)}
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

  if (field.type === "support-network") {
    const roleOptions = getSupportRoleOptions(ownerRole);
    const entries: SupportNetworkEntry[] = SUPPORT_NETWORK_DEFAULTS.map((slot, index) => {
      const saved = Array.isArray(value) && value[index] && typeof value[index] === "object"
        ? value[index] as Partial<SupportNetworkEntry>
        : {};
      return { ...slot, ...saved };
    });

    return (
      <div style={group}>
        <div style={startingFiveIntro}>
          <strong>{field.label.toUpperCase()}</strong>
          <span>{entries.filter((entry) => entry.email).length} of 5 supporters ready</span>
        </div>
        <div style={startingFiveGrid}>
          {entries.map((entry, index) => (
            <section key={`${entry.label}-${index}`} style={startingFiveCard}>
              <div style={startingFiveNumber}>{index + 1}</div>
              <div>
                <div style={startingFiveLabel}>{entry.label || "Choose a role"}</div>
                <div style={startingFiveHelp}>Invite a trusted adult using their personal email.</div>
              </div>
              <select
                value={entry.invitedRole}
                onChange={(event) => {
                  const selected = getSupportRoleOption(event.target.value);
                  const next = [...entries];
                  next[index] = {
                    ...entry,
                    invitedRole: (selected?.role || "") as PlaybookRole | "",
                    role: selected?.relationship || "mentor",
                    label: selected?.label || "Choose a role",
                    customRole: selected?.role === "other" ? entry.customRole || "" : "",
                  };
                  onChange(next);
                }}
                style={{ ...input, gridColumn: "1 / -1" }}
                aria-label={`Role for Starting Five member ${index + 1}`}
              >
                <option value="">Select their role…</option>
                {roleOptions.map((option) => (
                  <option key={option.role} value={option.role}>{option.label}</option>
                ))}
              </select>
              {entry.invitedRole === "other" && (
                <input
                  value={entry.customRole || ""}
                  onChange={(event) => {
                    const next = [...entries];
                    next[index] = { ...entry, customRole: event.target.value };
                    onChange(next);
                  }}
                  placeholder="Describe their role"
                  style={{ ...input, gridColumn: "1 / -1" }}
                />
              )}
              <input
                value={entry.name}
                onChange={(event) => {
                  const next = [...entries];
                  next[index] = { ...entry, name: event.target.value };
                  onChange(next);
                }}
                placeholder="Full name"
                style={{ ...input, gridColumn: "1 / -1" }}
              />
              <input
                type="email"
                value={entry.email}
                onChange={(event) => {
                  const next = [...entries];
                  next[index] = { ...entry, email: event.target.value };
                  onChange(next);
                }}
                placeholder="Email address"
                style={{ ...input, gridColumn: "1 / -1" }}
              />
            </section>
          ))}
        </div>
        <p style={startingFivePrivacy}>Invitations are private and optional. You can update your Starting Five later.</p>
      </div>
    );
  }

  if (field.type === "multi-select") {
    const arr = Array.isArray(value) ? value.map(String) : [];

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
          value={asText(value)}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          placeholder={field.placeholder}
          style={input}
        />
      </label>
    );
  }

  if (field.type === "activity-list") {
    const arr = Array.isArray(value) ? value as ActivityEntry[] : [];

    function addActivity() {
      if (!activityDraft.activity.trim()) return;
      onChange([...arr, activityDraft]);
      onBlur?.(activityDraft.activity);
      setActivityDraft({ activity: "", category: "", description: "", hours: "", supervisor: "" });
    }

    return (
      <div style={group}>
        <div style={sectionLabel}>{field.label}</div>

        <div style={miniGrid}>
          <label style={label}>
            Activity
            <input
              list="activity-options"
              value={activityDraft.activity}
              onChange={(e) => setActivityDraft({ ...activityDraft, activity: e.target.value })}
              placeholder="Basketball, robotics, job, volunteering..."
              style={input}
            />
          </label>

          <label style={label}>
            Category
            <select
              value={activityDraft.category}
              onChange={(e) => setActivityDraft({ ...activityDraft, category: e.target.value })}
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
              value={activityDraft.hours}
              onChange={(e) => setActivityDraft({ ...activityDraft, hours: e.target.value })}
              placeholder="ex: 25"
              style={input}
            />
          </label>

          <label style={label}>
            Mentor / Supervisor
            <input
              value={activityDraft.supervisor}
              onChange={(e) => setActivityDraft({ ...activityDraft, supervisor: e.target.value })}
              placeholder="Coach, teacher, manager..."
              style={input}
            />
          </label>
        </div>

        <label style={label}>
          Description
          <textarea
            value={activityDraft.description}
            onChange={(e) => setActivityDraft({ ...activityDraft, description: e.target.value })}
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
            arr.map((item, i) => (
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
                  onClick={() => onChange(arr.filter((_, index) => index !== i))}
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
    const arr = Array.isArray(value) ? value.map(String) : Array(length).fill("");

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
        value={asText(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={input}
      />
    </label>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", color: "#0F172A", padding: 24 };
const hero: React.CSSProperties = { maxWidth: 1280, margin: "0 auto 22px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", background: "#0F172A", borderRadius: 34, overflow: "hidden" };
const heroText: React.CSSProperties = { padding: "clamp(26px,4vw,52px)", display: "flex", flexDirection: "column", justifyContent: "center" };
const heroImageWrap: React.CSSProperties = { minHeight: 330, position: "relative" };
const heroImage: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const eyebrow: React.CSSProperties = { marginTop: 18, fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase", color: "#F97316" };
const heroTitle: React.CSSProperties = { fontFamily: "'Anton', sans-serif", fontSize: "clamp(38px,5.5vw,68px)", lineHeight: .92, color: "#F8F7F4", textTransform: "uppercase", margin: "10px 0 18px" };
const heroBody: React.CSSProperties = { fontSize: 19, lineHeight: 1.45, color: "rgba(248,247,244,.76)", fontWeight: 700 };
const progressWrap: React.CSSProperties = { maxWidth: 1280, margin: "0 auto 22px", display: "flex", gap: 10, overflowX: "auto" };
const stepPill = (active: boolean): React.CSSProperties => ({ border: active ? "1px solid #F97316" : "1px solid #E2E8F0", background: active ? "#FFF7ED" : "#FFFFFF", borderRadius: 999, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 });
const card: React.CSSProperties = { maxWidth: 920, margin: "0 auto", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 30, padding: "clamp(28px,5vw,58px)", boxShadow: "0 18px 42px rgba(15,23,42,.08)" };
const formEyebrow: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase", color: "#F97316", margin: 0 };
const formTitle: React.CSSProperties = { fontSize: "clamp(34px,5vw,58px)", lineHeight: 1, margin: "8px 0" };
const formBody: React.CSSProperties = { fontSize: 19, color: "#64748B", lineHeight: 1.5 };
const statusRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, marginBottom: 22, color: "#64748B", fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase" };
const statusDot = (state: "idle" | "saving" | "saved" | "error"): React.CSSProperties => ({ width: 8, height: 8, borderRadius: 999, background: state === "error" ? "#DC2626" : state === "saved" ? "#10B981" : state === "saving" ? "#F59E0B" : "#94A3B8", boxShadow: `0 0 0 4px ${state === "error" ? "#FEE2E2" : state === "saved" ? "#D1FAE5" : state === "saving" ? "#FEF3C7" : "#F1F5F9"}` });
const stepCount: React.CSSProperties = { marginLeft: "auto", color: "#0F172A" };
const errorBanner: React.CSSProperties = { marginTop: 18, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B", borderRadius: 16, padding: "13px 16px", fontWeight: 800, lineHeight: 1.45 };
const fields: React.CSSProperties = { display: "grid", gap: 16, marginTop: 18 };
const label: React.CSSProperties = { display: "grid", gap: 8, fontWeight: 900 };
const input: React.CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 16, padding: "15px 18px", fontSize: 18, width: "100%" };
const actions: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 };
const primary: React.CSSProperties = { border: "none", borderRadius: 999, background: "#F97316", color: "#FFFFFF", padding: "15px 24px", fontWeight: 950, cursor: "pointer" };
const secondary: React.CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 999, background: "#FFFFFF", color: "#0F172A", padding: "15px 22px", fontWeight: 950, cursor: "pointer" };
const group: React.CSSProperties = { display: "grid", gap: 10 };
const sectionLabel: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".14em", color: "#64748B", textTransform: "uppercase" };
const miniGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 };
const startingFiveIntro: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "#F97316", fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" };
const startingFiveGrid: React.CSSProperties = { display: "grid", gap: 12 };
const startingFiveCard: React.CSSProperties = { display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", alignItems: "center", gap: 14, border: "1px solid #E2E8F0", borderRadius: 20, padding: 16, background: "#FFFDF8" };
const startingFiveNumber: React.CSSProperties = { width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 999, background: "#0F172A", color: "#FFFFFF", fontWeight: 950 };
const startingFiveLabel: React.CSSProperties = { fontSize: 16, fontWeight: 950 };
const startingFiveHelp: React.CSSProperties = { marginTop: 4, color: "#64748B", fontSize: 12, lineHeight: 1.4 };
const startingFivePrivacy: React.CSSProperties = { margin: "4px 0 0", color: "#64748B", fontSize: 12, lineHeight: 1.5 };
const chipGrid: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8 };
const chip = (active: boolean): React.CSSProperties => ({ border: active ? "1px solid #F97316" : "1px solid #CBD5E1", background: active ? "#FFF7ED" : "#FFFFFF", color: active ? "#F97316" : "#0F172A", borderRadius: 999, padding: "10px 14px", fontWeight: 900, cursor: "pointer" });
const avatarRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" };
const avatar: React.CSSProperties = { width: 86, height: 86, position: "relative", borderRadius: 999, background: "#E2E8F0", display: "grid", placeItems: "center", overflow: "hidden", fontSize: 28 };
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
