"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { supabase } from "@/lib/supabaseClient";
import {
  getOnboardingSteps,
  ALL_COLLEGE_OPTIONS,
  CAREER_OPTIONS,
  ACTIVITY_OPTIONS,
  CALIFORNIA_DISTRICTS,
  persistOnboardingProfile,
} from "@/lib/onboarding";
import { getPathway, normalizeRole } from "@/lib/onboarding/pathwayMap";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import {
  page,
  hero,
  heroText,
  heroImageWrap,
  heroImage,
  eyebrow,
  heroTitle,
  heroBody,
  progressWrap,
  stepPill,
  card,
  formEyebrow,
  formTitle,
  formBody,
  fields,
  label,
  input,
  actions,
  primary,
  secondary,
  group,
  sectionLabel,
  miniGrid,
  chipGrid,
  chip,
  avatarRow,
  avatar,
  avatarImg,
  uploadButton,
  overlay,
  overlayTitle,
  overlayText,
  confetti,
  activityCategoryGrid,
  activityCategory,
  addRow,
  summaryList,
  summaryItem,
  removeButton,
  safetyBox,
  agreeRow
} from "@/components/onboarding/onboardingStyles";
import FieldRenderer from "@/components/onboarding/FieldRenderer";
import { useOnboardingAutosave } from "@/components/onboarding/useOnboardingAutosave";
import { validateAcademicPath } from "@/lib/education";

export default function StartPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Loading Start Here...</main>}>
      <StartContent />
    </Suspense>
  );
}

