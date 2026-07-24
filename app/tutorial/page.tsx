"use client";

import { useEffect, useState } from "react";
import OnboardingTour from "@/components/tutorial/OnboardingTour";
import { supabase } from "@/lib/supabaseClient";
import { getPostOnboardingDestination, withTutorialComplete, type TutorialProfile } from "@/lib/tutorial";

export default function TutorialPage() {
  const [profile, setProfile] = useState<TutorialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id,onboarding_completed,onboarding_data,profile_mode,role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!data?.onboarding_completed) {
        window.location.href = "/start";
        return;
      }

      const nextProfile = data as TutorialProfile;
      if (nextProfile.onboarding_data?.tutorial_completed) {
        window.location.href = getPostOnboardingDestination(nextProfile);
        return;
      }

      setProfile(nextProfile);
      setLoading(false);
    }

    load();
  }, []);

  async function completeTutorial() {
    if (!profile || saving) return;

    setSaving(true);
    const onboardingData = withTutorialComplete(profile.onboarding_data);
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_data: onboardingData })
      .eq("id", profile.id || "");

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    window.location.href = getPostOnboardingDestination({ ...profile, onboarding_data: onboardingData });
  }

  if (loading) return <main style={{ padding: 40 }}>Loading tutorial...</main>;

  return <OnboardingTour onComplete={completeTutorial} saving={saving} />;
}
