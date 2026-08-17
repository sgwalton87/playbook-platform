"use client";

import { useEffect, useState } from "react";
import ScholarDashboardExperience from "@/components/dashboard/ScholarDashboardExperience";
import { CanonicalRoleAuthorityGate } from "@/components/role-os/RoleAuthorityGate";
import { buildScholarRecord } from "@/lib/scholar";
import type { ScholarRecord } from "@/lib/scholar";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  return (
    <CanonicalRoleAuthorityGate role="scholar">
      <ScholarDashboardRecord />
    </CanonicalRoleAuthorityGate>
  );
}

function ScholarDashboardRecord() {
  const [record, setRecord] = useState<ScholarRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadScholarRecord() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;

      if (authError || !auth.user) {
        setLoadError("Your Scholar Record could not be loaded. Please sign in again.");
        setLoading(false);
        return;
      }

      const [{ data: profile, error: profileError }, { data: agProgress, error: progressError }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", auth.user.id).single(),
        supabase.from("ag_progress").select("*").eq("user_id", auth.user.id).order("updated_at", { ascending: false }),
      ]);

      if (!active) return;

      if (profileError || progressError) {
        setLoadError("Your latest Scholar Record is temporarily unavailable. Your saved data has not been changed.");
        setLoading(false);
        return;
      }

      setRecord(buildScholarRecord({ profile, agProgress: agProgress || [] }));
      setLoading(false);
    }

    void loadScholarRecord();
    return () => { active = false; };
  }, []);

  return <ScholarDashboardExperience record={record} loading={loading} loadError={loadError} />;
}