function StartContent() {
  const params = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<Record<string, any>>({});
  const [customColleges, setCustomColleges] = useState<string[]>([]);
  const [customCareers, setCustomCareers] = useState<string[]>([]);
  const [customActivities, setCustomActivities] = useState<string[]>([]);
  const [customDistricts, setCustomDistricts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

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
      const { data: u } = await supabase.auth.getUser();

      if (!u.user) {
        window.location.href = "/login";
        return;
      }

      setUser(u.user);

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.user.id)
        .maybeSingle();

      const safeProfile = {
        ...(p || {}),
        id: u.user.id,
        email: u.user.email,
        role,
        profile_mode: role,
      };

      const onboarding = safeProfile.onboarding_data || {};
      setProfile(safeProfile);
      setStepIndex(Number(onboarding.onboarding_step_index || 0));

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
        invite_supporters: onboarding.invite_supporters || Array(5).fill(""),
        ...onboarding,
      });

      const { data: options } = await supabase
        .from("onboarding_options")
        .select("type,value")
        .in("type", [
          "college",
          "career",
          "major",
          "activity",
          "district",
        ]);

      setCustomColleges((options || []).filter((o) => o.type === "college").map((o) => o.value));
      setCustomCareers((options || []).filter((o) => o.type === "career").map((o) => o.value));
      setCustomActivities((options || []).filter((o) => o.type === "activity").map((o) => o.value));
      setCustomDistricts(
        (options || [])
          .filter((o) => o.type === "district")
          .map((o) => o.value)
      );

      setHydrated(true);
    }

    load();
  }, []);

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));

    setFieldErrors((prev) => {
      if (!prev[key]) return prev;

      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  useOnboardingAutosave({
    enabled:
      hydrated &&
      Boolean(user?.id) &&
      Boolean(profile?.id),
    userId: user?.id,
    stepIndex,
    form,
    isBusy: saving || creating || created,
    delayMs: 2500,
    onSave: async () => {
      await persist(false);
    },
  });

  async function saveCustomOption(
  type: "school" | "college" | "career" | "major" | "activity" | "district",
  value?: string
) {
    const clean = String(value || "").trim();
    if (!clean || !user?.id) return;

    const known =
      type === "college"
        ? collegeOptions.some((x) => x.toLowerCase() === clean.toLowerCase())
        : careerOptions.some((x) => x.toLowerCase() === clean.toLowerCase());

    if (known) return;

    // Prevent duplicate custom options already stored in Supabase.
    const { data: existingOptions, error: lookupError } =
      await supabase
        .from("onboarding_options")
        .select("id")
        .eq("type", type)
        .ilike("value", clean)
        .limit(1);

    if (lookupError) {
      console.error(
        "Could not check onboarding option:",
        lookupError.message
      );
      return;
    }

    if (existingOptions?.length) {
      return;
    }

    const { error: insertError } = await supabase
      .from("onboarding_options")
      .insert({
        type,
        value: clean,
        created_by: user.id,
      });

    // A duplicate may still occur if two saves happen simultaneously.
    // Ignore only the PostgreSQL duplicate-key error.
    if (insertError && insertError.code !== "23505") {
      console.error(
        "Could not save onboarding option:",
        insertError.message
      );
    }

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

  async function persist(complete = false, override: Record<string, any> = {}) {
    if (!user?.id) return;

    const nextForm = { ...form, ...override };

    const topSchools = Array.isArray(nextForm.top_schools)
      ? nextForm.top_schools.filter(Boolean)
      : [];

    const activities = Array.isArray(nextForm.activities)
      ? nextForm.activities.filter(Boolean)
      : [];

    const inviteSupporters = Array.isArray(nextForm.invite_supporters)
      ? nextForm.invite_supporters.filter(Boolean)
      : [];

    await Promise.all([
      ...topSchools.map((school: string) => saveCustomOption("college", school)),
      saveCustomOption("college", nextForm.dream_school),
      saveCustomOption("career", nextForm.ideal_profession),
      saveCustomOption(
        "major",
        nextForm.intended_major ||
          nextForm.target_major
      ),
      saveCustomOption("district", nextForm.school_district),
      ...(Array.isArray(nextForm.activities)
        ? nextForm.activities
            .map((activity: any) =>
              typeof activity === "string"
                ? activity
                : activity?.activity
            )
            .filter(Boolean)
            .map((activityName: string) =>
              saveCustomOption("activity", activityName)
            )
        : []),
    ]);

    const result = await persistOnboardingProfile({
      userId: user.id,
      email: user.email,
      role,
      form: {
        ...nextForm,
        top_schools: topSchools,
        activities,
        invite_supporters: inviteSupporters,
      },
      existingOnboardingData:
        profile?.onboarding_data || {},
      stepIndex,
      complete,
    });

    if (result.error || !result.profile) {
      console.error(
        "Onboarding persistence failed:",
        result.error?.message
      );

      alert(
        result.error?.message ||
          "We could not save your profile. Please try again."
      );

      throw result.error || new Error("Profile save failed.");
    }

    setForm((prev) => ({
      ...prev,
      ...result.normalizedForm,
    }));

    setProfile(result.profile);
  }

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
    if (step.id === "scholar-academic") {
      const validation = validateAcademicPath(form);

      if (!validation.valid) {
        setFieldErrors(validation.errors);

        const firstErrorKey = Object.keys(validation.errors)[0];

        window.requestAnimationFrame(() => {
          document
            .querySelector(`[data-field-key="${firstErrorKey}"]`)
            ?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
        });

        return;
      }
    }

    setFieldErrors({});
    setSaving(true);

    try {
      await persist(false);

    if (step.id === "network") {
      await sendInvites();
    }

    if (isLast && !form.community_safety_agreed) {
      alert("Please read and agree to The Playbook Community Safety Agreement before creating your profile.");
      setSaving(false);
      return;
    }

    if (isLast) {
      setCreating(true);
      await persist(true);
      setCreating(false);
      setCreated(true);
      setTimeout(() => {
        window.location.href = getPathway(role).osRoute;
      }, 15000);
      return;
    }

      setStepIndex((i) => i + 1);
    } catch (error) {
      console.error("Onboarding progression failed:", error);
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <main style={{ padding: 40 }}>Loading...</main>;

  return (
    <main style={page}>
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
            Your answers autosave and feed your dashboard, private profile, and public-facing profile.
          </p>
        </div>

        <div style={heroImageWrap}>
          <img
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
                {form.avatar_url ? <img src={form.avatar_url} style={avatarImg} alt="" /> : "📸"}
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
              error={fieldErrors[field.key]}
              onChange={(value: any) => update(field.key, value)}
              onBlur={(value: string) => {
                if (field.type === "school") {
                  saveCustomOption("school", value);
                }

                if (field.type === "college") {
                  saveCustomOption("college", value);
                }

                if (field.type === "career") {
                  saveCustomOption("career", value);
                }

                if (field.type === "major") {
                  saveCustomOption("major", value);
                }

                if (field.type === "district") {
                  saveCustomOption("district", value);
                }
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

          {step.id !== "scholar-academic" && (
            <button
              style={secondary}
              onClick={() => next(true)}
              disabled={saving}
            >
              Skip for now
            </button>
          )}

          <button style={primary} onClick={() => next(false)} disabled={saving}>
            {saving ? "Saving..." : isLast ? "Finish + Create Profile" : "Next Play →"}
          </button>
        </div>
      </section>
    </main>
  );
}
