"use client";

import { PlaybookQuote } from "@/components/brand-story";
import { PLAYBOOK_QUOTES } from "@/lib/brand-story";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CoreJourneyDashboard from "@/components/core-journey/CoreJourneyDashboard";

export default function StartPage() {
  const [statuses, setStatuses] = useState<any>({
    record: "in_progress",
    transcript: "not_started",
    "academic-readiness": "not_started",
    "scholar-athlete": "not_started",
    opportunities: "not_started",
    applications: "not_started",
    support: "in_progress",
    courses: "in_progress",
    rewards: "in_progress",
  });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;

      const { data: ag } = await supabase
        .from("ag_progress")
        .select("subject,years_completed,years_required")
        .eq("user_id", userId);

      const rows = ag || [];
      const hasTranscript = rows.length > 0;
      const met = rows.filter(
        (r: any) => Number(r.years_completed || 0) >= Number(r.years_required || 0)
      ).length;

      setStatuses({
        record: "in_progress",
        transcript: hasTranscript ? "complete" : "needs_attention",
        "academic-readiness":
          met >= 7 ? "complete" : hasTranscript ? "needs_attention" : "not_started",
        "scholar-athlete": "in_progress",
        opportunities: met >= 7 ? "ready" : "needs_attention",
        applications: met >= 7 ? "ready" : "in_progress",
        support: "in_progress",
        courses: "in_progress",
        rewards: "in_progress",
      });
    }

    load();
  }, []);

  return <CoreJourneyDashboard statuses={statuses} />;
}
