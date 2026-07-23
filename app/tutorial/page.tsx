"use client";

import { Suspense } from "react";
import OnboardingTour from "@/components/tutorial/OnboardingTour";

export default function TutorialPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Preparing your Playbook tutorial…</main>}>
      <OnboardingTour />
    </Suspense>
  );
}
