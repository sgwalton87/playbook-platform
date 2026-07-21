"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "interview"
  | "accepted"
  | "waitlisted"
  | "declined";

type ApplicationForm = {
  id?: string;
  status: ApplicationStatus;

  full_name: string;
  preferred_name: string;
  email: string;
  phone: string;
  age: string;
  grade_level: string;
  school_name: string;
  city: string;
  referral_organization: string;

  guardian_name: string;
  guardian_relationship: string;
  guardian_email: string;
  guardian_phone: string;

  business_name: string;
  business_description: string;
  product_or_service: string;
  target_customer: string;
  problem_solved: string;
  competitive_difference: string;
  business_stage: string;

  entrepreneurship_motivation: string;
  program_motivation: string;
  learning_goals: string;
  challenge_overcome: string;
  setback_response: string;
  weekly_commitment: string;

  funding_plan: string;
  supplies_needed: string;
  eight_week_goal: string;

  can_attend_weekly: boolean;
  can_attend_showcase: boolean;
  can_complete_assignments: boolean;
  transportation_needs: string;
  accommodation_needs: string;

  media_comfort: string;
  smartphone_access: string;
  bonus_video_path: string;

  dream_business: string;
  selection_case: string;
  additional_information: string;

  funding_agreement: boolean;
  attendance_agreement: boolean;
  assignment_agreement: boolean;
  professionalism_agreement: boolean;
  accuracy_agreement: boolean;

  applicant_signature: string;
  guardian_signature: string;
  signature_date: string;
};

const INITIAL_FORM: ApplicationForm = {
  status: "draft",

  full_name: "",
  preferred_name: "",
  email: "",
  phone: "",
  age: "",
  grade_level: "",
  school_name: "",
  city: "",
  referral_organization: "",

  guardian_name: "",
  guardian_relationship: "",
  guardian_email: "",
  guardian_phone: "",

  business_name: "",
  business_description: "",
  product_or_service: "",
  target_customer: "",
  problem_solved: "",
  competitive_difference: "",
  business_stage: "",

  entrepreneurship_motivation: "",
  program_motivation: "",
  learning_goals: "",
  challenge_overcome: "",
  setback_response: "",
  weekly_commitment: "",

  funding_plan: "",
  supplies_needed: "",
  eight_week_goal: "",

  can_attend_weekly: false,
  can_attend_showcase: false,
  can_complete_assignments: false,
  transportation_needs: "",
  accommodation_needs: "",

  media_comfort: "",
  smartphone_access: "",
  bonus_video_path: "",

  dream_business: "",
  selection_case: "",
  additional_information: "",

  funding_agreement: false,
  attendance_agreement: false,
  assignment_agreement: false,
  professionalism_agreement: false,
  accuracy_agreement: false,

  applicant_signature: "",
  guardian_signature: "",
  signature_date: new Date().toISOString().slice(0, 10),
};

const SECTIONS = [
  "Meet the Founder",
  "Parent or Guardian",
  "Your Big Idea",
  "Founder Mindset",
  "Investing Your First $100",
  "Program Commitment",
  "Tell Your Story",
  "Final Agreements",
];

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.15)",
  background: "rgba(255,255,255,.06)",
  color: "#fff8e8",
  outline: "none",
  fontSize: 15,
};

const labelStyle = {
  display: "grid",
  gap: 8,
  color: "#dce5df",
  fontWeight: 800,
  fontSize: 14,
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={labelStyle}>
      <span>
        {label}
        {required && <span style={{ color: "#f5aa30" }}> *</span>}
      </span>
      {children}
    </label>
  );
}

