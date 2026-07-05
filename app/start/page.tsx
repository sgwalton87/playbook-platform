"use client";

import CoreJourneyDashboard from "@/components/core-journey/CoreJourneyDashboard";

export default function StartPage() {
  return (
    <CoreJourneyDashboard
      statuses={{
        record: "in_progress",
        transcript: "needs_attention",
        "academic-readiness": "not_started",
        "scholar-athlete": "not_started",
        opportunities: "not_started",
        applications: "not_started",
        support: "in_progress",
        courses: "in_progress",
        rewards: "in_progress",
      }}
    />
  );
}
