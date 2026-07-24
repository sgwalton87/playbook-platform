"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { normalizeRole } from "@/lib/onboarding/pathwayMap";
import { getPostOnboardingDestination } from "@/lib/tutorial";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Confirming...</main>}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const params = useSearchParams();

  useEffect(() => {
    async function finishAuth() {
      const tokenHash = params.get("token_hash");
      const type = params.get("type") || "email";

      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as LegacyValue,
        });

        if (error) {
          console.error("Auth token verification failed:", error.message);
          window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
          return;
        }
      } else {
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Auth callback exchange failed:", error.message);
            window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
            return;
          }
        }
      }

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        window.location.href = "/login";
        return;
      }

      const role = normalizeRole(
        data.user.user_metadata?.profile_mode ||
        data.user.user_metadata?.role ||
        data.user.user_metadata?.requested_role ||
        "scholar"
      );

      const { data: existing } = await supabase
        .from("profiles")
        .select("id,onboarding_completed,onboarding_data,profile_mode,role")
        .eq("id", data.user.id)
        .maybeSingle();

      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          role: role,
          profile_mode: role,
          requested_role: role,
          verification_status: "email_confirmed",
          onboarding_completed: existing?.onboarding_completed || false,
        },
        { onConflict: "id" }
      );

      if (existing?.onboarding_completed) {
        window.location.href = getPostOnboardingDestination(existing);
      } else {
        window.location.href = `/start?first=1&role=${encodeURIComponent(role)}`;
      }
    }

    finishAuth();
  }, [params]);

  return (
    <main style={{ padding: 40 }}>
      Confirming your email and opening your Playbook...
    </main>
  );
}
