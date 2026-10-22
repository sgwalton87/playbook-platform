"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  getRoleDestination,
  requirePlaybookRole,
  type PlaybookRole,
} from "@/lib/roles/registry";

/** UI boundary only: backend authorization and RLS must separately enforce ownership. */
export default function CanonicalRoleIdentityBoundary({
  role, children,
}: { role: PlaybookRole; children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    async function check() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!live) return;
      if (authError || !auth.user) {
        router.replace("/login");
        return;
      }
      const result = await supabase.from("profiles")
        .select("role,profile_mode,onboarding_completed")
        .eq("id", auth.user.id).maybeSingle();
      if (!live) return;
      if (result.error || !result.data) {
        setError("Account role could not be verified. Protected content remains unavailable.");
        return;
      }
      let actual: PlaybookRole;
      try {
        actual = requirePlaybookRole(result.data.profile_mode ?? result.data.role);
      } catch {
        setError("Your account role needs verification before protected content can open.");
        return;
      }
      if (actual !== role) {
        router.replace(getRoleDestination(actual));
        return;
      }
      if (!result.data.onboarding_completed) {
        router.replace(`/start?first=1&role=${encodeURIComponent(actual)}`);
        return;
      }
      setAllowed(true);
    }
    void check();
    return () => { live = false; };
  }, [role, router]);

  if (error) return <main role="alert" style={{ padding: 32 }}>{error}</main>;
  if (!allowed) return <main style={{ padding: 32 }}>Verifying your Playbook role…</main>;
  return <>{children}</>;
}