export default function FounderApplicationPage() {
  const router = useRouter();

  const [form, setForm] = useState<ApplicationForm>(INITIAL_FORM);
  const [section, setSection] = useState(0);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [message, setMessage] = useState("");

  const isSubmitted = form.status !== "draft";

  const progress = useMemo(
    () => Math.round(((section + 1) / SECTIONS.length) * 100),
    [section]
  );

  useEffect(() => {
    void loadApplication();
  }, []);

  async function loadApplication() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const [{ data: profile }, { data: application, error }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, school, location")
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("founder_applications")
          .select("*")
          .eq("applicant_id", user.id)
          .eq("cohort_name", "Fall 2026")
          .maybeSingle(),
      ]);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (application) {
      setForm({
        ...INITIAL_FORM,
        ...application,
        age: application.age ? String(application.age) : "",
      });
    } else {
      setForm((current) => ({
        ...current,
        full_name: profile?.full_name || "",
        school_name: profile?.school || "",
        city: profile?.location || "",
        email: user.email || "",
      }));
    }

    setLoading(false);
  }

  function update<K extends keyof ApplicationForm>(
    key: K,
    value: ApplicationForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applicationPayload(status: ApplicationStatus) {
    return {
      applicant_id: userId,
      cohort_name: "Fall 2026",
      status,

      full_name: form.full_name.trim(),
      preferred_name: form.preferred_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      age: form.age ? Number(form.age) : null,
      grade_level: form.grade_level,
      school_name: form.school_name.trim(),
      city: form.city.trim(),
      referral_organization: form.referral_organization,

      guardian_name: form.guardian_name.trim(),
      guardian_relationship: form.guardian_relationship.trim(),
      guardian_email: form.guardian_email.trim(),
      guardian_phone: form.guardian_phone.trim(),

      business_name: form.business_name.trim(),
      business_description: form.business_description.trim(),
      product_or_service: form.product_or_service.trim(),
      target_customer: form.target_customer.trim(),
      problem_solved: form.problem_solved.trim(),
      competitive_difference: form.competitive_difference.trim(),
      business_stage: form.business_stage,

      entrepreneurship_motivation:
        form.entrepreneurship_motivation.trim(),
      program_motivation: form.program_motivation.trim(),
      learning_goals: form.learning_goals.trim(),
      challenge_overcome: form.challenge_overcome.trim(),
      setback_response: form.setback_response,
      weekly_commitment: form.weekly_commitment,

      funding_plan: form.funding_plan.trim(),
      supplies_needed: form.supplies_needed.trim(),
      eight_week_goal: form.eight_week_goal.trim(),

      can_attend_weekly: form.can_attend_weekly,
      can_attend_showcase: form.can_attend_showcase,
      can_complete_assignments: form.can_complete_assignments,
      transportation_needs: form.transportation_needs.trim(),
      accommodation_needs: form.accommodation_needs.trim(),

      media_comfort: form.media_comfort,
      smartphone_access: form.smartphone_access,
      bonus_video_path: form.bonus_video_path || null,

      dream_business: form.dream_business.trim(),
      selection_case: form.selection_case.trim(),
      additional_information: form.additional_information.trim(),

      funding_agreement: form.funding_agreement,
      attendance_agreement: form.attendance_agreement,
      assignment_agreement: form.assignment_agreement,
      professionalism_agreement: form.professionalism_agreement,
      accuracy_agreement: form.accuracy_agreement,

      applicant_signature: form.applicant_signature.trim(),
      guardian_signature: form.guardian_signature.trim(),
      signature_date: form.signature_date || null,

      submitted_at:
        status === "submitted" ? new Date().toISOString() : null,
    };
  }

  async function saveDraft(showConfirmation = true) {
    if (!userId || isSubmitted) return false;

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("founder_applications")
      .upsert(applicationPayload("draft"), {
        onConflict: "applicant_id,cohort_name",
      })
      .select("id, status")
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return false;
    }

    setForm((current) => ({
      ...current,
      id: data.id,
      status: data.status,
    }));

    if (showConfirmation) {
      setMessage("Draft saved successfully.");
    }

    return true;
  }

  async function uploadVideo(file: File) {
    if (!userId || isSubmitted) return;

    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please upload an MP4, MOV, or WebM video.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setMessage("The video must be smaller than 100 MB.");
      return;
    }

    setUploadingVideo(true);
    setMessage("");

    const extension = file.name.split(".").pop() || "mp4";
    const path = `${userId}/bonus-video-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("founder-application-videos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    setUploadingVideo(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    update("bonus_video_path", path);
    setMessage("Bonus video uploaded. Save your draft to keep it attached.");
  }

  function validateFinalSubmission() {
    const requiredText = [
      form.full_name,
      form.email,
      form.age,
      form.grade_level,
      form.school_name,
      form.guardian_name,
      form.guardian_email,
      form.business_description,
      form.product_or_service,
      form.target_customer,
      form.program_motivation,
      form.funding_plan,
      form.eight_week_goal,
      form.selection_case,
      form.applicant_signature,
    ];

    if (requiredText.some((value) => !String(value).trim())) {
      return "Please complete every required field before submitting.";
    }

    if (
      !form.can_attend_weekly ||
      !form.can_attend_showcase ||
      !form.can_complete_assignments
    ) {
      return "Please confirm all three program commitments.";
    }

    if (
      !form.funding_agreement ||
      !form.attendance_agreement ||
      !form.assignment_agreement ||
      !form.professionalism_agreement ||
      !form.accuracy_agreement
    ) {
      return "Please accept every required agreement.";
    }

    return "";
  }

  async function submitApplication(event: FormEvent) {
    event.preventDefault();

    if (isSubmitted) return;

    const validationError = validateFinalSubmission();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("founder_applications")
      .upsert(applicationPayload("submitted"), {
        onConflict: "applicant_id,cohort_name",
      })
      .select("id, status")
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setForm((current) => ({
      ...current,
      id: data.id,
      status: data.status,
    }));

    setMessage(
      "Your application has been submitted. Welcome to the beginning of your founder journey!"
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function nextSection() {
    if (!isSubmitted) {
      await saveDraft(false);
    }

    setSection((current) =>
      Math.min(current + 1, SECTIONS.length - 1)
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousSection() {
    setSection((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#071713",
          color: "#fff8e8",
        }}
      >
        Loading your Founder application...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(245,170,48,.17), transparent 32%), #071713",
        color: "#fff8e8",
        padding: "34px 20px 80px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <form
        onSubmit={submitApplication}
        style={{ maxWidth: 920, margin: "0 auto" }}
      >
        <header style={{ marginBottom: 24 }}>
          <div
            style={{
              color: "#f5aa30",
              fontWeight: 1000,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              fontSize: 12,
            }}
          >
            The Playbook Series · Founder Academy
          </div>

          <h1
            style={{
              fontSize: "clamp(38px, 7vw, 68px)",
              lineHeight: 1,
              letterSpacing: -2.5,
              margin: "12px 0",
            }}
          >
            Apply for the
            <br />
            <span style={{ color: "#f5aa30" }}>
              $100 Startup Fellowship
            </span>
          </h1>

          <p
            style={{
              maxWidth: 700,
              color: "#b8c6bf",
              lineHeight: 1.65,
              fontSize: 17,
            }}
          >
            We are selecting five young entrepreneurs who are ready to
            turn an idea into a real business. We are looking for
            curiosity, commitment, coachability, creativity, and a
            willingness to take action.
          </p>
        </header>

        {isSubmitted && (
          <div
            style={{
              marginBottom: 20,
              padding: 18,
              borderRadius: 16,
              background: "rgba(74,222,128,.12)",
              border: "1px solid rgba(74,222,128,.35)",
              color: "#9af0b8",
              fontWeight: 800,
            }}
          >
            Application status: {form.status.replaceAll("_", " ")}
          </div>
        )}

        {message && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 14,
              background: "rgba(245,170,48,.13)",
              border: "1px solid rgba(245,170,48,.35)",
              color: "#ffd17d",
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            marginBottom: 21,
            padding: 8,
            borderRadius: 999,
            background: "rgba(255,255,255,.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              minHeight: 10,
              borderRadius: 999,
              background: "#f5aa30",
              transition: "width .25s ease",
            }}
          />
        </div>

        <section
          style={{
            padding: "30px clamp(20px, 5vw, 42px)",
            borderRadius: 28,
            background: "rgba(255,255,255,.055)",
            border: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div
            style={{
              color: "#f5aa30",
              fontSize: 12,
              fontWeight: 1000,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Section {section + 1} of {SECTIONS.length}
          </div>

          <h2 style={{ fontSize: 31, margin: "8px 0 24px" }}>
            {SECTIONS[section]}
          </h2>

          <fieldset
            disabled={isSubmitted}
            style={{
              display: "grid",
              gap: 19,
              padding: 0,
              margin: 0,
              border: 0,
            }}
          >
            {section === 0 && (
              <>
                <Field label="Full legal name" required>
                  <input
                    style={inputStyle}
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                  />
                </Field>

                <Field label="Preferred name">
                  <input
                    style={inputStyle}
                    value={form.preferred_name}
                    onChange={(e) =>
                      update("preferred_name", e.target.value)
                    }
                  />
                </Field>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: 18,
                  }}
                >
                  <Field label="Email" required>
                    <input
                      type="email"
                      style={inputStyle}
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </Field>

                  <Field label="Phone number">
                    <input
                      type="tel"
                      style={inputStyle}
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </Field>

                  <Field label="Age" required>
                    <select
                      style={inputStyle}
                      value={form.age}
                      onChange={(e) => update("age", e.target.value)}
                    >
                      <option value="">Select age</option>
                      {[13, 14, 15, 16, 17, 18].map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Grade" required>
                    <select
                      style={inputStyle}
                      value={form.grade_level}
                      onChange={(e) =>
                        update("grade_level", e.target.value)
                      }
                    >
                      <option value="">Select grade</option>
                      {[
                        "7th",
                        "8th",
                        "9th",
                        "10th",
                        "11th",
                        "12th",
                        "College",
                        "Other",
                      ].map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="School name" required>
                  <input
                    style={inputStyle}
                    value={form.school_name}
                    onChange={(e) =>
                      update("school_name", e.target.value)
                    }
                  />
                </Field>

                <Field label="City">
                  <input
                    style={inputStyle}
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </Field>

                <Field label="How did you hear about this opportunity?">
                  <select
                    style={inputStyle}
                    value={form.referral_organization}
                    onChange={(e) =>
                      update("referral_organization", e.target.value)
                    }
                  >
                    <option value="">Select organization</option>
                    <option value="Hidden Genius Project">
                      Hidden Genius Project
                    </option>
                    <option value="Bulletproof Group">
                      Bulletproof Group
                    </option>
                    <option value="The Playbook Series">
                      The Playbook Series
                    </option>
                    <option value="School">School</option>
                    <option value="Community Organization">
                      Community Organization
                    </option>
                    <option value="Friend or Family">
                      Friend or Family
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </>
            )}

            {section === 1 && (
              <>
                <p style={{ color: "#aebdb5", lineHeight: 1.6 }}>
                  Because this fellowship includes weekly coaching,
                  startup funding, and media activities, we need contact
                  information for a parent or guardian.
                </p>

                <Field label="Parent or guardian name" required>
                  <input
                    style={inputStyle}
                    value={form.guardian_name}
                    onChange={(e) =>
                      update("guardian_name", e.target.value)
                    }
                  />
                </Field>

                <Field label="Relationship to student">
                  <input
                    style={inputStyle}
                    value={form.guardian_relationship}
                    onChange={(e) =>
                      update("guardian_relationship", e.target.value)
                    }
                  />
                </Field>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 18,
                  }}
                >
                  <Field label="Parent or guardian email" required>
                    <input
                      type="email"
                      style={inputStyle}
                      value={form.guardian_email}
                      onChange={(e) =>
                        update("guardian_email", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Parent or guardian phone">
                    <input
                      type="tel"
                      style={inputStyle}
                      value={form.guardian_phone}
                      onChange={(e) =>
                        update("guardian_phone", e.target.value)
                      }
                    />
                  </Field>
                </div>
              </>
            )}

            {section === 2 && (
              <>
                <p style={{ color: "#aebdb5", lineHeight: 1.6 }}>
                  Your idea does not need to be perfect. We want to
                  understand what you are curious about and what you
                  want to build.
                </p>

                <Field label="Proposed business name">
                  <input
                    style={inputStyle}
                    value={form.business_name}
                    onChange={(e) =>
                      update("business_name", e.target.value)
                    }
                  />
                </Field>

                <Field
                  label="Describe your business idea in 2–3 sentences"
                  required
                >
                  <textarea
                    style={{ ...inputStyle, minHeight: 120 }}
                    value={form.business_description}
                    onChange={(e) =>
                      update("business_description", e.target.value)
                    }
                  />
                </Field>

                <Field
                  label="What product or service will you sell?"
                  required
                >
                  <textarea
                    style={{ ...inputStyle, minHeight: 100 }}
                    value={form.product_or_service}
                    onChange={(e) =>
                      update("product_or_service", e.target.value)
                    }
                  />
                </Field>

                <Field label="Who is your ideal customer?" required>
                  <textarea
                    style={{ ...inputStyle, minHeight: 100 }}
                    value={form.target_customer}
                    onChange={(e) =>
                      update("target_customer", e.target.value)
                    }
                  />
                </Field>

                <Field label="What problem does your business solve?">
                  <textarea
                    style={{ ...inputStyle, minHeight: 100 }}
                    value={form.problem_solved}
                    onChange={(e) =>
                      update("problem_solved", e.target.value)
                    }
                  />
                </Field>

                <Field label="Why would customers choose your business?">
                  <textarea
                    style={{ ...inputStyle, minHeight: 100 }}
                    value={form.competitive_difference}
                    onChange={(e) =>
                      update(
                        "competitive_difference",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field label="How far along is your business?">
                  <select
                    style={inputStyle}
                    value={form.business_stage}
                    onChange={(e) =>
                      update("business_stage", e.target.value)
                    }
                  >
                    <option value="">Select stage</option>
                    <option value="Idea only">I only have an idea</option>
                    <option value="Research">
                      I have completed some research
                    </option>
                    <option value="Planning">
                      I have started planning
                    </option>
                    <option value="Prototype">
                      I have created a prototype
                    </option>
                    <option value="Sales">
                      I have already made sales
                    </option>
                  </select>
                </Field>
              </>
            )}

            {section === 3 && (
              <>
                <Field label="Why do you want to become an entrepreneur?">
                  <textarea
                    style={{ ...inputStyle, minHeight: 110 }}
                    value={form.entrepreneurship_motivation}
                    onChange={(e) =>
                      update(
                        "entrepreneurship_motivation",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field
                  label="Why do you want to participate in this fellowship?"
                  required
                >
                  <textarea
                    style={{ ...inputStyle, minHeight: 120 }}
                    value={form.program_motivation}
                    onChange={(e) =>
                      update("program_motivation", e.target.value)
                    }
                  />
                </Field>

                <Field label="What do you hope to learn?">
                  <textarea
                    style={{ ...inputStyle, minHeight: 100 }}
                    value={form.learning_goals}
                    onChange={(e) =>
                      update("learning_goals", e.target.value)
                    }
                  />
                </Field>

                <Field label="Tell us about a challenge you overcame.">
                  <textarea
                    style={{ ...inputStyle, minHeight: 120 }}
                    value={form.challenge_overcome}
                    onChange={(e) =>
                      update("challenge_overcome", e.target.value)
                    }
                  />
                </Field>

                <Field label="When something does not work, what do you usually do?">
                  <select
                    style={inputStyle}
                    value={form.setback_response}
                    onChange={(e) =>
                      update("setback_response", e.target.value)
                    }
                  >
                    <option value="">Select response</option>
                    <option value="Try again">Try again</option>
                    <option value="Ask for help">Ask for help</option>
                    <option value="Find another solution">
                      Find another solution
                    </option>
                    <option value="Reflect and adjust">
                      Reflect and adjust
                    </option>
                    <option value="Depends on the situation">
                      It depends on the situation
                    </option>
                  </select>
                </Field>

                <Field label="How many hours per week can you commit?">
                  <select
                    style={inputStyle}
                    value={form.weekly_commitment}
                    onChange={(e) =>
                      update("weekly_commitment", e.target.value)
                    }
                  >
                    <option value="">Select commitment</option>
                    <option value="1–2 hours">1–2 hours</option>
                    <option value="3–5 hours">3–5 hours</option>
                    <option value="5–7 hours">5–7 hours</option>
                    <option value="8+ hours">8+ hours</option>
                  </select>
                </Field>
              </>
            )}

            {section === 4 && (
              <>
                <p style={{ color: "#aebdb5", lineHeight: 1.6 }}>
                  Selected Fellows may receive up to $100 in approved
                  startup expenses. Tell us how you would use those
                  resources responsibly.
                </p>

                <Field
                  label="How would you invest the $100 into your business?"
                  required
                >
                  <textarea
                    style={{ ...inputStyle, minHeight: 135 }}
                    value={form.funding_plan}
                    onChange={(e) =>
                      update("funding_plan", e.target.value)
                    }
                  />
                </Field>

                <Field label="What supplies, equipment, or tools would you need?">
                  <textarea
                    style={{ ...inputStyle, minHeight: 120 }}
                    value={form.supplies_needed}
                    onChange={(e) =>
                      update("supplies_needed", e.target.value)
                    }
                  />
                </Field>

                <Field
                  label="What is your goal by the end of eight weeks?"
                  required
                >
                  <textarea
                    style={{ ...inputStyle, minHeight: 120 }}
                    value={form.eight_week_goal}
                    onChange={(e) =>
                      update("eight_week_goal", e.target.value)
                    }
                  />
                </Field>
              </>
            )}

            {section === 5 && (
              <>
                {[
                  [
                    "can_attend_weekly",
                    "I can attend the required weekly coaching sessions.",
                  ],
                  [
                    "can_attend_showcase",
                    "I can attend and participate in the Final Showcase.",
                  ],
                  [
                    "can_complete_assignments",
                    "I can complete the required weekly activities and assignments.",
                  ],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: 16,
                      borderRadius: 14,
                      background: "rgba(255,255,255,.045)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        form[key as keyof ApplicationForm] as boolean
                      }
                      onChange={(e) =>
                        update(
                          key as
                            | "can_attend_weekly"
                            | "can_attend_showcase"
                            | "can_complete_assignments",
                          e.target.checked
                        )
                      }
                    />
                    <span style={{ fontWeight: 800 }}>{label}</span>
                  </label>
                ))}

                <Field label="Describe any transportation support you may need.">
                  <textarea
                    style={{ ...inputStyle, minHeight: 100 }}
                    value={form.transportation_needs}
                    onChange={(e) =>
                      update("transportation_needs", e.target.value)
                    }
                  />
                </Field>

                <Field label="Describe any accommodations or other support you may need.">
                  <textarea
                    style={{ ...inputStyle, minHeight: 100 }}
                    value={form.accommodation_needs}
                    onChange={(e) =>
                      update("accommodation_needs", e.target.value)
                    }
                  />
                </Field>
              </>
            )}

            {section === 6 && (
              <>
                <p style={{ color: "#aebdb5", lineHeight: 1.6 }}>
                  Entrepreneurship is about the journey—not just the
                  destination. Students may document parts of their
                  experience through short videos and photos.
                </p>

                <Field label="Are you comfortable being photographed or recorded?">
                  <select
                    style={inputStyle}
                    value={form.media_comfort}
                    onChange={(e) =>
                      update("media_comfort", e.target.value)
                    }
                  >
                    <option value="">Select response</option>
                    <option value="Yes">Yes</option>
                    <option value="Maybe">
                      Maybe—I would like more information
                    </option>
                    <option value="No">No</option>
                  </select>
                </Field>

                <Field label="Do you have access to a smartphone for short video assignments?">
                  <select
                    style={inputStyle}
                    value={form.smartphone_access}
                    onChange={(e) =>
                      update("smartphone_access", e.target.value)
                    }
                  >
                    <option value="">Select response</option>
                    <option value="Yes">Yes</option>
                    <option value="Sometimes">Sometimes</option>
                    <option value="No">No</option>
                  </select>
                </Field>

                <Field label="Optional 60–90 second bonus video">
                  <div
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      border: "1px dashed rgba(245,170,48,.5)",
                      background: "rgba(245,170,48,.06)",
                    }}
                  >
                    <p
                      style={{
                        color: "#c7d3cd",
                        lineHeight: 1.6,
                        marginTop: 0,
                      }}
                    >
                      Introduce yourself, explain the business you want
                      to start, and tell us why you should be selected.
                      We are not judging video-production quality.
                    </p>

                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      disabled={uploadingVideo || isSubmitted}
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          void uploadVideo(file);
                        }
                      }}
                    />

                    {uploadingVideo && (
                      <p style={{ color: "#ffc867" }}>
                        Uploading video...
                      </p>
                    )}

                    {form.bonus_video_path && (
                      <p style={{ color: "#8be1a7" }}>
                        ✓ Bonus video attached
                      </p>
                    )}
                  </div>
                </Field>

                <Field label="If you had unlimited funding, what business would you build?">
                  <textarea
                    style={{ ...inputStyle, minHeight: 110 }}
                    value={form.dream_business}
                    onChange={(e) =>
                      update("dream_business", e.target.value)
                    }
                  />
                </Field>

                <Field
                  label="Why should you be one of the five selected Fellows?"
                  required
                >
                  <textarea
                    style={{ ...inputStyle, minHeight: 140 }}
                    value={form.selection_case}
                    onChange={(e) =>
                      update("selection_case", e.target.value)
                    }
                  />
                </Field>

                <Field label="Is there anything else you want us to know?">
                  <textarea
                    style={{ ...inputStyle, minHeight: 100 }}
                    value={form.additional_information}
                    onChange={(e) =>
                      update(
                        "additional_information",
                        e.target.value
                      )
                    }
                  />
                </Field>
              </>
            )}

            {section === 7 && (
              <>
                <p style={{ color: "#aebdb5", lineHeight: 1.6 }}>
                  Review each statement carefully. Your printed name
                  serves as your electronic signature.
                </p>

                {[
                  [
                    "funding_agreement",
                    "I understand startup funding is limited to approved business expenses.",
                  ],
                  [
                    "attendance_agreement",
                    "I agree to attend required coaching sessions.",
                  ],
                  [
                    "assignment_agreement",
                    "I agree to complete required fellowship assignments.",
                  ],
                  [
                    "professionalism_agreement",
                    "I agree to represent myself, my school, and my organization professionally.",
                  ],
                  [
                    "accuracy_agreement",
                    "I certify that the information in this application is accurate.",
                  ],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: 15,
                      borderRadius: 14,
                      background: "rgba(255,255,255,.045)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        form[key as keyof ApplicationForm] as boolean
                      }
                      onChange={(e) =>
                        update(
                          key as
                            | "funding_agreement"
                            | "attendance_agreement"
                            | "assignment_agreement"
                            | "professionalism_agreement"
                            | "accuracy_agreement",
                          e.target.checked
                        )
                      }
                    />
                    <span style={{ lineHeight: 1.45 }}>{label}</span>
                  </label>
                ))}

                <Field
                  label="Student printed name — electronic signature"
                  required
                >
                  <input
                    style={inputStyle}
                    value={form.applicant_signature}
                    onChange={(e) =>
                      update("applicant_signature", e.target.value)
                    }
                  />
                </Field>

                <Field label="Parent or guardian printed name — electronic signature">
                  <input
                    style={inputStyle}
                    value={form.guardian_signature}
                    onChange={(e) =>
                      update("guardian_signature", e.target.value)
                    }
                  />
                </Field>

                <Field label="Signature date">
                  <input
                    type="date"
                    style={inputStyle}
                    value={form.signature_date}
                    onChange={(e) =>
                      update("signature_date", e.target.value)
                    }
                  />
                </Field>
              </>
            )}
          </fieldset>
        </section>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={previousSection}
            disabled={section === 0}
            style={{
              padding: "13px 18px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.17)",
              background: "transparent",
              color: "#fff8e8",
              fontWeight: 900,
              cursor: section === 0 ? "not-allowed" : "pointer",
              opacity: section === 0 ? 0.4 : 1,
            }}
          >
            ← Previous
          </button>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {!isSubmitted && (
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={saving}
                style={{
                  padding: "13px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(245,170,48,.45)",
                  background: "rgba(245,170,48,.1)",
                  color: "#ffc867",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>
            )}

            {section < SECTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => void nextSection()}
                style={{
                  padding: "13px 20px",
                  borderRadius: 12,
                  border: 0,
                  background: "#f5aa30",
                  color: "#102019",
                  fontWeight: 1000,
                  cursor: "pointer",
                }}
              >
                Save & Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving || isSubmitted}
                style={{
                  padding: "13px 22px",
                  borderRadius: 12,
                  border: 0,
                  background: isSubmitted ? "#4b5b53" : "#f5aa30",
                  color: isSubmitted ? "#b9c4be" : "#102019",
                  fontWeight: 1000,
                  cursor: isSubmitted ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitted
                  ? "Application Submitted"
                  : saving
                  ? "Submitting..."
                  : "Submit Application 🚀"}
              </button>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
